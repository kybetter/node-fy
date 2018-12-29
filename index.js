#! /usr/bin/env node

const http = require('http');
const qs = require('querystring');
const crypto = require('crypto');
const md5 = crypto.createHash('md5');

const pObj = {
  print(data) {
    if (data !== '') {console.log(data)}
    return this;
  },
  line() {console.log('---------------------------------')}
}
function print(data = '') {return pObj.print(data)}

class Translate {
  constructor() {
    [,,...this.argv] = process.argv;
    this.argsStr = this.argv.join(' ');
    this.APP_KEY = '6352bac0dedbf9e7';
    this.SEC_KEY = '2bHmZHOz68od40aqJCD8KmjvEA1ovAkg';
    this.salt = Date.now();
  }
  
  composeQueryData() {
    return qs.stringify({
      q: this.argsStr,
      appKey: this.APP_KEY,
      salt: this.salt,
      sign: md5.update(`${this.APP_KEY}${this.argsStr}${this.salt}${this.SEC_KEY}`).digest('hex'),
      from: 'auto',
      to: 'auto'
    });
  }

  requestOptions() {
    return {
      hostname: 'openapi.youdao.com',
      path: `/api?${this.composeQueryData()}`,
      method: 'GET',
    }
  }

  run() {
    const req = http.request(this.requestOptions(), res => {
      let bodyData = '';
      res.on('data', chunk => {bodyData += chunk});

      res.on('end', () => {
        const data = JSON.parse(bodyData);
        const {web, basic, translation = [], l} = data;
    
        print(this.argsStr).line();

        if (l === 'EN2zh-CHS') {
          if (basic) {
            print(`英[${basic['uk-phonetic'] || '无'}]  美[${basic['us-phonetic'] || '无'}]`).line();
            basic.explains.forEach(item => {print(item)})
            print().line();
            if (basic.wfs) {
              let wf = [];
              basic.wfs.forEach(item => {
                wf.push(item.wf.name)
                wf.push(item.wf.value)
              })
              print(`[${wf.join(' ')}]`).line();
            }
          } else {
            print(translation.join()).line();
          }
          if (web) {
            print('短语');
            web.forEach(item => {
              print(`${item.key}: ${item.value.join('，')}`);
            })
            print().line();
          }
        } else {
          if (basic && basic.explains) {
            print(basic.explains.join(', ')).line();
          } else {
            print(translation.join()).line();
          }
          if (web) {
            print('短语');
            web.forEach(item => {
              print(`${item.key}: ${item.value.join(', ')}`);
            })
            print().line();
          }
        }
      });
    }).on('error', e => {
      print('错误: ' + e.message);
    });
    req.end();
  }
}

(new Translate()).run();
