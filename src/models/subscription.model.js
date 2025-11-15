// Understanding this schema , why we need it how it helps us and how we use it?
// Assume users to be a,b,c .... 
// Assume channels to be A,B,C...
// (Both belong to the schema User)

// Suppose user 'a' subscribes to channel 'C' then an object of this below schema will be made with subscriber as 'a' and channel as 'C'
// Now if user 'b' subscribes to channel 'C' then another object will be made with subscriber as 'b' and channel as 'C'
// Now if user 'a' subscribes to channel 'A' then another object will be made with subscriber as 'a' and channel as 'A'

//Now if we want to fetch the number of subcribers of 'C' then we will fetch all the objects where channel is 'C'
//If we want to fetch all the channels user 'a' has subscribed to then we will fetch all the objects where subscriber is 'a'

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