import {sendMessage} from "./socket";
import type {Problem} from "./types/problem";
import {WebSocketResponseType} from "./types/response";


const waitList = [] as string[]
const problemMap = new Map<string, Problem>()

function judgeFinishHandler() {
    const problem = waitList.shift()
    if (problem) {
        sendMessage(WebSocketResponseType.JUDGE_FINISH, {
            uid: (problemMap.get(problem) as Problem).uid,
            score: 100,
            reason: 'AC'
        })
    }
    if (waitList.length > 0) judge(waitList[0])
}

function judge(problem: string) {
    sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
        uid: (problemMap.get(problem) as Problem).uid,
        progress: 0,
        reason: 'CP'
    })
    const rt = Math.random() * 500
    for (let i = 1; i < 10; i++) {
        setTimeout(() => {
            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: (problemMap.get(problem) as Problem).uid,
                progress: i / 10,
                reason: 'RUN'
            })
        }, i * rt + 1000)
    }
    setTimeout(() => {
        judgeFinishHandler()
    }, rt * 10 + 1000)
}

export function requestJudge(problem: Problem) {
    waitList.push(problem.uid)
    problemMap.set(problem.uid, problem)
    sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
        uid: problem.uid,
        progress: 0,
        reason: 'PD'
    })
    if (waitList.length === 1) judge(problem.uid)
}

export function getJudgeInfo() {
    return {
        waitList
    }
}
