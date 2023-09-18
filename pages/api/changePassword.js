import clientPromise from "../../lib/mongodb";
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const user = req.body;

    const isTokenOkay=jwt.verify(user.token,'futurumString')
    if(!isTokenOkay){
        res.json({error:true, message:"Token expired or invalid."})
        return
    }   
    console.log(isTokenOkay)
    const userExist=await db.collection("users").findOne({email:isTokenOkay.email});
    if(!userExist || !userExist.resetToken){
        res.json({error:true, message:"Token expired or invalid."})
        return
    }
    const hashedPassword=await bcrypt.hash(user.password,10)
    const updateDocument = {
        $set: {
          ...userExist,
          password:hashedPassword,
          resetToken:null,
          verificationToken:null,
       },
    };
    delete updateDocument.$set._id;
    await db.collection("users").updateOne({email:userExist.email},updateDocument)

    res.json({error:false,message:"Password changed please login."});
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
};