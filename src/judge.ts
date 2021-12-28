import {sendMessage} from "./socket";
import type {Problem} from "./types/problem";
import {WebSocketResponseType} from "./types/response";


const waitList = [] as string[], judgeList = [] as string[]
const problemMap = new Map<string, Problem>()

function judgeFinishHandler(problem: string) {
    if (judgeList.indexOf(problem) !== -1) judgeList.splice(judgeList.indexOf(problem), 1)
    if (problem) {
        sendMessage(WebSocketResponseType.JUDGE_FINISH, {
            uid: (problemMap.get(problem) as Problem).uid,
            score: 100,
            reason: 'AC'
        })
    }
    while (judgeList.length < 3 && waitList.length) judge(waitList.shift() as string)
}

function judge(problem: string) {
    judgeList.push(problem)
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
        judgeFinishHandler(problem)
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
    while (judgeList.length < 3 && waitList.length) judge(waitList.shift() as string)
}

export function getJudgeInfo() {
    return {
        waitList
    }
}
