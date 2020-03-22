// 仅支持 js运行错误及vue组件错误
import axios from 'axios'

let debugConfig = {
  project: '',
  api: '',
  ignoreErrMsgs: [] // 需要忽略掉的错误消息
}
const debug = {
  warn({message, fileName, url}) {
    let level = 'warn'
    _logReport({level, message, fileName, url})
  },
  error({message, lineNumber, columnNumber, fileName, url}) {
    let level = 'error'
    _logReport({level, message, lineNumber, columnNumber, fileName, url})
  }
}

// 日志上报
const _logReport = ({level, message, lineNumber, columnNumber, fileName, url}) => {
  let {project} = debugConfig
  const data = {
    project,
    message,
    level,
    lineNumber,
    columnNumber,
    fileName,
    url
  }
  // 本地不需要走错误日志，仅线上环境
  if (process.env.NODE_ENV !== 'production') {
    console.error('data', data)
    return
  }


  axios.post(debugConfig.api, {
    project: data.project,
    where: `${data.fileName}:${data.lineNumber ? data.lineNumber : 0}`,
    level: data.level,
    msg: data
  })
}

export default function (Vue, option = {}) {
  debugConfig = Object.assign(debugConfig, {...option})

  /**
   * 获取组件的名称
   * @param vm
   * @returns {*}
   */
  function formatComponentName(vm) {
    if (vm.$root === vm) return 'root'
    let name = vm._isVue
      ? (vm.$options && vm.$options.name) ||
      (vm.$options && vm.$options._componentTag)
      : vm.name
    return (
      (name ? 'component <' + name + '>' : 'anonymous component') +
      (vm._isVue && vm.$options && vm.$options.__file
        ? ' at ' + (vm.$options && vm.$options.__file)
        : '')
    )
  }

  Vue.config.errorHandler = function (err, vm, info) {
    let componentName = ''
    if (vm) {
      componentName = formatComponentName(vm)
    }
    debug.error({
      message: err.message,
      fileName: componentName,
      url: window.top.location.href
    })
  }
  Vue.config.warnHandler = function (msg, vm) {
    if (vm) {
      let componentName = formatComponentName(vm)
      debug.warn({
        message: msg,
        fileName: componentName,
        url: window.top.location.href
      })
    }
  }

  // 监控全局错误
  window.onerror = function (msg, url, lineNo, columnNo) {
    if (debugConfig.ignoreErrMsgs.includes(msg)) {
      return
    }
    debug.error({
      message: msg,
      lineNumber: lineNo,
      columnNumber: columnNo,
      fileName: url,
      url: window.top.location.href
    })
  }
}
