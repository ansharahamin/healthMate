import app from "./src/app.js"
import db from './src/db/db.js'
import {Server} from "socket.io"
import {createServer} from 'http'
import jwt from 'jsonwebtoken'
import { setSocketServer } from './src/socket.js'
import { isAllowedCorsOrigin } from './src/utils/cors-origin.js'

const PORT = 3000
const httpServer = createServer(app)
const io = new Server(httpServer,{
    cors:{
        origin(origin, callback) {
            callback(null, !origin || isAllowedCorsOrigin(origin))
        },
        credentials: true,
    }
})
setSocketServer(io)

io.use((socket, next) => {
    const tokenCookie = socket.handshake.headers.cookie
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('token='))
    if (!tokenCookie) {
        return next(new Error('Authentication required.'))
    }

    try {
        const token = decodeURIComponent(tokenCookie.slice('token='.length))
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        socket.data.userId = payload.id.toString()
        return next()
    } catch {
        return next(new Error('Authentication required.'))
    }
})

io.on('connection',(socket)=>{
    socket.join(`user:${socket.data.userId}`)
})

async function startServer() {
    await db()
    await new Promise((resolve, reject) => {
        httpServer.once('error', reject)
        httpServer.listen(PORT, () => {
            httpServer.off('error', reject)
            resolve()
        })
    })
    console.log(`server is running on port ${PORT}`)
}

startServer().catch((error) => {
    console.error('Server startup failed:', error)
    process.exitCode = 1
})