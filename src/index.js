
import { connectDB } from "./db/index.js";
import dotenv from "dotenv";
import express from "express";
// const app = express();
import { app } from "./app.js";

dotenv.config();
await connectDB()
.then(() => {
    app.listen(process.env.PORT || 5000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Error in connecting to DB", err);
});