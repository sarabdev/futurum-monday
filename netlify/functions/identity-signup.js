const stripe = require('stripe')("sk_test_51Na6KqEpEL3jFdarNkEe9kJENhhwpDY2R4u9IrS6mrDrNHFN8zABC79u8SRE5aEpzjhtNhSpwBw5tw4i7OzBRQtX00Hwr1Armb");

exports.handler = async function(event, context, callback) {
  const data = JSON.parse(event.body);
  const { user } = data;
  // create a new customer in Stripe
  //  const customer = await stripe.customers.create({ email: user.email, name:user.name });

  // // // subscribe the new customer to the free plan
  // await stripe.subscriptions.create({
  //   customer: customer.id,
  //   items: [{ price:"price_1NjFlHEpEL3jFdarAGB6XUBh"}],
  // });

  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        roles: ['free'],
      },
    }),
  };
};