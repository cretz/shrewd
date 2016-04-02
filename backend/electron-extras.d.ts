
declare namespace Electron {
  
  interface SessionWebRequest {
    onBeforeRequest(listener: SessionWebRequestBeforeRequestListener)
    onBeforeRequest(filter: SessionWebRequestFilter, listener: SessionWebRequestBeforeRequestListener)
  }
  
  interface SessionWebRequestFilter {
    urls: string[]
  }
  
  interface SessionWebRequestBeforeRequestListener {
    (details: SessionWebRequestBeforeRequestDetails, callback: SessionWebRequestBeforeRequestCallback)
  }
  
  interface SessionWebRequestBeforeRequestDetails {
    id: number
    url: string
    method: string
    resourceType: string
    timestamp: number
    uploadData?: SessionWebRequestBeforeRequestDetailData[]
  }
  
  interface SessionWebRequestBeforeRequestDetailData {
    bytes: Buffer
    file: string
  }
  
  interface SessionWebRequestBeforeRequestCallback {
    (response: SessionWebRequestBeforeRequestCallbackResponse)
  }
  
  interface SessionWebRequestBeforeRequestCallbackResponse {
    cancel?: boolean
    redirectURL?: string
  }
}