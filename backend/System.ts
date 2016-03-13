import { app, BrowserWindow } from 'electron'
import WindowStateKeeper from './WindowStateKeeper'

export default class System {
  mainWindowState: WindowStateKeeper
  mainWindow: Electron.BrowserWindow
  
  start() {
    console.log('Starting Shrewd...')
    // Create window
    this.mainWindowState = new WindowStateKeeper('main', { width: 1000, height: 600 })
    this.mainWindow = new BrowserWindow({
      x: this.mainWindowState.state.x,
      y: this.mainWindowState.state.y,
      width: this.mainWindowState.state.width,
      height: this.mainWindowState.state.height,
      autoHideMenuBar: true
    })
    if (this.mainWindowState.state.isMaximized) this.mainWindow.maximize()
    
    this.mainWindow.webContents.openDevTools()
    
    // Load the primary URL
    this.mainWindow.loadURL(`file://${__dirname}/../frontend/frontend.html`)
    
    // Save window state on close
    this.mainWindow.on('close', () => this.mainWindowState.saveState(this.mainWindow))
  }
}