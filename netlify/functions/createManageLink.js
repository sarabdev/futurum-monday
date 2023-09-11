const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': "https://chat.futurum.one",
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
}
exports.handler = async (event) => {
  try {
    let email=event.queryStringParameters.email

    // const { email } = JSON.parse(event.body);
    const customers=await stripe.customers.list()
    const matchingCustomer = customers.data.find(customer => customer.email ==email);
    let link=process.env.FRONT_END_URL;
    if(matchingCustomer){
       const stripeID=matchingCustomer.id;
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
