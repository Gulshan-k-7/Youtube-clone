
import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";
const app = express();

dotenv.config();


connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });     
})
.catch((err) => {   
    console.log("Error while connecting to database", err);
    process.exit(1);
}





/*
(async ()=>{
    try{
       await mongoose.connect(~`${process.env.MONGO_URI}/${DB_NAME}`)
       app.on("error", (err) => {
           console.error("Error while connecting to database", err);
           throw err;
       });
       app.listen(process.env.PORT, () => {
           console.log(`Server is running on port ${process.env.PORT}`);
       });
    }
    catch(err){
        console.log("Error while connecting to database",err);
        throw err;
    }

})()
    */