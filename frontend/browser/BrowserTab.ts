import * as url from 'url'

type TitleUpdater = (title: string) => void

export default class BrowserTab {
  titleUpdater: TitleUpdater
  tabView: JQuery
  backButton: JQuery
  forwardButton: JQuery
  refreshButton: JQuery
  addressInput: JQuery
  webViewSpan: JQuery
  webView: JQuery
  
  constructor(parent: JQuery, titleUpdater: TitleUpdater) {
    this.titleUpdater = titleUpdater
    this.addressInput = $('<input placeholder="Enter address" type="text">')
    this.backButton = $('<button class="ui icon button disabled"><i class="arrow left icon"></i></button>')
    this.forwardButton = $('<button class="ui icon button disabled"><i class="arrow right icon"></i></button>')
    this.refreshButton = $('<button class="ui icon button disabled"><i class="repeat icon"></i></button>')
    const buttonGroup = $('<div class="ui icon buttons" />').append(this.backButton, this.forwardButton, this.refreshButton)
    this.tabView = $('<div style="height: 100%" />').append(
      $('<div class="ui fluid left action input sticky" />').append(buttonGroup, this.addressInput)
    )
    
    this.backButton.click(() => { if (this.webView != null) this.webViewEl.goBack() })
    this.forwardButton.click(() => { if (this.webView != null) this.webViewEl.goForward() })
    this.refreshButton.click(() => { if (this.webView != null) this.webViewEl.reload() })

    this.addressInput.keypress(e => {
      if (e.which == 13) {
        this.showWebView(this.addressInput.val())
      }
    })
    
    this.webViewSpan = $('<span></span>')
    this.tabView.append(this.webViewSpan)
    parent.append(this.tabView)
  }
  
  private get webViewEl(): Electron.WebViewElement {
    if (this.webView == null) return null
    return <Electron.WebViewElement>this.webView[0]
  }
  
  private get webViewEventable(): Electron.WebViewEventable {
    if (this.webView == null) return null
    return <Electron.WebViewEventable><any>this.webView[0]
  }
  
  
  show() {
    this.tabView.show()
  }
  
  hide() {
    this.tabView.hide()
  }
  
  focusAddress() {
    this.addressInput.focus()
  }
  
  showWebView(address: string) {
    // Grab the partition which is the protocol sans host
    const parsed = url.parse(this.addressInput.val())
    if (parsed.protocol == null || parsed.protocol.length < 2) {
      this.webView = null
      return this.webViewSpan.html('<div class="ui negative message">Invalid URL</div>')
    }
    
    // Strip the trailing colon if necessary
    // const partition = parsed.protocol.endsWith(':') ? parsed.protocol.substr(0, parsed.protocol.length - 1) : parsed.protocol
    // Right now we're setting the partition to "safe" only
    const partition = 'safe'
    
    // If the web view already has the proper partition, just show it and move on
    // TODO: change this if back when https://github.com/atom/electron/issues/4991 is solved
    if (this.webView != null) {
    // if (this.webView != null && this.webView.attr('partition') == partition) {
      this.webViewEl.loadURL(address)
      this.webView.focus()
      return
    }
    
    // TODO: change this back when https://github.com/atom/electron/issues/4991 is solved
    // this.webView = $(`<webview style="height: calc(100% - 43px); width: 100%" partition="${partition}"></webview>`)
    this.webView = $(`<webview style="height: calc(100% - 43px); width: 100%"></webview>`)
    this.webView.attr('src', address)
    
    this.webViewEventable.addEventListener('page-title-updated', e => this.titleUpdater(e.title))
    this.webViewEventable.addEventListener('load-commit', e => {
      if (e.isMainFrame && e.url != 'about:blank') this.addressInput.val(e.url)
      if (e.url == 'about:blank') this.webViewEl.clearHistory()
      this.backButton.toggleClass('disabled', !this.webViewEl.canGoBack())
      this.forwardButton.toggleClass('disabled', !this.webViewEl.canGoForward())
      this.refreshButton.removeClass('disabled')
    })
    this.webViewEventable.addEventListener('did-fail-load', e => {
      // If this is BLOCKED_BY_CLIENT, just ignore
      console.log('NO!', e)
      if (e.errorCode != -20) {
        // console.log('NO!', e)
      }
    })
    // Handle F12 for opening dev tools
    this.webView.keydown(e => {
      if (e.keyCode == 123) {
        if (this.webViewEl.isDevToolsOpened()) this.webViewEl.closeDevTools()
        else this.webViewEl.openDevTools()
      }
      return true
    })
    
    this.webViewSpan.empty().append(this.webView)
  }
}