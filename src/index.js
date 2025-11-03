import { db_name } from "./constants.js";
import { connectDB } from "./db/index.js";
import dotenv from "dotenv";
dotenv.config();
connectDB()
.then(() => {
    app.lsiten(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("Error in connecting to DB", err);
});