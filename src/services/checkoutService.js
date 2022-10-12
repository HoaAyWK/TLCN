const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { Payment, User } = require('../models');

const checkoutWithStripe = async (userId, items) => {
    const payment = await Payment.create({ user: userId, items, method: 'card' });
    console.log(payment);
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: config.payment.success_url,
            cancel_url: config.payment.cancel_url,
            payment_method_types: ['card'],
            line_items: items.map((item) => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name
                        },
                        unit_amount: item.amount,
                    },
                    quantity: 1
                }
            }),
            metadata: {
                'user_id': userId,
                'payment_id': payment._id.toString()
            }
        });

        return session;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const webhook = async (req) => {
    let event = req.body;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret) {
        const signature = req.headers["stripe-signature"];
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret
            );

        } catch (error) {
            console.log(`⚠️  Webhook signature verification failed.`, error.message);
            throw new ApiError(500, error.message);
        }
    }

    switch (event.type) {
        case "checkout.session.completed":
            const { user_id, payment_id } = event.data.object.metadata;
            const payment = await Payment.findById(payment_id);

            if (!payment) {
                console.log('Payment not found');
            }

            const user = await User.findById(user_id);
            
            for (let item of payment.items) {
                user.points = user.points + item.amount;
            }

            payment.status = 'Success';
            
            await user.save();
            await payment.save();

            break;
        default:
            console.log(`Unhandled event type ${event.type}.`);
    }
};

module.exports = {
    checkoutWithStripe,
    webhook
};