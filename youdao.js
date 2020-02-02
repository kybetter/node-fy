const path = require('path');
const configPath = path.resolve(process.env.HOME, 'fy', 'config.json');

const { youdaoSign } = require('./share');
const { youdao } = require(configPath);
const { appKey, secKey } = youdao;

const en = 'en';
const zh = 'zh-CHS';

module.exports = function (query) {
  const salt = Date.now();
  const curtime = Math.round(salt / 1000);
  const isAlpha = /[\w'".,]/.test(query);
  return {
    q: query,
    appKey,
    salt,
    from: isAlpha ? en : zh,
    to: isAlpha ? zh : en,
    signType: "v3",
    sign: youdaoSign(appKey, secKey, query, salt, curtime),
    curtime,
  }
}