function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env
    }

    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts
      let sender = this.get
      if (method === 'POST') {
        sender = this.post
      }

      const delayPromise = (promise, delay = 1000) => {
        return Promise.race([
          promise,
          new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('请求超时'))
            }, delay)
          })
        ])
      }

      const call = new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err)
          else resolve(resp)
        })
      })

      return opts.timeout ? delayPromise(call, opts.timeout) : call
    }

    get(opts) {
      return this.send.call(this.env, opts)
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST')
    }
  }

  return new (class {
    constructor(name, opts) {
      this.logLevels = { debug: 0, info: 1, warn: 2, error: 3 }
      this.logLevelPrefixs = {
        debug: '[DEBUG] ',
        info: '[INFO] ',
        warn: '[WARN] ',
        error: '[ERROR] '
      }
      this.logLevel = 'info'
      this.name = name
      this.http = new Http(this)
      this.data = null
      this.dataFile = 'box.dat'
      this.logs = []
      this.isMute = false
      this.isNeedRewrite = false
      this.logSeparator = '\n'
      this.encoding = 'utf-8'
      this.startTime = new Date().getTime()
      Object.assign(this, opts)
      this.log('', `🔔${this.name}, 开始!`)
    }

    getEnv() {
      if ('undefined' !== typeof $environment && $environment['surge-version'])
        return 'Surge'
      if ('undefined' !== typeof $environment && $environment['stash-version'])
        return 'Stash'
      if ('undefined' !== typeof module && !!module.exports) return 'Node.js'
      if ('undefined' !== typeof $task) return 'Quantumult X'
      if ('undefined' !== typeof $loon) return 'Loon'
      if ('undefined' !== typeof $rocket) return 'Shadowrocket'
      return 'Browser'
    }

    isNode() {
      return 'Node.js' === this.getEnv()
    }

    isQuanX() {
      return 'Quantumult X' === this.getEnv()
    }

    isSurge() {
      return 'Surge' === this.getEnv()
    }

    isLoon() {
      return 'Loon' === this.getEnv()
    }

    isShadowrocket() {
      return 'Shadowrocket' === this.getEnv()
    }

    isStash() {
      return 'Stash' === this.getEnv()
    }

    isBrowser() {
      return 'Browser' === this.getEnv()
    }

    toObj(str, defaultValue = null) {
      try {
        return JSON.parse(str)
      } catch {
        return defaultValue
      }
    }

    toStr(obj, defaultValue = null, ...args) {
      try {
        return JSON.stringify(obj, ...args)
      } catch {
        return defaultValue
      }
    }

    getjson(key, defaultValue) {
      let json = defaultValue
      const val = this.getdata(key)
      if (val) {
        try {
          json = JSON.parse(this.getdata(key))
        } catch {}
      }
      return json
    }

    setjson(val, key) {
      try {
        return this.setdata(JSON.stringify(val), key)
      } catch {
        return false
      }
    }

    getScript(url) {
      return new Promise((resolve) => {
        if (this.isBrowser()) {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', url, true)
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                resolve(xhr.responseText)
              } else {
                resolve('')
              }
            }
          }
          xhr.send()
        } else {
          this.get({ url }, (err, resp, body) => resolve(body))
        }
      })
    }

    getdata(key) {
      let val = this.getval(key)
      // 如果以 @
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objval = objkey ? this.getval(objkey) : ''
        if (objval) {
          try {
            const objedval = JSON.parse(objval)
            val = objedval ? this.lodash_get(objedval, paths, '') : val
          } catch (e) {
            val = ''
          }
        }
      }
      return val
    }

    setdata(val, key) {
      let issuc = false
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objdat = this.getval(objkey)
        const objval = objkey
          ? objdat === 'null'
            ? null
            : objdat || '{}'
          : '{}'
        try {
          const objedval = JSON.parse(objval)
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
        } catch (e) {
          const objedval = {}
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
        }
      } else {
        issuc = this.setval(val, key)
      }
      return issuc
    }

    getval(key) {
      switch (this.getEnv()) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
          return $persistentStore.read(key)
        case 'Quantumult X':
          return $prefs.valueForKey(key)
        case 'Node.js':
          this.data = this.loaddata()
          return this.data[key]
        case 'Browser':
          return localStorage.getItem(key)
        default:
          return (this.data && this.data[key]) || null
      }
    }

    setval(val, key) {
      switch (this.getEnv()) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
          return $persistentStore.write(val, key)
        case 'Quantumult X':
          return $prefs.setValueForKey(val, key)
        case 'Node.js':
          this.data = this.loaddata()
          this.data[key] = val
          this.writedata()
          return true
        case 'Browser':
          localStorage.setItem(key, val)
          return true
        default:
          return (this.data && this.data[key]) || null
      }
    }

    lodash_get(source, path, defaultValue = undefined) {
      const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
      let result = source
      for (const p of paths) {
        result = Object(result)[p]
        if (result === undefined) {
          return defaultValue
        }
      }
      return result
    }

    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
      path
        .slice(0, -1)
        .reduce(
          (a, c, i) =>
            Object(a[c]) === a[c]
              ? a[c]
              : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
          obj
        )[path[path.length - 1]] = value
      return obj
    }

    // 适配浏览器环境
    initBrowserEnv(opts) {
      // 浏览器环境下，使用XHR请求替代
      this.browser = true
      this.fetch = (url, opts = {}) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open(opts.method || 'GET', url)
          
          if (opts.headers) {
            Object.keys(opts.headers).forEach(key => {
              xhr.setRequestHeader(key, opts.headers[key])
            })
          }
          
          xhr.onload = () => {
            resolve({
              status: xhr.status,
              statusText: xhr.statusText,
              headers: xhr.getAllResponseHeaders(),
              body: xhr.responseText
            })
          }
          
          xhr.onerror = () => reject(new Error('Network Error'))
          xhr.timeout = opts.timeout || 30000
          xhr.ontimeout = () => reject(new Error('Network Timeout'))
          
          xhr.send(opts.body)
        })
      }
    }

    time(fmt, ts = null) {
      const date = ts ? new Date(ts) : new Date()
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds()
      }
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
      for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          )
      return fmt
    }

    queryStr(options) {
      let queryString = ''
      for (const key in options) {
        let value = options[key]
        if (value != null && value !== '') {
          if (typeof value === 'object') {
            value = JSON.stringify(value)
          }
          queryString += `${key}=${value}&`
        }
      }
      queryString = queryString.substring(0, queryString.length - 1)
      return queryString
    }
    
    // 浏览器适配的消息通知
    msg(title = name, subt = '', desc = '', opts = {}) {
      if (this.isBrowser()) {
        // 使用浏览器通知API
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(title, {
              body: subt ? subt + '\n' + desc : desc,
              icon: opts.icon || ''
            })
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification(title, {
                  body: subt ? subt + '\n' + desc : desc,
                  icon: opts.icon || ''
                })
              }
            })
          }
        }
        // 在控制台也输出一下
        console.log(`${title}\n${subt}\n${desc}`)
      } else {
        // 其他环境通知逻辑
        const toEnvOpts = (rawopts) => {
          if (typeof rawopts === 'string') {
            return this.isSurge() || this.isLoon() || this.isStash() 
              ? { url: rawopts } 
              : this.isQuanX() 
                ? { 'open-url': rawopts } 
                : undefined
          } else if (rawopts && typeof rawopts === 'object') {
            // 处理复杂通知选项
            const opts = {}
            if (rawopts.openUrl || rawopts['open-url']) {
              opts.url = rawopts.openUrl || rawopts['open-url']
            }
            if (rawopts.mediaUrl || rawopts['media-url']) {
              opts['media-url'] = rawopts.mediaUrl || rawopts['media-url']
            }
            return opts
          } else {
            return undefined
          }
        }
        
        if (!this.isMute) {
          switch (this.getEnv()) {
            case 'Surge':
            case 'Loon':
            case 'Stash':
            case 'Shadowrocket':
              $notification.post(title, subt, desc, toEnvOpts(opts))
              break
            case 'Quantumult X':
              $notify(title, subt, desc, toEnvOpts(opts))
              break
          }
        }
      }
      
      if (!this.isMuteLog) {
        let logs = ['', '==============📣系统通知📣==============']
        logs.push(title)
        subt ? logs.push(subt) : ''
        desc ? logs.push(desc) : ''
        console.log(logs.join('\n'))
        this.logs = this.logs.concat(logs)
      }
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs]
      }
      console.log(logs.map((l) => l ?? String(l)).join(this.logSeparator))
    }

    logErr(err, msg) {
      if (this.isBrowser()) {
        console.error(`${this.name}: ${msg || '错误!'}`, err)
      } else {
        switch (this.getEnv()) {
          case 'Surge':
          case 'Loon':
          case 'Stash':
          case 'Shadowrocket':
          case 'Quantumult X':
          default:
            this.log('', `❗️${this.name}, 错误!`, msg, err)
            break
          case 'Node.js':
            this.log(
              '',
              `❗️${this.name}, 错误!`,
              msg,
              typeof err.message !== 'undefined' ? err.message : err,
              err.stack
            )
            break
        }
      }
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    }

    done(val = {}) {
      const endTime = new Date().getTime()
      const costTime = (endTime - this.startTime) / 1000
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
      this.log()
      switch (this.getEnv()) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
        case 'Quantumult X':
        default:
          if (typeof $done !== 'undefined') {
            $done(val)
          }
          break
        case 'Node.js':
          process.exit(1)
        case 'Browser':
          // 浏览器环境不需要特殊处理
          break
      }
    }
  })(name, opts)
} 
