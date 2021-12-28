import {WebSocket} from "ws";
import expressWs from "express-ws";


let wsObject = null as WebSocket | null

export function sendMessage(message: string) {
    if (wsObject) {
        wsObject.send(message)
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
            ws.send(JSON.stringify({a: 1, b: 2}));
            ws.on('disconnect', function () {
                wsObject = null
            });
        });
    });
}
