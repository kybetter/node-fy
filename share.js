const crypto = require('crypto');
const axios = require('axios');

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function truncate(q) {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

exports.baiduSign = function (appid, key, query, salt) {
  return md5(`${appid}${query}${salt}${key}`);
}

exports.youdaoSign = function (appKey, secKey, query, salt, curtime) {
  return sha256(`${appKey}${truncate(query)}${salt}${curtime}${secKey}`);
}

exports.post = function (api, param) {
  return axios.post(api, param);
}
