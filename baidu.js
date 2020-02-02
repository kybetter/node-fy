const path = require('path');
const configPath = path.resolve(process.env.HOME, 'fy', 'config.json');
const { baiduSign } = require('./share');
const { baidu } = require(configPath);
const { appid, key } = baidu;

module.exports = function (query) {
  const salt = Date.now();
  const sign = baiduSign(appid, key, query, salt);
  return {
    q: query,
    appid,
    salt,
    from: "auto",
    to: "auto",
    sign
  }
}