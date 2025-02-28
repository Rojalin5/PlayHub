import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    video: {
        type: String, //cloudinary url
        required: [true, "Video file is required"],
    },
    thumbnail: {
        type: String, //cloudinary url
        required: [true, "Thumbnail is required"],
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 60
    }
    ,
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }, 
    hash:{
        type:String,
        unique:true,
        select:false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)