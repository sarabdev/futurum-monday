const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



const CORS_HEADERS = {
  'Access-Control-Allow-Origin': "*",
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
}

exports.handler = async (event) => {
  try {
  
    let email=event.queryStringParameters.email;
    let name=event.queryStringParameters.name;
    const customers=await stripe.customers.list()
     const matchingCustomer = customers.data.find(customer => customer.email ==email);
     let responseBody={error:false, userRole:"free", email}

    if(matchingCustomer){
        const subscriptions = await stripe.subscriptions.list({
                customer: matchingCustomer.id,
    });

    const sortedSubscriptions = subscriptions?.data?.sort((a, b) =>
           b.created - a.created
    );
    if(sortedSubscriptions.length>0){
      if(sortedSubscriptions[0].plan.amount>0){
        responseBody={error:false, userRole:"pro"}
      }
      else{
        responseBody={error:false, userRole:"free", email}

      }
    }
    else{   responseBody={error:false, userRole:"free",email}
      }

    }
    else{
     const customer= await stripe.customers.create({ email: email, name:name});
     await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1NjFlHEpEL3jFdarAGB6XUBh' }], // Use the Price ID of the specific product
     });
    }
    

    return {
      statusCode: 200,
      headers:CORS_HEADERS,
      body: JSON.stringify(responseBody),
    };
  } catch (e) {
   // console.log(e)
    return {
      statusCode: 200,
      headers:CORS_HEADERS,
      body: JSON.stringify({ error: true, userRole: "free" ,error:e}),
    };
  }
};
