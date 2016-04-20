'use strict';

let listeners = module.exports;
let q = require('q');

listeners.dmMessage = function(text) {
  return function(bot, message) {
    let openDm = q.nbind(bot.api.im.open, bot.api.im);
    let postMessage = q.nbind(bot.api.chat.postMessage, bot.api.chat);
    let userId = message.user;

    // team_join events set the userId as the user property
    if (userId.id) {
      userId = userId.id;
    }

    return openDm({user: userId})
      .then(res => {
        let messageOpts = {
          text: text,
          channel: res.channel.id,
          unfurl_links: false,
          as_user: true
        };

        return postMessage(messageOpts);
      })
      .catch(err => {
        console.log(err);
      });
  }
};