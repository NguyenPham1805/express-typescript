import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'

import authRoute from './routes/auth.route'
// import userRoute from './routes/user.route'
import postRoute from './routes/post.route'

dotenv.config()

const PORT = process.env.PORT || 5000

const app: Application = express()

mongoose
  .connect(process.env.MONGOOSE_DB_URL!)
  .then(() => console.log('Mongoose conected'))
  .catch((err) => console.log('errr: ', err))

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/post', postRoute)

app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`))
