const Koa = require('koa')
const app = new Koa()
const router = require('koa-router')()
const axios = require('axios').default
const bodyParser = require('koa-bodyparser')


/**
 * 给钉钉机器人发送消息
 * 开发者文档：https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq
 * @param data
 * @returns {*}
 */
function postDingMsg(data) {
  // 需要自己去添加一个钉钉自定义机器人即可
  // 复制出机器人的Webhook地址
  const url = 'https://oapi.dingtalk.com/robot/send?access_token=xxxx'
  const keyword = 'jsError:'
  let d = {
    'msgtype': 'markdown',
    'markdown': {
      'title': keyword,
      'text': '## msg:' + data.msg.message + '\n' +
      '## level：' + data.level + '\n\n' +
      '## fileName：' + data.msg.fileName + '\n' +
      '## ua：' + data.ua + '\n\n' +
      '## [查看详情](' + data.msg.url + ') \n'
    },
    'at': {
      'atMobiles': [],
      'isAtAll': false
    }
  }
  return axios.post(url, d)
}

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World'
})
// api接口
router.post('/js_log', async (ctx, next) => {
  let data = ctx.request.body
  const ua = ctx.request.headers['user-agent']
  // 给钉钉机器人发送消息
  const res = await postDingMsg({...data, ua})
  if (res.data.errcode === 0) {
    ctx.response.body = 'success'
  } else {
    ctx.response.status = 400
    ctx.response.body = 'error'
  }

})
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)