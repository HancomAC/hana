import express from "express";
import expressWs from "express-ws";
import {WebSocket} from 'ws'
import {v4 as uuid} from "uuid";

interface Problem {
    uid: string
}

const app = expressWs(express()).app;
const waitList = [] as Problem[]
let wsObject = null as WebSocket | null

app.get('/judge', (req, res) => {
    const problem = {
        uid: uuid()
    }
    waitList.push(problem)
    setTimeout(() => {
        if (wsObject) {
            wsObject.send(JSON.stringify(problem))
        }
    }, 1000)
    res.send(problem.uid);
});

app.get('/', function (req, res, next) {
    res.send('Hello World!');
});

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
            console.log('disconnect');
        });
        console.log(msg);
    });
});

app.listen(80);
