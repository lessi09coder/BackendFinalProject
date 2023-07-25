const STRIPE__SECRET__KEY = process.env.STRIPE__SECRET__KEY
const stripe = require('stripe')(STRIPE__SECRET__KEY);

const pucharseStripe = async ( amount, price) => {    
        return await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
        });       
}

module.exports = { pucharseStripe };





/* 
createPaymentIntent: async function (amount, currency) {
    return await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
    });
}, */