export type JudgeResultCode = 'AC' | 'WA' | 'RE' | 'TLE' | 'MLE' | 'CE'
export type JudgeStatusCode = JudgeResultCode | 'PD' | 'CP' | 'RUN'

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

export interface JudgeResult {
    uid: string
    result: (number[] | number)[]
    resultCode: JudgeResultCode
    reason: JudgeResultCode[]
    time: number[]
    memory: number[]
    example?: {
        output: string
        no: number
    }
    message?: string
}
