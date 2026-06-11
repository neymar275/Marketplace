import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { asyncHandler } from '../middleware/asyncHandler.middleware';

const router = Router();

router.post('/checkout', asyncHandler(OrderController.createCheckout));

export default router;