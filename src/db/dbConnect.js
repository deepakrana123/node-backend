
import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"


export const  connectDb=async()=>{
    try{
        console.log(process.env.MONGOURL,"process.env.mongouri")
      await mongoose.connect(`${process.env.MONGOURL}/${DB_NAME}`)
    //  console.log(connectionInstance,`\n mongodb connection`)

    }
    catch(error){
        console.log("Error:",error)
        process.exit(1)
    }

}