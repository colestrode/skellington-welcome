# skellington-welcome
[![Build Status](https://travis-ci.org/colestrode/skellington-welcome.svg?branch=master)](https://travis-ci.org/colestrode/skellington-welcome)
[![Coverage Status](https://coveralls.io/repos/github/colestrode/skellington-welcome/badge.svg?branch=master)](https://coveralls.io/github/colestrode/skellington-welcome?branch=master)

A Skellington plugin to DM a user with a welcome message.

## Usage

Initialize the plugin with a config containing your welcome text:

```js
require('skellington')({
  plugins: [
    require('skellington-welcome')({text: 'Welcome to our awesome Slack team!'})
  ]}
);
```

## Help

Just DM your bot with `welcome` and it will reply with the welcome text.
