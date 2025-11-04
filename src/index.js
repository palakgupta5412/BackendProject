
import { connectDB } from "./db/index.js";
import dotenv from "dotenv";
import express from "express";
const app = express();

dotenv.config();
connectDB()
.then(() => {
    app.listen(process.env.PORT || 1000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT || 1000}`);
    })
})
.catch((err) => {
    console.log("Error in connecting to DB", err);
});