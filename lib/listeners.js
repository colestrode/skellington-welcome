'use strict';

let listeners = module.exports;
let q = require('q');

listeners.dmMessage = function(config) {
  return function(bot, message) {
    let openDm = q.nbind(bot.api.im.open, bot.api.im);

    let userId = message.user;

    // team_join events set the userId as the user property
    if (userId.id) {
      userId = userId.id;
    }

    return openDm({user: userId})
      .then(res => {
        let channel = res.channel.id;

        if (config.type && config.type.toLowerCase() === 'post') {
          return filUploadMessage(bot, channel, config);
        }

        return plainTextMessage(bot, channel, config);
      })
      .catch(err => {
        console.log(err);
      });
  }
};

function plainTextMessage(bot, channel, config) {
  let postMessage = q.nbind(bot.api.chat.postMessage, bot.api.chat);

  return postMessage({
    text: config.text,
    channel: channel,
    unfurl_links: false,
    as_user: true
  });
}

function filUploadMessage(bot, channel, config) {
  let filesUpload = q.nbind(bot.api.files.upload, bot.api.files);
  let title = config.title || 'Welcome';

  return filesUpload({
    filetype: 'post',
    filename: title,
    title: title,
    content: config.text,
    channels: channel
  });
}