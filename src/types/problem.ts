export interface Problem {
    uid: string
}

export type JudgeResultCode = 'AC' | 'WA' | 'RTE' | 'TLE' | 'MLE' | 'OLE' | 'CE'
export type JudgeStatusCode = JudgeResultCode | 'PD' | 'CP' | 'RUN'

export type JudgeResult = {
    uid: string
    reason: JudgeResultCode
    time: number
    memory: number
    example?: {
        output: string
        no: number
    }
}
