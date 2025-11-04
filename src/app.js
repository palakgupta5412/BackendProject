import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

//to get all powers of express in app variable
const app = express();

//cross origin resource sharing : to allow frontend and backend to communicate for which we need to allow cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,    //frontedn setup: we have set the CORS_ORIGIN=* in .env file to allow all origins to access our backend
    credentials: true,
}));

//This is used to allow json data in request body and to allow large data to be sent from frontend to backend
app.use(express.json({
    limit: "50mb"   
}));
//so basically when we send data to backend it shows in the path of url in encoded format but with this we can send large data in request body and decode it properly
app.use(express.urlencoded({ extended: true , limit: "50mb" }));

//to allow static files like images ,css files to be accessed from public folder
app.use(express.static("public"));

//to allow cookies to be sent from frontend to backend
app.use(cookieParser());

//Routes : 

//Routes are imported here and used with app.use
import userRouter from "./routes/user.route.js";
app.use('/api/v1/users' , userRouter);   //localhost:8000/api/v1/users  , main route for user related routes , userRoute will handle subroutes like /register , /login etc jo bhi uss file mein defined honge 

export {app};