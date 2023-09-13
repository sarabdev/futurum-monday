import clientPromise from "../../lib/mongodb";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const user = req.body;
    const isToken=jwt.verify(user.token,'futurumString')
    if(!isToken){
      res.json({error:true, message:"Token invalid, please login"})
      return
    }


    const userExist = await db.collection("users").findOne({email:isToken.email});
    if(!userExist){
        res.json({error:true, message:"Token invalid, please login"})
        return
    }
    
    res.json({error:false, message:"Token is valid."})

  } catch (e) {
    res.json({error:true, message:"Something went wrong please try again."})
  }
};