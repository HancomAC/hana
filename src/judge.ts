import {sendMessage} from "./socket";
import type {Problem} from "./types/problem";
import {WebSocketResponseType} from "./types/response";


const waitList = [] as Problem[]

function judgeFinishHandler() {
    const problem = waitList.shift()
    if (problem) {
        sendMessage(WebSocketResponseType.JUDGE_FINISH, {
            uid: problem.uid,
            score: 100,
            reason: 'AC'
        })
    }
    if (waitList.length > 0) judge(waitList[0])
}

function judge(problem: Problem) {
    for (let i = 1; i < 100; i++) {
        setTimeout(() => {
            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: problem.uid,
                progress: i / 100
            })
        }, i * 50)
    }
    setTimeout(() => {
        judgeFinishHandler()
    }, 5000)
}

export function requestJudge(problem: Problem) {
    if (waitList.length === 0) judge(problem)
    waitList.push(problem)
    sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
        uid: problem.uid,
        progress: 0
    })
}

export function getJudgeInfo() {
    return {
        waitListLength: waitList.length
    }
}
