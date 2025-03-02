import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId,//who is subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId,//whom the subscriber is subscribing
        ref: "User" 
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)