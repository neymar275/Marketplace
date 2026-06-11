import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ListingService } from '../services/listing.service';
import { prisma } from '../lib/prisma';

export class ListingController {
  /**
   * Fetch active marketplace listings using cursor-based pagination
   */
  static getAll = async (req: Request, res: Response) => {
    try {
      const rawCursor = req.query.cursor;
      const cursor = Array.isArray(rawCursor) 
        ? (rawCursor[0] as string) 
        : (rawCursor as string | undefined);

      const limit = parseInt(req.query.limit as string) || 12;
      
      const result = await ListingService.getAllActive(cursor, limit);
      
      console.log('--- DEBUG OUTBOUND FETCH MATRIX ---');
      console.log('Sample Listing Keys:', result?.listings?.[0] ? Object.keys(result.listings[0]) : 'No entries found');
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error inside ListingController.getAll:', error);
      res.status(500).json({ error: 'Failed to retrieve inventory catalog feeds.' });
    }
  };

  /**
   * Get listings for the logged-in user
   */
  static getUserListings = async (req: Request, res: Response) => {
    try {
      let sellerId = (req as any).user?.id;

      // Fallback: manual token parsing
      if (!sellerId) {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') 
          ? authHeader.split(' ')[1] 
          : (req.cookies?.token || req.cookies?.refreshToken);

        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_access_key_change_in_prod') as any;
            sellerId = decoded.id;
          } catch (jwtErr: any) {
            console.warn('Token parsing fallback skipped:', jwtErr?.message);
          }
        }
      }

      if (!sellerId) {
        res.status(401).json({ error: 'Unauthorized profile access.' });
        return;
      }

      const listings = await ListingService.getUserInventory(sellerId);
      res.status(200).json({ data: listings });
    } catch (error: any) {
      console.error('Error inside ListingController.getUserListings:', error);
      res.status(500).json({ error: 'Internal system fault during user inventory aggregation.' });
    }
  };

  /**
   * Get single listing by slug
   */
  static getBySlug = async (req: Request, res: Response) => {
    try {
      // 🚀 FIXED: Cast parameter directly "as string" to fulfill strict compiler type contracts
      const slug = req.params.slug as string;

      if (!slug) {
        res.status(400).json({ error: 'Missing required parameter: slug.' });
        return;
      }

      const listing = await ListingService.getBySlug(slug);

      if (!listing) {
        res.status(404).json({ error: 'Listing not found.' });
        return;
      }

      res.status(200).json(listing);
    } catch (error: any) {
      console.error('Error inside ListingController.getBySlug:', error);
      res.status(500).json({ error: 'Internal system fault during single listing parsing.' });
    }
  };

  /**
   * Create new listing
   */
  static create = async (req: Request, res: Response) => {
    try {
      const { title, description, price, condition, categoryName, sellerId } = req.body;
      
      if (!title || !price || !categoryName || !sellerId) {
        res.status(400).json({ error: 'Missing required parameters: title, price, categoryName, sellerId.' });
        return;
      }

      const fileObjects = (req.files as Express.Multer.File[]) || [];
      let imagePaths = fileObjects.map(file => `/uploads/${file.filename}`);

      if (imagePaths.length === 0) {
        imagePaths.push('https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800');
      }

      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: categoryName }
      });

      if (!category) {
        const generatedSlug = categoryName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '');
          
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: generatedSlug,
            icon: 'bike' // default icon
          }
        });
      }

      const listing = await ListingService.create(sellerId, {
        title,
        description: description || '',
        price: parseFloat(price),
        condition: condition || 'GOOD',
        categoryId: category.id,
        images: imagePaths
      });

      res.status(201).json(listing);
    } catch (error: any) {
      console.error('Error in ListingController.create:', error);
      res.status(500).json({ error: error.message || 'Failed to create listing.' });
    }
  };
}