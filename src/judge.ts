import { sendMessage } from './socket'
import { WebSocketResponseType } from './types/response'
import { MultiJudgeCount } from './config'
import { JudgeRequest } from './types/request'
import executeJudge from './runner'
import { JudgeResult } from './types/response'

const waitList = [] as string[],
    judgeList = [] as string[]
const problemMap = new Map<string, JudgeRequest>()

function judgeFinishHandler(problem: string, result: JudgeResult) {
    if (judgeList.indexOf(problem) !== -1)
        judgeList.splice(judgeList.indexOf(problem), 1)
    if (problem) {
        sendMessage(WebSocketResponseType.JUDGE_FINISH, result)
    }
    while (judgeList.length < MultiJudgeCount && waitList.length)
        judge(waitList.shift() as string)
}

function judge(problem: string) {
    judgeList.push(problem)
    sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
        uid: (problemMap.get(problem) as JudgeRequest).uid,
        progress: 0,
        reason: 'CP',
    })
    executeJudge(problemMap.get(problem) as JudgeRequest).then(
        (res: JudgeResult) => {
            judgeFinishHandler(problem, res)
        }
    )
}

export function requestJudge(problem: JudgeRequest) {
    waitList.push(problem.uid)
    problemMap.set(problem.uid, problem)
    sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
        uid: problem.uid,
        progress: 0,
        reason: 'PD',
    })
    while (judgeList.length < MultiJudgeCount && waitList.length)
        judge(waitList.shift() as string)
}

export function getJudgeInfo() {
    return {
        waitList,
    }
}
