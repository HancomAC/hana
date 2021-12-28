import {WebSocket} from "ws";
import expressWs from "express-ws";


let wsObject = null as WebSocket | null

export function sendMessage(message: any) {
    if (wsObject) {
        wsObject.send(JSON.stringify(message));
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
