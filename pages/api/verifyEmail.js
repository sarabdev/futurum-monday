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
    if(userExist.verificationToken!=user.token){
      res.json({error:true, message:"Token invalid, please login"})
      return
    }
    const updateDocument = {
      $set: {
        ...userExist,
        verificationToken:null,
        resetToken:null,
        isVerified:true
     },
  };
  delete updateDocument.$set._id;
  await db.collection("users").updateOne({email:userExist.email},updateDocument)
    res.json({error:false, message:"Email Successfully Verified."})

  } catch (e) {
    res.json({error:true, message:"Something went wrong please try again."})
  }
};