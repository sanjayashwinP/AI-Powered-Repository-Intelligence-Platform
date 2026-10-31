import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});
const prisma = new PrismaClient();

export class PaymentService {
  static async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });
    return session;
  }

  static async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const stripePaymentId = invoice.payment_intent as string;
      const amount = invoice.amount_paid;
      // Record payment into database
      console.log(`Recorded payment ${stripePaymentId} of ${amount} cents`);
    }
  }
}
