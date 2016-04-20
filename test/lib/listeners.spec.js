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
        chat: {
          postMessage: sinon.stub().yields(null)
        },
        files: {
          upload: sinon.stub().yields(null)
        },
        im: {
          open: sinon.stub().yields(null, openResult)
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
    let config;

    beforeEach(function() {
      text = 'I am the danger';
      config = {text: text};
    });

    it('should return a function', function() {
      expect(listeners.dmMessage(config)).to.be.a('function');
    });

    describe('plain text', function() {
      let callback;

      beforeEach(function() {
        callback = listeners.dmMessage(config);
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
            expect(botMock.api.files.upload).not.to.have.been.called;
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

    describe('upload file', function() {
      let callback;

      beforeEach(function() {
        config.type = 'post';

        callback = listeners.dmMessage(config);
      });

      it('should open a dm and post welcome message file', function() {
        return callback(botMock, messageMock)
          .then(() => {
            expect(botMock.api.im.open).to.have.been.calledWith({user: 'heisenberg'});
            expect(botMock.api.chat.postMessage).not.to.have.been.called;
            expect(botMock.api.files.upload).to.have.been.calledWith({
              filetype: 'post',
              filename: 'Welcome',
              title: 'Welcome',
              content: config.text,
              channels: 'AMC'
            });

            expect(console.log).not.to.have.been.called;
          });
      });

      it('should do a case-insensitive match on type', function() {
        config.type = 'PoSt';

        callback = listeners.dmMessage(config);
        return callback(botMock, messageMock)
          .then(() => {
            expect(botMock.api.im.open).to.have.been.calledWith({user: 'heisenberg'});
            expect(botMock.api.chat.postMessage).not.to.have.been.called;
            expect(botMock.api.files.upload).to.have.been.called;
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
            expect(botMock.api.chat.postMessage).not.to.have.been.called;
            expect(botMock.api.files.upload).to.have.been.called;
            expect(console.log).not.to.have.been.called;
          });
      });

      it('should configure title', function() {
        config.title = 'Breaking Bad';
        callback = listeners.dmMessage(config);

        return callback(botMock, messageMock)
          .then(() => {
            expect(botMock.api.im.open).to.have.been.calledWith({user: 'heisenberg'});
            expect(botMock.api.chat.postMessage).not.to.have.been.called;
            expect(botMock.api.files.upload).to.have.been.calledWithMatch({
              filename: 'Breaking Bad',
              title: 'Breaking Bad'
            });

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
            expect(botMock.api.files.upload).not.to.have.been.called;
            expect(console.log).to.have.been.calledWith(error);
          });
      });

      it('should log an error if uploading file fails', function() {
        botMock.api.files.upload.yields(error);

        return callback(botMock, messageMock)
          .then(() => {
            throw new Error('expected to fail');
          })
          .catch(() => {
            expect(botMock.api.im.open).to.have.been.called;
            expect(botMock.api.chat.postMessage).not.to.have.been.called;
            expect(botMock.api.files.upload).to.have.been.called;
            expect(console.log).to.have.been.calledWith(error);
          });
      });
    });
  });
});
