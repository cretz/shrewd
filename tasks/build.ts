import childProcess = require('child_process')
import path = require('path')
import fs = require('fs-extra')
import rollup = require('rollup')

export function clean() {
  return new Promise((resolve, reject) => {
    fs.emptyDir('./build', (err) => err ? reject(err) : resolve())
  })
}

function spawnablePath(p: string) {
  return path.resolve(process.platform === 'win32' ? p + '.cmd' : p)
}

export function compileJs() {
  return new Promise((resolve, reject) => {
    fs.ensureDirSync('./build/app')
    
    // Transpile everything over there
    const tsc = childProcess.spawn(
      spawnablePath('node_modules/.bin/tsc'),
      ['--outDir', 'build/app'],
      { stdio: 'inherit' }
    )
    tsc.on('error', reject)
    tsc.on('close', (code) => code === 0 ? resolve() : reject('Failed to exit successfully'))
  })
}

export function copyOther() {
  return new Promise((resolve, reject) => {
    fs.ensureDirSync('./build/app')
    
    // Copy all non-source from backend, common, and frontend
    try {
      const noTypeScriptFiles = (f: string) => !f.endsWith(".ts")
      fs.copySync('./backend', './build/app/backend', noTypeScriptFiles)
      fs.copySync('./common', './build/app/common', noTypeScriptFiles)
      fs.copySync('./frontend', './build/app/frontend', noTypeScriptFiles)
      fs.copySync('./node_modules/jquery/dist', './build/app/node_modules/jquery/dist')
      fs.copySync('./node_modules/semantic-ui-css', './build/app/node_modules/semantic-ui-css')
      fs.copySync('./node_modules/split.js', './build/app/node_modules/split.js')
      fs.copySync('./package.json', './build/app/package.json')
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

export function cleanAndBuildAll() {
  return clean().then(_ => compileJs()).then(_ => copyOther())
}