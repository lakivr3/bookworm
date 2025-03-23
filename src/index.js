import express from 'express'
import "dotenv/config"
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import { connectDB } from './lib/db.js'
import cors from 'cors'
import job from './lib/cron.js'

const app = express()

job.start()
app.use(express.json());
app.use(cors())


const PORT  = process.env.PORT 
app.use("/api/auth",authRoutes)
app.use("/api/books",bookRoutes)

app.listen(PORT || 3000,()=>{
    console.log(`server is running on port ${PORT | 3000}`)
    connectDB()
})