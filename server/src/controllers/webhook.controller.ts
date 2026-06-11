import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

// Initialize Stripe directly here for the webhook handler
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any,
});

export class WebhookController {
  static handleStripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      res.status(400).send('Webhook Error: Missing signature or secret.');
      return;
    }

    let event: any;

    try {
      // req.body must be the raw Buffer here, NOT parsed JSON!
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`[Webhook Signature Error]: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the specific checkout success event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      const orderId = session.metadata?.orderId;
      const listingId = session.metadata?.listingId;

      if (orderId && listingId) {
        try {
          // 1. Mark Order as PAID
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PAID' }
          });

          // 2. Decrement Stock & potentially mark as SOLD
          const listing = await prisma.listing.update({
            where: { id: listingId },
            data: { stock: { decrement: 1 } }
          });

          if (listing.stock <= 0) {
            await prisma.listing.update({
              where: { id: listingId },
              data: { status: 'SOLD' }
            });
          }

          console.log(`[Stripe Webhook] Order ${orderId} marked PAID. Stock updated.`);
        } catch (dbError) {
          console.error('[Stripe Webhook DB Error]', dbError);
        }
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  };
}