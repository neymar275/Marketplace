import { prisma } from '../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any, // Targets standard modern API constraints
});

export class OrderService {
  static async createCheckoutSession(buyerId: string, listingId: string) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== 'ACTIVE' || listing.stock < 1) {
      throw { statusCode: 400, message: 'Item is no longer available.' };
    }

    // 1. Create a records order tracking shell (PENDING status)
    const order = await prisma.order.create({
      data: {
        buyerId,
        status: 'PENDING',
        total: listing.price,
        items: {
          create: {
            listingId: listing.id,
            quantity: 1,
            priceAtPurchase: listing.price
          }
        }
      }
    });

    // 2. Generate Stripe Session link
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: listing.title, description: listing.description },
          unit_amount: Math.round(Number(listing.price) * 100), // convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: { orderId: order.id, listingId: listing.id }
    });

    // 3. Inject Stripe Session ID onto our internal order reference
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id }
    });

    return session.url;
  }
}