import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1','8.8.8.8'])
import mongoose from 'mongoose'
import 'dotenv/config'

let connectionPromise

async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured.')
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
            .then((connection) => {
                connectionPromise = undefined
                console.log('Connected to DB')
                return connection
            })
            .catch((error) => {
                connectionPromise = undefined
                throw error
            })
    }

    return connectionPromise
}

export default connectDB