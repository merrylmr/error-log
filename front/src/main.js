import Vue from 'vue'
import App from './App.vue'
import debug from './assets/js/debug.js'

Vue.config.productionTip = false
Vue.use(debug, {
  api: '/js_log',
  ignoreErrMsgs: ['ResizeObserver loop limit exceeded'] // 需要忽略掉的错误消息
})
new Vue({
  render: h => h(App),
}).$mount('#app')
