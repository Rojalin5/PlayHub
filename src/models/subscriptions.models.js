import mongoose, { Schema } from "mongoose";
import { types } from "util";

const subscriptionSchema = new Schema({
    subscriber: {
        types: Schema.Types.ObjectId,//who is subscribing
        ref: "User"
    },
    channel:{
        types: Schema.Types.ObjectId,//whom the subscriber is subscribing
        ref: "User" 
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)