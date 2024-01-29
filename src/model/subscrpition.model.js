import mongoose, { Schema } from "mongoose";

const subsciptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //one who is subcirbing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,  // one whoes channel is subscribing
        ref:"User"
    }
},{
    timestamps:true
});

export const Subsciption = mongoose.model(
  "Scubscriptions",
  subsciptionSchema
);
