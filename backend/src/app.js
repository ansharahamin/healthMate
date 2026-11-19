import express from "express";
import 'dotenv/config'
import cors from "cors";
import authRoutes from './routes/auth.routes.js'
import fileRoutes from './routes/files.routes.js'
import vitalRoutes from './routes/vitals.routes.js'
import aiRoutes from './routes/ai.routes.js'
import userRoutes from './routes/users.routes.js'
import cookieParser from "cookie-parser";
import { isAllowedCorsOrigin } from './utils/cors-origin.js'
const app = express()
const corsOptions = {
  origin(origin, callback) {
    callback(null, !origin || isAllowedCorsOrigin(origin))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}
app.options(/.*/, cors(corsOptions))
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/vitals', vitalRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/users', userRoutes)
export default app