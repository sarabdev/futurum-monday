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
    const { email, name } = JSON.parse(event.body);

    const isExist=await User.findOne({email:email})
    if(!isExist){
    const customer = await stripe.customers.create({ email: email, name:name});
  let responseBody;
   // // subscribe the new customer to the free plan
   await stripe.subscriptions.create({
     customer: customer.id,
     items: [{ price: 'price_1NjFlHEpEL3jFdarAGB6XUBh' }], // Use the Price ID of the specific product
    });

   const newEntry=new User({
    email:email,
    role:"free",
    subscriptionId:customer.id
   })  
   await newEntry.save()
      responseBody={error:false,userRole:"free"}
   }
   else{
    const subscriptions = await stripe.subscriptions.list({
      customer: isExist.subscriptionId,
    });
    const sortedSubscriptions = subscriptions.data.sort((a, b) =>
    b.created - a.created
    );
    if(sortedSubscriptions.length>0){
      if(sortedSubscriptions[0].plan.amount>0){
        responseBody={error:false, userRole:"pro"}
      }
      else{
        responseBody={error:false, userRole:"free"}

      }
    }
    else{   responseBody={error:false, userRole:"free"}
  }

   }

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    };
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: true, userRole: "free" }),
    };
  }
};
