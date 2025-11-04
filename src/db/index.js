import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDB = async () => {
    try{
        const connection = await mongoose.connect(
            `${process.env.MONGO_URI}/${db_name}`
        )
        console.log("DB connected successfully, connection : ", connection.connection.host);
    }
    catch(err){
        console.log("Error in DB connection", err);
        process.exit(1);
    }
}

export {connectDB};
