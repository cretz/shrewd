import { app, BrowserWindow } from 'electron'
import WindowStateKeeper from './WindowStateKeeper'
import Providers from './provider/Providers'

export default class System {
  mainWindowState: WindowStateKeeper
  mainWindow: Electron.BrowserWindow
  
  start(): Promise<any> {
    console.log('Starting Shrewd...')
    
    // Initialize the providers
    const p = Providers.init()
    
    // Do the rest of the init
    return p.then(_ => {
      console.log('Building window')
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
      this.mainWindow.loadURL(`file://${__dirname}/../frontend/assets/frontend.html`)
      
      // Save window state on close
      this.mainWindow.on('close', () => {
        console.log('Closed')
        this.mainWindowState.saveState(this.mainWindow)
      })
    })
  }
}