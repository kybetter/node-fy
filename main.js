#! /usr/bin/env node

const qs = require('querystring');
const chalk = require('chalk');
const {post} = require('./share');

const genBaiduParam = require('./baidu');
const genYoudaoParam = require('./youdao');

let [, , ...argv] = process.argv;
query = argv.join(' ');

const baiduParam = genBaiduParam(query);
const youdaoParam = genYoudaoParam(query);

const log = console.log;

async function run() {
  log(chalk.yellow(`"${query}" 的翻译结果：`))
  try {
    const youdaoData = await post("https://openapi.youdao.com/api",  qs.stringify(youdaoParam));
    const data = youdaoData.data;
    if (data.errorCode === '0') {
      const { web, basic, translation = [], l } = data;
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
  } catch(e) {
    throw e;
  }

  try {
    const baiduData = await post("https://fanyi-api.baidu.com/api/trans/vip/translate",  qs.stringify(baiduParam));
    const trans = baiduData.data.trans_result;
    log('---------------------------------')
    log(chalk.cyan('百度翻译：'));
    trans.forEach(item => {
      log(item.dst);
    })
    log('---------------------------------')
  } catch(e) {
    throw e;
  }
}
run();