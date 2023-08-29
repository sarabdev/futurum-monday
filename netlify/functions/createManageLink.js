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
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://main--luxury-pothos-0270e0.netlify.app',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
}
exports.handler = async (event) => {
  try {
    let email=event.queryStringParameters.email

    // const { email } = JSON.parse(event.body);
    const existingUser=await User.findOne({email})
    let link=process.env.FRONT_END_URL;
    if(existingUser){
       const stripeID=existingUser.subscriptionId;
       link = await stripe.billingPortal.sessions.create({
        customer: stripeID,
        return_url: process.env.FRONT_END_URL,
      });
    }
    return {
      statusCode: 200,
      headers:CORS_HEADERS,
      body: JSON.stringify({ error: false, link }),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers:CORS_HEADERS,
      body: JSON.stringify({ error: true, link: process.env.FRONT_END_URL }),
      
    };
  }
};
