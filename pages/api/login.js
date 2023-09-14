import clientPromise from "../../lib/mongodb";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const user = req.body;
    
    const userExist = await db.collection("users").findOne({email:user.email});
    if(!userExist){
        res.json({error:true, message:"Email or password is incorrect."})
        return
    }
    const isCorrect=await bcrypt.compare(user.password,userExist.password)
    if(!isCorrect){
        res.json({error:true, message:"Email or password is incorrect."})
        return
    }
    if(!userExist.isVerified){
      res.json({error:true, message:"Your email verification is pending. Check your email!"})
      return
    }
    const token=jwt.sign({_id:userExist._id, email:userExist.email},'futurumString')
    res.json({error:false, message:"Login Success.", token, user:{_id:userExist._id, username:userExist.username}})

  } catch (e) {
    res.json({error:true, message:"Something went wrong please try again."})
  }
};