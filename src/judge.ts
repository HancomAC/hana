import {sendMessage} from "./socket";
import type {Problem} from "./types/problem";


const waitList = [] as Problem[]

function judgeFinishHandler() {
    const problem = waitList.shift()
    if (problem) {
        sendMessage({
            type: "judgeFinish",
            data: {
                uid: problem.uid,
                score: 100,
                reason: 'AC'
            }
        })
    }
    if (waitList.length > 0) judge(waitList[0])
}

function judge(problem: Problem) {
    setTimeout(() => {
        judgeFinishHandler()
    }, 1000)
}

export function requestJudge(problem: Problem) {
    if (waitList.length === 0) judge(problem)
    waitList.push(problem)
}

export function getJudgeInfo() {
    return {
        waitListLength: waitList.length
    }
}
