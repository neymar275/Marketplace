import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'; // 👈 Imported to parse session tokens safely
import { ListingService } from '../services/listing.service';
import { prisma } from '../lib/prisma';

export class ListingController {
  /**
   * Fetch active marketplace listings using cursor-based pagination parameters
   */
  static getAll = async (req: Request, res: Response) => {
    try {
      const cursor = req.query.cursor as string | undefined;
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
   * FIXED: Aggregates inventory items belonging strictly to the active logged-in profile session
   */
  static getUserListings = async (req: Request, res: Response) => {
    try {
      let sellerId = (req as any).user?.id;

      // Fallback: If no global auth middleware populated req.user, parse the session token manually
      if (!sellerId) {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : (req.cookies?.token || req.cookies?.refreshToken);

        if (token) {
          try {
            // Decodes the token matching your environment signature secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as any;
            sellerId = decoded.id;
          } catch (jwtErr: any) {
  console.warn('Dashboard automatic fallback token parsing skipped:', jwtErr?.message || jwtErr);
        }
      }

      // If still no identity can be resolved, reject the request safely
      if (!sellerId) {
        res.status(401).json({ error: 'Unauthorized profile access. Active session token missing.' });
        return;
      }

      console.log(`Fetching active marketplace inventory rows for Seller ID: ${sellerId}`);
      const listings = await ListingService.getUserInventory(sellerId);

      res.status(200).json({ data: listings });
    } catch (error: any) {
      console.error('Error inside ListingController.getUserListings:', error);
      res.status(500).json({ error: 'Internal system fault during user inventory aggregation.' });
    }
  };

  /**
   * Fetch a single unique listing using its URL slug parameter descriptor
   */
  static getBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      if (!slug) {
        res.status(400).json({ error: 'Missing required parameter field: slug.' });
        return;
      }

      const listing = await ListingService.getBySlug(slug);

      if (!listing) {
        res.status(404).json({ error: 'The requested marketplace listing could not be found.' });
        return;
      }

      res.status(200).json(listing);
    } catch (error: any) {
      console.error('Error inside ListingController.getBySlug:', error);
      res.status(500).json({ error: 'Internal system fault during single listing parsing.' });
    }
  };

  /**
   * Process text and multi-part data files, passing a unified image array to the Service layer
   */
  static create = async (req: Request, res: Response) => {
    try {
      const { title, description, price, condition, categoryName, sellerId } = req.body;

      if (!title || !price || !categoryName || !sellerId) {
        res.status(400).json({ error: 'Missing required parameter: title, price, categoryName, or sellerId.' });
        return;
      }

      const fileObjects = (req.files as Express.Multer.File[]) || [];
      let imagePaths = fileObjects.map(file => `/uploads/${file.filename}`);

      if (imagePaths.length === 0) {
        imagePaths.push('https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800');
      }

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
            slug: generatedSlug
          }
        });
      }

      const listing = await ListingService.create(sellerId, {
        title,
        description: description || '',
        price,
        condition,
        categoryId: category.id,
        images: imagePaths
      });

      res.status(201).json(listing);
    } catch (error: any) {
      console.error('Unhandled exception caught inside ListingController.create:', error);
      res.status(500).json({ error: error.message || 'Internal engine error during asset model creation.' });
    }
  };
}