import express from "express"
import expressWs from "express-ws"
import {v4 as uuid} from "uuid"
import {sendMessage, init} from "./socket";

interface Problem {
    uid: string
}

const waitList = [] as Problem[]

const app = expressWs(express()).app;
init(app);

app.get('/judge', (req, res) => {
    const problem = {
        uid: uuid()
    }
    waitList.push(problem)
    setTimeout(() => {
        sendMessage(JSON.stringify(problem))
    }, 1000)
    res.send(problem.uid);
});

app.get('/', function (req, res) {
    res.send('HANA v1.0');
});

app.listen(80);
