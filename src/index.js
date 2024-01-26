
import express from "express"
import { connectDb } from "./db/dbConnect.js";
import dotenv from "dotenv"

const app=express()
dotenv.config({
  path:"./.env"
})

connectDb()
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT, () => {
  console.log(`Example ap listening on port ${process.env.PORT}`)
})
