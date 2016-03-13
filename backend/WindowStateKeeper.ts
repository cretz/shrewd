import { app } from 'electron'
import Utils from '../common/Utils'
import path = require('path')

// Inspiration: https://github.com/szwacz/electron-boilerplate/blob/36cb1fcec5137152351d4de53d68ebcbc4170d07/app/vendor/electron_boilerplate/window_state.js

interface WindowState extends Electron.Rectangle {
  isMaximized?: boolean
}

export default class WindowStateKeeper {
  name: string
  state: WindowState
  
  constructor(name: string, defaultState: WindowState) {
    // Attempt load first
    this.name = name
    this.state = Utils.readJsonSync<WindowState>(this._filePath)
    if (this.state === null) this.state = defaultState
  }
  
  get _filePath() {
    return path.join(app.getPath('userData'), `window-state-${this.name}.json`)
  }
  
  _fromWindow(win: Electron.BrowserWindow) {
    if (!win.isMaximized() && !win.isMinimized()) {
      ;[this.state.x, this.state.y] = win.getPosition()
      ;[this.state.width, this.state.height] = win.getSize()
    }
    this.state.isMaximized = win.isMaximized()
  }
  
  saveState(win: Electron.BrowserWindow) {
    this._fromWindow(win)
    Utils.writeJsonSync(this._filePath, this.state)
  }
}