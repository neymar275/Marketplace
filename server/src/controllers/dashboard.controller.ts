import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static getStats = async (req: Request, res: Response) => {
    // req.user is guaranteed to exist because of requireAuth middleware
    const sellerId = req.user!.userId; 
    
    const data = await DashboardService.getSellerStats(sellerId);
    res.status(200).json(data);
  };
}