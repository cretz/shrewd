import { cleanAndBuildAll } from './build'
import electron = require('electron-prebuilt')
import childProcess = require('child_process')
import fs = require('fs-extra')

function run() {
  childProcess.spawn(electron, ['./build/app'], { stdio: 'inherit' })
}

function rebuild() {
  return cleanAndBuildAll().then(_ => console.log('Rebuilt'))
}

function watch() {
  const pathsToWatch = [
    './backend',
    './common',
    './frontend'
  ]
  // TODO: nodejs watch definition doesn't make recursive available
  const props = <any>{ persistent: true, recursive: true }
  pathsToWatch.forEach(p => fs.watch(p, props, _ => rebuild().catch(console.error)))
}

rebuild().then(_ => run()).then(_ => watch()).catch(console.error)