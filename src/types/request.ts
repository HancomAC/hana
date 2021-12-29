export const enum WebSocketRequestType {
    JUDGE_INFO = 'JUDGE_INFO',
    JUDGE_STATUS = 'JUDGE_STATUS',
}

export interface WebSocketRequest {
    type: WebSocketRequestType
    data?: any
}

export const enum JudgeSourceType {
    TEXT = 'TEXT',
    C = 'C',
    CPP = 'CPP',
    PYTHON3 = 'PYTHON3',
    PYPY = 'PYPY',
    JAVA = 'JAVA',
    JAVASCRIPT = 'JAVASCRIPT',
}

export interface SourceFile {
    name: string
    ext: JudgeSourceType
    source: string
}

export interface JudgeRequest {
    language: JudgeSourceType
    source: string
    input: string[]
    output: string[]
    timeLimit: number
    memoryLimit: number
}
