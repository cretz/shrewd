import fs = require('fs')

export default class Utils {
  // Result is null if not found
  static readJsonSync<T>(path: string): T {
    try {
      return JSON.parse(fs.readFileSync(path, 'utf8'))
    } catch (e) {
      return null
    }
  }
  
  static writeJsonSync(path: string, val: any) {
    fs.writeFileSync(path, JSON.stringify(val))
  }
}