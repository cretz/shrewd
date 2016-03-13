import { app } from 'electron'
import System from './System'

app.on('ready', () => new System().start())
app.on('window-all-closed', () => app.quit())