'use strict';

let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');

chai.use(require('sinon-chai'));

describe('listeners', function() {
  let botMock;
  let messageMock;
  let openResult;
  let error;
  let listeners;

  beforeEach(function() {
    error = new Error('GUSFRING');

    openResult = {
      channel: {
        id: 'AMC'
      }
    };

    botMock = {
      api: {
        im: {
          open: sinon.stub().yields(null, openResult)
        },
        chat: {
          postMessage: sinon.stub().yields(null)
        }
      }
    };

    messageMock = {
      user: 'heisenberg'
    };

    sinon.spy(console, 'log');

    listeners = require('../../lib/listeners');
  });

  afterEach(() => {
    console.log.restore();
  });

  describe('dmMessage', function() {
    let text;

    beforeEach(function() {
      text = 'I am the danger';
    });

    it('should return a function', function() {
      expect(listeners.dmMessage(text)).to.be.a('function');
    });

    describe('handler', function() {
      let callback;

      beforeEach(function() {
        callback = listeners.dmMessage(text);
      });

      it('should open a dm and post welcome message', function() {
        return callback(botMock, messageMock)
          .then(() => {
            expect(botMock.api.im.open).to.have.been.calledWith({user: 'heisenberg'});
            expect(botMock.api.chat.postMessage).to.have.been.calledWith({
              text: text,
              channel: 'AMC',
              'unfurl_links': false,
              'as_user': true
            });
            expect(console.log).not.to.have.been.called;
          });
      });

      it('should handle nested userId', function() {
        messageMock = {
          user: {
            id: 'heisenberg'
          }
        };

        return callback(botMock, messageMock)
          .then(() => {
            expect(botMock.api.im.open).to.have.been.calledWith({user: 'heisenberg'});
            expect(botMock.api.chat.postMessage).to.have.been.called;
            expect(console.log).not.to.have.been.called;
          });
      });

      it('should log an error if opening DM fails', function() {
        botMock.api.im.open.yields(error);

        return callback(botMock, messageMock)
          .then(() => {
            throw new Error('expected to fail');
          })
          .catch(() => {
            expect(botMock.api.im.open).to.have.been.called;
            expect(botMock.api.chat.postMessage).not.to.have.been.called;
            expect(console.log).to.have.been.calledWith(error);
          });
      });

      it('should log an error if posting message fails', function() {
        botMock.api.chat.postMessage.yields(error);

        return callback(botMock, messageMock)
          .then(() => {
            throw new Error('expected to fail');
          })
          .catch(() => {
            expect(botMock.api.im.open).to.have.been.called;
            expect(botMock.api.chat.postMessage).to.have.been.called;
            expect(console.log).to.have.been.calledWith(error);
          });
      });
    });
  });
});
