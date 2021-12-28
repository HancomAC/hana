import {WebSocket} from "ws";
import expressWs from "express-ws";
import {WebSocketResponse, WebSocketResponseType} from "./types/response";
import {WebSocketRequest, WebSocketRequestType} from "./types/request";
import {getJudgeInfo} from "./judge";

let wsObject = null as WebSocket | null

export function sendMessage(type: WebSocketResponseType, data?: any) {
    if (wsObject) {
        wsObject.send(JSON.stringify({
            success: true,
            type,
            data
        } as WebSocketResponse));
    }
}

export function sendError(reason: string) {
    if (wsObject) {
        wsObject.send(JSON.stringify({
            success: false,
            error: reason
        } as WebSocketResponse));
    }
}

export function init(app: expressWs.Application) {
    app.ws('/', (ws, req) => {
        if (wsObject) wsObject.close()
        wsObject = ws
        sendMessage(WebSocketResponseType.JUDGE_STATUS, getJudgeInfo())
        ws.on('message', function (msg) {
            try {
                const message = JSON.parse(msg.toString()) as WebSocketRequest
                if (!message.type) {
                    sendError('Invalid message')
                    return
                }
                switch (message.type) {
                    case WebSocketRequestType.JUDGE_INFO:
                        sendMessage(WebSocketResponseType.JUDGE_INFO, {
                            version: "1.0.0"
                        })
                        break
                    case WebSocketRequestType.JUDGE_STATUS:
                        sendMessage(WebSocketResponseType.JUDGE_STATUS, getJudgeInfo())
                        break
                    default:
                        sendError('Invalid message')
                        break
                }
            } catch (e) {
                sendError('JSON Parse Error')
            }
        });
        ws.on('disconnect', function () {
            wsObject = null
        });
    });
}
