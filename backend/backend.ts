import { app } from 'electron'
import System from './System'

app.on('ready', () => new System().start().catch(e => console.error('Error starting', e)))
app.on('window-all-closed', () => app.quit())