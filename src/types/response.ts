export const enum WebSocketResponseType {
    JUDGE_FINISH = 'JUDGE_FINISH',
    JUDGE_PROGRESS = 'JUDGE_PROGRESS',
    JUDGE_INFO = 'JUDGE_INFO',
    JUDGE_STATUS = 'JUDGE_STATUS',
    JUDGE_ERROR = 'JUDGE_ERROR',
}

export interface WebSocketResponse {
    success: boolean
    type: WebSocketResponseType
    data?: any
    error?: string
}
