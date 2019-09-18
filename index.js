#! /usr/bin/env node

const qs = require('querystring');
const crypto = require('crypto');
const axios = require('axios');
const chalk = require('chalk');

const sha256 = crypto.createHash('sha256');
const log = console.log;

function truncate(q) {
  var len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

function fy() {
  const [, , ...argv] = process.argv;
  const salt = Date.now();
  const curtime = Math.round(salt / 1000);
  const argsStr = argv.join(' ');
  const APP_KEY = '6352bac0dedbf9e7';
  const SEC_KEY = '2bHmZHOz68od40aqJCD8KmjvEA1ovAkg';
  const params = {
    q: argsStr,
    appKey: APP_KEY,
    salt: salt,
    from: 'auto',
    to: 'auto',
    signType: "v3",
    sign: sha256.update(`${APP_KEY}${truncate(argsStr)}${salt}${curtime}${SEC_KEY}`).digest('hex'),
    curtime,
  }
  axios.post(`https://openapi.youdao.com/api`, qs.stringify(params)).then(res => {
    const data = res.data;
    if (data.errorCode === '0') {
      const { web, basic, translation = [], l } = data;
      log(chalk.yellow(`"${argsStr}" 的翻译结果：`))
      log('---------------------------------')
      if (l === 'en2zh-CHS') {
        if (basic) {
          log(chalk.cyan('音标：'), `英[${basic['uk-phonetic'] || '无'}]  美[${basic['us-phonetic'] || '无'}]`);
          log('---------------------------------')
          log(chalk.cyan('基本解释：'))
          basic.explains.forEach(item => { log(item) })
          log('---------------------------------')
          if (basic.wfs) {
            let wf = '';
            basic.wfs.forEach(item => {
              wf += item.wf.name + '：' + item.wf.value + '；';
            })
            log(wf);
            log('---------------------------------')
          }
        } else {
          log(translation.join());
        }
        if (web) {
          log(chalk.cyan('相关翻译：'));
          web.forEach(item => {
            log(`${item.key}: ${item.value.join('，')}`);
          })
        }
      } else {
        if (basic && basic.explains) {
          log(chalk.cyan('基本翻译：'));
          log(basic.explains.join('，'));
          log('---------------------------------')
        } else {
          log(translation.join());
        }
        if (web) {
          log(chalk.cyan('相关翻译：'));
          web.forEach(item => {
            log(`${item.key}: ${item.value.join('，')}`);
          })
        }
      }
    }
  }).catch(err => {
    log(err);
  })
}

fy();
