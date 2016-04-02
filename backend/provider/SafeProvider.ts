
import * as electron from 'electron'
import * as url from 'url'
import * as crypto from 'crypto'
import * as querystring from 'querystring'

export default class SafeProvider implements Provider {
  schemeName: string
  isConfigured: boolean
  
  private _hmacSecret: Buffer
  
  constructor() {
    this.schemeName = 'safe'
    // Default configured for now
    this.isConfigured = true
  }
  
  init(): Promise<any> {
    const createSecret = new Promise((res, rej) => {
      // We need a secret so we can use a HMAC to make sure the proxy is not cheated
      // 20 bytes base 64'd should be more than enough for the key
      crypto.randomBytes(20, (err, buf) => {
        if (err != null) return rej(err)
        this._hmacSecret = buf
        res()
      })
    })
    
    // Once secret key is created, we can register the safe protocol and request interceptor
    const registerProto = new Promise((res, rej) => {
      // Register safe
      electron.protocol.registerHttpProtocol(
        'safe',
        (req, cb) => { this._protocolHandler(req, cb) },
        err => {
          if (err != null) rej(err)
          else res()
        }
      )
    })
      
    return Promise.all([createSecret, registerProto]).then(_ => {
      // Intercept all web requests for our partition
      // TODO: fix this to use a partition once https://github.com/atom/electron/issues/4991 is solved
      // const webRequest: Electron.SessionWebRequest = electron.session.fromPartition('safe').webRequest
      const webRequest: Electron.SessionWebRequest = electron.session.defaultSession.webRequest
      webRequest.onBeforeRequest({ urls: ['*://*'] }, (det, cb) => this._beforeRequestHandler(det, cb))
    })
  }
  
  configure(): Promise<boolean> {
    return Promise.resolve(true)
  }
  
  private _protocolHandler(req: Electron.ProtocolRequest, cb: Electron.HttpProtocolCallback): void {
    console.log('New safe request: ', req.url)
    // TODO: worried about session or the partition they are on?
    const parsed = url.parse(req.url)
    const tokens = parsed.host.split('.')
    // We pretend there are only 2 pieces
    // TODO: be more strict here
    const service = tokens.length === 2 ? tokens[0] : 'www'
    const domain = tokens.length === 2 ? tokens[1] : tokens[0]
    console.log('PARSED', parsed)
    const hasPath = parsed.pathname != null && parsed.pathname != '/'
    const path = hasPath ? parsed.pathname.split('/').slice(1).join('/') : 'index.html'
    const encodedPath = encodeURIComponent(decodeURIComponent(path))
    const newUrlPath = `/dns/${service}/${domain}/${encodedPath}`
    
    // Now take that new URL path, sign it w/ HMAC, and add as a query string. This is required
    // so our web request handler can determine this came from us and not from the page.
    const query = 'shrewdSig=' + encodeURIComponent(this._signPath(newUrlPath))
    console.log('Sending to URL: ', `http://localhost:8100${newUrlPath}?${query}`)
    cb({
      url: `http://localhost:8100${newUrlPath}?${query}`,
      method: 'GET'
    })
  }
  
  private _beforeRequestHandler: Electron.SessionWebRequestBeforeRequestListener = (det, cb) => {
    console.log('New web request: ', det.url)
    // We absolutely only support GET regardless of protocol
    if (det.method != 'GET') {
      console.log('Blocked non-GET access to ' + det.url)
      return cb({ cancel: true })
    }
    
    const parsed = url.parse(det.url)
    // Safe is ok, let it through
    if (parsed.protocol == 'safe:') {
      return cb({})
    }
    
    // TODO: remove this when we can use partitions
    if (parsed.protocol == 'chrome-devtools:' || parsed.protocol == 'file:') {
      return cb({})
    }
    
    // We need to allow HTTP requests that end in ".safenet" host to be compatible with
    // the Maidsafe web proxy 
    if (parsed.protocol == 'http:' && parsed.host.endsWith('.safenet')) {
      parsed.protocol = 'safe:'
      parsed.host = parsed.host.substr(0, parsed.host.length - 8)
      console.log('Redirecting to ', url.format(parsed))
      return cb({ redirectURL: url.format(parsed) })
    }
    
    // Now we only allow things going through the /dns call to the safe launcher, so disregard
    // everything else
    if (parsed.protocol != 'http:' || parsed.host != 'localhost:8100') {
      // TODO: Show a popup here letting the user choose to open the HTTP page in his browser
      // like we did in the POC...of course "resourceType" has to be "mainFrame"
      console.log('Blocked HTTP access to ' + det.url)
      return cb({ cancel: true })
    }
    
    // Check the HMAC sig of the path to prevent tampering or calling by the JS user
    const expectedSig = this._signPath(parsed.pathname)
    const query = querystring.parse(parsed.query)
    if (query.shrewdSig !== expectedSig) {
      console.log('Invalid shrewdSig on ' + det.url)
      return cb({ cancel: true })
    }
    
    // All good
    cb({})
  }
  
  _signPath(path: string): string {
    return crypto.createHmac('sha256', this._hmacSecret).update(path).digest('base64')
  }
}