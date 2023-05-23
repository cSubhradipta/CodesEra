const moment = require('moment');

function formatMessage(username, useremail, text) {
  return {
    username,
    useremail,
    text,
    time: moment().format('h:mm A')
  };
}
module.exports = formatMessage;