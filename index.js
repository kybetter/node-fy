#! /usr/bin/env node

const http = require('http');
const qs = require('querystring');
const crypto = require('crypto');

const md5 = crypto.createHash('md5');
const argv = process.argv;
const argsStr = argv.filter((res, idx) => idx > 1).map(argv => argv).join(' ');

const data = {
  q: argsStr,
  appKey: '6352bac0dedbf9e7',
  salt: 'test',
  from: 'auto',
  to: 'auto'
};
const SEC_KEY = '2bHmZHOz68od40aqJCD8KmjvEA1ovAkg';
data.sign = md5.update(`${data.appKey}${data.q}${data.salt}${SEC_KEY}`).digest('hex');
const content = qs.stringify(data);
const options = {
  hostname: 'openapi.youdao.com',
  path: `/api?${content}`,
  method: 'GET',
};
const req = http.request(options, res => {
  res.setEncoding('utf8');
  let bodyData = '';
  res.on('data', chunk => {
    bodyData += chunk;
  });
  res.on('end', () => {
    const data = JSON.parse(bodyData);
    const {web, basic, translation, l} = data;

    console.log(argsStr);
    console.log('---------------------------------');
    if (l === 'EN2zh-CHS') {
      if (basic) {
        console.log(`英[${basic['uk-phonetic'] || '无'}]  美[${basic['us-phonetic'] || '无'}]`);
        console.log('---------------------------------');
        basic.explains.forEach(item => {
          console.log(item);
        })
        console.log('---------------------------------');
        if (basic.wfs) {
          let wf = [];
          basic.wfs.forEach(item => {
            wf.push(item.wf.name)
            wf.push(item.wf.value)
          })
          console.log(`[${wf.join(' ')}]`);
          console.log('---------------------------------');
        }
      } else {
        console.log(translation.join());
        console.log('---------------------------------');
      }
      if (web) {
        console.log('短语');
        web.forEach(item => {
          console.log(`${item.key}: ${item.value.join('，')}`);
        })
        console.log('---------------------------------');
      }
    } else {
      if (basic && basic.explains) {
        console.log(basic.explains.join(', '));
        console.log('---------------------------------');
      } else {
        console.log(translation.join());
        console.log('---------------------------------');
      }
      if (web) {
        console.log('短语');
        web.forEach(item => {
          console.log(`${item.key}: ${item.value.join(', ')}`);
        })
        console.log('---------------------------------');
      }
    }
  });
}).on('error', e => {
  console.log('错误: ' + e.message);
});
req.end();