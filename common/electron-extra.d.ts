
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

}