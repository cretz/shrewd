const Split = require('./split')
import BrowserTab from './BrowserTab'

export default class BrowserView {
  mainContainer: JQuery
  tabView: JQuery
  verticalTabDiv: JQuery
  browserView: JQuery
  
  tabs: BrowserTab[]
  
  constructor(parent: JQuery) {
    this.tabs = []
    
    this.tabView = $('<div id="tab-view" class="split split-horizontal" style="overflow-y: auto" />')
    this.tabView.append(this.verticalTabDiv = $('<div class="ui vertical fluid tabular menu" />'))
    const newTabButton = $('<button class="fluid ui button">New Tab</button>')
    newTabButton.click(_ => this.addTab())
    this.tabView.append(newTabButton)
    
    this.browserView = $('<div id="browser-view" class="split split-horizontal" />')
    
    this.mainContainer = $('<div id="browser-container" />').append(this.tabView, this.browserView)
    parent.append(this.mainContainer)
    Split([this.tabView[0], this.browserView[0]], { sizes: [15, 85], minSize: 200 })
  }
  
  addTab() {
    const tabAnchor = $('<a class="item" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">[BLANK]</a>')
    this.verticalTabDiv.append(tabAnchor)
    const tab = new BrowserTab(this.browserView, text => {
      tabAnchor.text(text)
      tabAnchor.attr('title', text)
    })
    this.tabs.push(tab)
    tabAnchor.click(e => {
      e.preventDefault()
      
      // Hide previous if present
      const previous = this.tabView.find('a.active')
      if (previous.length == 1) {
        previous.removeClass('active')
        this.tabs[previous.index()].hide()
      }
      
      // Show this one
      tabAnchor.addClass('active')
      tab.show()
    })
    tabAnchor.click()
    tab.focusAddress()
  }
}