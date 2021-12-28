import {WebSocket} from "ws";
import expressWs from "express-ws";
import {WebSocketResponse, WebSocketResponseType} from "./types/response";

let wsObject = null as WebSocket | null

export function sendMessage(success: boolean, type: WebSocketResponseType, data: any) {
    if (wsObject) {
        wsObject.send(JSON.stringify({
            success,
            type,
            data
        }));
    }
}

export function init(app: expressWs.Application) {
    app.ws('/', (ws, req) => {
        if (wsObject) {
            ws.close()
            return
        }
        wsObject = ws
        ws.on('message', function (msg) {
            ws.on('disconnect', function () {
                wsObject = null
            });
        });
    });
}
