import express from "express"
import expressWs from "express-ws"
import {v4 as uuid} from "uuid"
import {sendMessage, init} from "./socket";
import {requestJudge} from "./judge";
import {Problem} from "./types/problem";


const app = expressWs(express()).app;
init(app);

app.get('/judge', (req, res) => {
    const problem = {
        uid: uuid()
    } as Problem;
    requestJudge(problem);
    res.send(problem.uid);
});

app.get('/', function (req, res) {
    res.send('HANA v1.0');
});

app.listen(80);
