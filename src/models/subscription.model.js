import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps })

const subscription = mongoose.model("Subscription", subscriptionSchema)
export default subscription