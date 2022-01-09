import express from 'express'
import expressWs from 'express-ws'
import { v4 as uuid } from 'uuid'
import { getMessageList, init } from './socket'
import { requestJudge } from './judge'
import { JudgeRequest } from './types/request'
import { is } from 'typescript-is'

import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import path from 'path'

process.on('uncaughtException', (e) => {
    console.log('uncaughtException:', e)
})

const PORT = 80

const app = expressWs(express()).app
init(app)
app.use(
    bodyParser.json({
        limit: '100mb',
    })
)

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
        if (is<JudgeRequest>(problem)) {
            requestJudge(problem)
            res.send({ success: true, uid: problem.uid })
        } else {
            res.status(400)
            res.send({ success: false })
        }
    } catch (e) {
        console.log(e)
        res.status(400)
        res.send({ success: false })
    }
})

app.get('/pull', (req, res) => {
    res.set('Cache-Control', 'no-store')
    res.send({ success: true, data: getMessageList() })
})

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'res', 'test.html'))
})

app.get('/res/logo', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'res', 'logo.png'))
})

app.get('/res/github', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'res', 'github.png'))
})

app.get('/res/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'res', 'docs.png'))
})

app.get('/res/test', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'res', 'test.png'))
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'res', 'index.html'))
})

app.use(favicon(__dirname + '/../res/logo.ico'))

app.use('*', (req, res) => {
    res.redirect('http://jungol.co.kr')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})
