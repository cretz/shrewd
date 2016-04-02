
interface Provider {
  schemeName: string
  isConfigured: boolean
  
  init(): Promise<any>
  configure(): Promise<boolean>
}