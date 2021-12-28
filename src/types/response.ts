export type WebSocketResponseType = 'JUDGE_FINISH'

export interface WebSocketResponse {
    success: boolean
    type: WebSocketResponseType
    data: any
    error?: string
}
