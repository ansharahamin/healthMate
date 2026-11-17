import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1','8.8.8.8'])
import mongoose from 'mongoose'
import 'dotenv/config'
async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured.')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB')
}

export default connectDB