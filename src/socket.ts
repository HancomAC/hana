import { WebSocket } from 'ws'
import { WebSocketResponse, WebSocketResponseType } from './types/response'
import { WebSocketRequest, WebSocketRequestType } from './types/request'
import { getJudgeInfo } from './judge'
import { getConfig } from './config'
import type KoaWebsocket from 'koa-websocket'

let wsObject = null as WebSocket | null
let messageList = [] as string[]

export function getMessageList() {
    const ret = messageList
    messageList = []
    return ret
}

export function sendWS(message: string) {
    if (wsObject) {
        wsObject.send(message, (e) => {
            if (e) {
                if (wsObject) {
                    wsObject.close()
                    wsObject = null
                }
                messageList.push(message)
            }
        })
    } else messageList.push(message)
}

export function sendMessage(type: WebSocketResponseType, data?: any) {
    const message = JSON.stringify({
        success: true,
        type,
        data,
    } as WebSocketResponse)
    sendWS(message)
}

export function sendError(reason: string) {
    const message = JSON.stringify({
        success: false,
        error: reason,
    } as WebSocketResponse)
    sendWS(message)
}

export function initWS(app: KoaWebsocket.App) {
    app.ws.use((ctx) => {
        if (wsObject) wsObject.close()
        wsObject = ctx.websocket
        for (const message of messageList) {
            wsObject.send(message)
        }
        messageList = []
        sendMessage(WebSocketResponseType.JUDGE_STATUS, getJudgeInfo())
        wsObject.on('message', (msg) => {
            try {
                const message = JSON.parse(msg.toString()) as WebSocketRequest
                if (!message.type) {
                    sendError('Invalid message')
                    return
                }
                switch (message.type) {
                    case WebSocketRequestType.JUDGE_INFO:
                        sendMessage(WebSocketResponseType.JUDGE_INFO, {
                            version: '1.0.0',
                            multiJudgeCount: getConfig('MultiJudgeCount'),
                        })
                        break
                    case WebSocketRequestType.JUDGE_STATUS:
                        sendMessage(
                            WebSocketResponseType.JUDGE_STATUS,
                            getJudgeInfo()
                        )
                        break
                    default:
                        sendError('Invalid message')
                        break
                }
            } catch (e) {
                sendError('JSON Parse Error')
            }
        })
        wsObject.on('disconnect', function () {
            wsObject = null
        })
    })
}
