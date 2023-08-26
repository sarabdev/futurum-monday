const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context, callback) {
  const data = JSON.parse(event.body);
  const { user } = data;
  // create a new customer in Stripe
   const customer = await stripe.customers.create({ email: user.email, name:user.name });

  // // subscribe the new customer to the free plan
  await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: 'price_1NjFlHEpEL3jFdarAGB6XUBh'}],
  });

  const responseBody = {
    app_metadata: {
      roles: ["registered"]
    }
  };
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(responseBody)
  });
};