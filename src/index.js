
import { connectDb } from "./db/dbConnect.js";
import dotenv from "dotenv";
import {app} from "./app.js"


dotenv.config({
  path:"./.env"
})

connectDb().then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log("server running on", `http://localhost:${process.env.PORT}/`)
  })
}).catch((error)=>{
  console.log("Mongo db connection fail",error)
})

