// backend/controllers/paymentController.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { price_cents, currency, success_url, cancel_url } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: {
        currency,
        product_data: { name: "Abonnement SnapExam" },
        unit_amount: price_cents,
      }, quantity: 1 }],
    mode: "payment",
    success_url,
    cancel_url,
  });
  res.json({ url: session.url });
};
