
import BrowserView from './BrowserView'

export default class App {
  browserView: BrowserView
  
  constructor(parent: JQuery) {
    this.browserView = new BrowserView(parent)
    this.browserView.addTab()
  }
}