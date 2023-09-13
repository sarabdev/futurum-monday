import clientPromise from "../../lib/mongodb";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const user = req.body;
    
    const userExist = await db.collection("users").findOne({email:user.email});
    if(userExist){
        res.json({error:true, message:"User already exist with this email."})
        return
    }
    const hashedPassword=await bcrypt.hash(user.password,10)
    await db.collection('users').insertOne({...user, password:hashedPassword})
    res.json({error:false, message:"User account created successfully please login."})

  } catch (e) {
    res.json({error:true, message:"Something went wrong please try again."})
  }
};