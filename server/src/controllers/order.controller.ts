import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  static createCheckout = async (req: Request, res: Response) => {
    const { buyerId, listingId } = req.body;

    if (!buyerId || !listingId) {
      res.status(400).json({ error: 'Missing customer or product profiles.' });
      return;
    }

    const sessionUrl = await OrderService.createCheckoutSession(buyerId, listingId);
    res.status(200).json({ url: sessionUrl });
  };
}