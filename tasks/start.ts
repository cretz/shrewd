import { clean, compileJs, copyOther } from './build'
import electron = require('electron-prebuilt')
import childProcess = require('child_process')

function run() {
  childProcess.spawn(electron, ['./build/app'], { stdio: 'inherit' })
}

clean().
  then(_ => compileJs()).
  then(_ => copyOther()).
  then(_ => run()).
  catch(console.error)