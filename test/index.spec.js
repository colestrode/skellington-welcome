'use strict';

let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('Welcome', () => {
  let controllerMock;
  let listenersMock;
  let dmMessage;
  let plugin;

  beforeEach(() => {
    controllerMock = {
      on: sinon.stub(),
      hears: sinon.stub()
    };

    dmMessage = 'heisenberg';
    listenersMock = {dmMessage: sinon.stub().returns(dmMessage)};

    plugin = proxyquire('../index', {
      './lib/listeners': listenersMock
    });
  });

  it('should export a function that returns help and init', () => {
    expect(plugin).to.be.a('function');

    let result = plugin();

    expect(plugin()).to.have.keys(['init', 'help']);
    expect(result.help).to.have.keys(['command', 'text']);
  });

  it('should register listeners', () => {
    let text = 'I am the one who knocks';
    let exportedBot = plugin({text: text});

    exportedBot.init(controllerMock);

    expect(listenersMock.dmMessage).to.be.calledTwice;
    expect(listenersMock.dmMessage.alwaysCalledWith({text: text})).to.be.true;

    expect(controllerMock.on).to.have.been.calledWith('team_join', dmMessage);
    expect(controllerMock.hears).to.have.been.calledWith('^welcome( message)?$', 'direct_message', dmMessage);
  });

});
