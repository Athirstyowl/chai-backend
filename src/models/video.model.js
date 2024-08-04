import mongoose, { Schema, model } from 'mongoose'

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true,
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true,
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, // cloudinary 
            required: true
        },
        views: {
            type: Number, //cloudinary url
            default: 0,
        },
        isPublished: {
            type: Boolean, //cloudinary url
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, { timestampes: true })

videoSchema.plugin(mongooseAggregatePaginate) // used for agregation pipeline queries on mongodb

export const Video = model('Video', videoSchema)