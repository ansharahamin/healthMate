let io

export function setSocketServer(socketServer) {
    io = socketServer
}

export function emitToUser(userId, event, data) {
    if (!io) {
        throw new Error('Socket.IO has not been initialized.')
    }

    io.to(`user:${userId}`).emit(event, data)
}
