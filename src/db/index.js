import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectDB() {
    try {
        const connectionInstance =await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Mongo DB Connected: || host name ${connectionInstance.connection.host}`);
    }catch (err) {
        console.log("Error while connecting to database", err);
        throw err;
        process.exit(1);
    }   
}

export default connectDB;