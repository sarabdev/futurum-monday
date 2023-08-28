const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose=require('mongoose')

mongoose.connect(process.env.DB_URL).then((data)=>{
    console.log("connected to db")
}).catch((e)=>{
    console.log("error with db")
})
const userSchema=new mongoose.Schema({
    email:String,
    subscriptionId:String,
    role:String
})

const User=new mongoose.model("Users",userSchema)

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
    console.log("hiiiiiii") 
    console.log(email)
    const existingUser=await User.findOne({email:email})
    if(existingUser){
      console.log("i am existing user")
       const stripeID=existingUser.subscriptionId;
       const link = await stripe.billingPortal.sessions.create({
        customer: stripeID,
        return_url: process.env.FRONT_END_URL,
      });
      res.json({error:false,link})
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ error: false, link }),
    };
  } catch (e) {
    console.log(e)
    return {
      statusCode: 200,
      body: JSON.stringify({ error: true, link: process.env.FRONT_END_URL }),
    };
  }
};
