'use strict';

let listeners = require('./lib/listeners');

module.exports = function(config) {
  return {
    init: init,
    help: {
      command: 'welcome',
      text: 'DM me with `welcome` and I\'ll show you the welcome message again.'
    }
  };

  function init(controller) {
    controller.on('team_join', listeners.dmMessage(config));
    controller.hears('^welcome( message)?$', 'direct_message', listeners.dmMessage(config));
  }
};
