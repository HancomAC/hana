import express from 'express'
import expressWs from 'express-ws'
import { v4 as uuid } from 'uuid'
import { init } from './socket'
import { requestJudge } from './judge'
import { JudgeRequest } from './types/request'

import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import path from 'path'

const app = expressWs(express()).app
init(app)
app.use(bodyParser.json())

app.post('/judge', (req, res) => {
    try {
        const problem = {
            uid: uuid(),
            language: req.body.language,
            judgeType: req.body.judgeType,
            source: req.body.source,
            dataSet: req.body.dataSet,
            timeLimit: req.body.timeLimit,
            memoryLimit: req.body.memoryLimit,
            specialJudge: req.body.specialJudge,
        } as JudgeRequest
        requestJudge(problem)
        res.send({ success: true, uid: problem.uid })
    } catch (e) {
        res.status(400)
        res.send({ success: false })
    }
})

app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'res', 'test.html'))
})

app.get('/res/logo', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'res', 'logo.png'))
})

app.get('/res/github', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'res', 'github.png'))
})

app.get('/res/docs', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'res', 'docs.png'))
})

app.get('/res/test', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'res', 'test.png'))
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'res', 'index.html'))
})

app.use(favicon(__dirname + '/../res/logo.ico'))

app.use('*', function (req, res) {
    res.redirect('http://jungol.co.kr')
})

app.listen(80)
