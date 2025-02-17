import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    content: {
        type: string,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }


}, { timestamps: true }
)
export const Tweets = mongoose.model("Tweets", tweetSchema)
