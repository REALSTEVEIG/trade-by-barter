// Polyfills for jsdom environment

// TextEncoder/TextDecoder polyfill
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// URL polyfill
const { URL, URLSearchParams } = require('url')
global.URL = URL
global.URLSearchParams = URLSearchParams

// Crypto polyfill for Node.js environment
const crypto = require('crypto')
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    subtle: crypto.webcrypto?.subtle,
  },
})

// Web APIs that are not available in jsdom
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Headers(options.headers)
    this.body = options.body
  }
}

global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Headers(options.headers)
    this.ok = this.status >= 200 && this.status < 300
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body))
  }
  
  text() {
    return Promise.resolve(this.body)
  }
}

global.Headers = class Headers {
  constructor(init = {}) {
    this._headers = new Map()
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value)
      })
    }
  }
  
  get(name) {
    return this._headers.get(name.toLowerCase())
  }
  
  set(name, value) {
    this._headers.set(name.toLowerCase(), value)
  }
  
  has(name) {
    return this._headers.has(name.toLowerCase())
  }
  
  delete(name) {
    this._headers.delete(name.toLowerCase())
  }
  
  entries() {
    return this._headers.entries()
  }
}

// AbortController polyfill
global.AbortController = class AbortController {
  constructor() {
    this.signal = new AbortSignal()
  }
  
  abort() {
    if (this.signal.onabort) {
      this.signal.onabort()
    }
  }
}

global.AbortSignal = class AbortSignal {
  constructor() {
    this.aborted = false
    this.onabort = null
  }
}

// FormData polyfill
global.FormData = class FormData {
  constructor() {
    this._data = new Map()
  }
  
  append(name, value) {
    if (this._data.has(name)) {
      const existing = this._data.get(name)
      if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        this._data.set(name, [existing, value])
      }
    } else {
      this._data.set(name, value)
    }
  }
  
  get(name) {
    const value = this._data.get(name)
    return Array.isArray(value) ? value[0] : value
  }
  
  getAll(name) {
    const value = this._data.get(name)
    return Array.isArray(value) ? value : [value]
  }
  
  has(name) {
    return this._data.has(name)
  }
  
  set(name, value) {
    this._data.set(name, value)
  }
  
  delete(name) {
    this._data.delete(name)
  }
  
  entries() {
    return this._data.entries()
  }
}