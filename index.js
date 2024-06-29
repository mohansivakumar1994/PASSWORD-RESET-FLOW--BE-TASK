import express from "express"
import dotenv from 'dotenv'
import mongoose from "mongoose"
import { UserRouter } from "./Routes/user.js"
import cors from 'cors'
import cookieParser from "cookie-parser"
const netlify = require('./https://forgetpassword07.netlify.app/')
dotenv.config()


const app = express()

app.use(express.json())
app.use(cors({
    origin:["http://localhost:5173","https://forgetpassword07.netlify.app/"],
    credentials:true
}))
app.use(cookieParser())
app.use('/auth',UserRouter)

mongoose.connect('mongodb+srv://mohansivakumar359:mohan%402024@mohan-mongo.uf15eex.mongodb.net/')


app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`);
})