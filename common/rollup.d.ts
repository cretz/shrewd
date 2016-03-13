
declare module Rollup {
  interface RollupMain {
    rollup(options: RollupOptions): Promise<Bundle>
  }
  
  interface RollupOptions {
    entry: string
  }
  
  interface Bundle {
    generate(options: BundleOptions): BundleResult
    write(options: BundleWriteOptions): Promise<any>
  }
  
  interface BundleOptions {
    format?: string
    sourceMap?: boolean
    sourceMapFile?: string
  }
  
  interface BundleWriteOptions extends BundleOptions {
    dest: string
  }
  
  interface BundleResult {
    code: string
    map: Object
  }
}

declare module 'rollup' {
  var rollup: Rollup.RollupMain
  export = rollup
}