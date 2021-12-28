export const enum WebSocketRequestType {
    JUDGE_INFO = 'JUDGE_INFO',
    JUDGE_STATUS = 'JUDGE_STATUS',
}

export interface WebSocketRequest {
    type: WebSocketRequestType
    data?: any
}
