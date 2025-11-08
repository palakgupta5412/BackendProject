import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    // The user that is subscribing
    subscriber : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },

    // The channel that the user is subscribing to
    channel : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    }

})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);