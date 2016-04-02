
import * as electron from 'electron'
import SafeProvider from './SafeProvider'

export default class Providers {
  static providers: Provider[] = [new SafeProvider()]
  
  static init(): Promise<any> {
    // Register the schemes we accept
    const standardSchemes = Providers.providers.map(p => p.schemeName)
    standardSchemes.push('http')
    electron.protocol.registerStandardSchemes(standardSchemes)
    // Now init the providers
    return Promise.all(Providers.providers.map(p => p.init()))
  }
}