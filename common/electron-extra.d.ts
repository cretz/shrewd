
declare module Electron {
  interface TitleEvent extends Event {
    title: string
  }

  interface LoadCommitEvent extends Event {
    url: string
    isMainFrame: boolean
  }

  interface DidFailLoadEvent extends Event {
    errorCode: number
    errorDescription: string
  }

  interface WebViewElement extends HTMLElement, NodeJS.EventEmitter {
    loadURL(url: string, options?: any): void
    isDevToolsOpened(): boolean
    closeDevTools(): void
    openDevTools(): void
    canGoBack(): boolean
    canGoForward(): boolean
    reload(): boolean
    goBack(): void
    goForward(): void
    clearHistory(): void
  }
  
  interface WebViewEventable {
    addEventListener(type: 'page-title-updated', f: (e: Electron.TitleEvent) => any): any
    addEventListener(type: 'load-commit', f: (e: Electron.LoadCommitEvent) => any): any
    addEventListener(type: 'did-fail-load', f: (e: Electron.DidFailLoadEvent) => any): any
    addEventListener(type: 'dom-ready', f: (e: Electron.Event) => any): any
    addEventListener(type: string, f: (e: Electron.Event) => any): any
  }

}