declare module SplitJS {
  interface SplitMain {
    (elements: HTMLElement[]|string[], options?: SplitOptions): void
  }
  
  type Sizes = Array<string|number>
  
  interface SplitOptions {
    sizes: Sizes
    minSize: number|Sizes
  }
}

declare module 'split.js' {
  var Split: SplitJS.SplitMain
  export = Split
}