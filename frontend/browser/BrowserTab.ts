
type TitleUpdater = (title: string) => void

export default class BrowserTab {
  titleUpdater: TitleUpdater
  tabView: JQuery
  addressInput: JQuery
  
  constructor(parent: JQuery, titleUpdater: TitleUpdater) {
    this.titleUpdater = titleUpdater
    this.addressInput = $('<input placeholder="Enter address" type="text">')
    const backButton = $('<button class="ui icon button"><i class="arrow left icon"></i></button>')
    const forwardButton = $('<button class="ui icon button"><i class="arrow right icon"></i></button>')
    const refreshButton = $('<button class="ui icon button"><i class="repeat icon"></i></button>')
    const buttonGroup = $('<div class="ui icon buttons" />').append(backButton, forwardButton, refreshButton)
    this.tabView = $('<div style="height: 100%" />').append(
      $('<div class="ui fluid left action input sticky" />').append(buttonGroup, this.addressInput)
    )
    const webView = $('<webview src="about:blank" style="height: calc(100% - 43px); width: 100%" blinkfeatures="ContextMenu"></webview>')
    const webViewEl = <Electron.WebViewElement>webView[0]
    const errorDiv = $('<div class="alert alert-danger" role="alert"></div>')
    
    backButton.click(() => webViewEl.goBack())
    forwardButton.click(() => webViewEl.goForward())
    refreshButton.click(() => webViewEl.reload())

    this.addressInput.keypress(e => {
      if (e.which == 13) {
        webViewEl.loadURL(this.addressInput.val())
        webView.focus()
      }
    })
    webViewEl.addEventListener('page-title-updated', (e: Electron.TitleEvent) => titleUpdater(e.title))
    webViewEl.addEventListener('load-commit', (e: Electron.LoadCommitEvent) => {
      if (e.isMainFrame && e.url != 'about:blank') {
        errorDiv.hide()
        webView.show()
        this.addressInput.val(e.url)
      }
      if (e.url == 'about:blank') webViewEl.clearHistory()
      backButton.toggleClass('disabled', !webViewEl.canGoBack()) 
      forwardButton.toggleClass('disabled', !webViewEl.canGoForward()) 
    })
    webViewEl.addEventListener('did-fail-load', (e: Electron.DidFailLoadEvent) => {
      // If this is BLOCKED_BY_CLIENT, just ignore
      if (e.errorCode != -20) {
        webView.hide()
        errorDiv.empty().text(e.errorDescription).prepend('<strong>Load Failed:</strong>').show()
      }
    })
    // Handle F12 for opening dev tools
    webView.keydown(e => {
      if (e.keyCode == 123) {
        if (webViewEl.isDevToolsOpened()) webViewEl.closeDevTools()
        else webViewEl.openDevTools()
      }
      return true
    })
    
    this.tabView.append(webView).hide()
    parent.append(this.tabView)
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
}