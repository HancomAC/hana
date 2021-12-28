import express from 'express';
import {Server} from 'socket.io'

const app = express();
const io = new Server({})

app.get('/', (req, res) => {
    res.send('hi')
})

io.on('connection', (socket) => {
    console.log('a user connected');
    io.emit('stats', {numClients: 1});
    socket.on('message', (message) => {
        console.log(message)
    })
})

app.listen(80, () => {
    console.log('listening on port 80')
})
io.listen(3000)
