import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

interface ListingFilters {
  search?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export class ListingService {
  /**
   * Fetches active items using full-text SQL macros, dynamic criteria matrices, and cursor bounds
   */
    /**
   * Production-ready active listings fetch with proper error handling, logging, and graceful degradation
   */
  static async getAllActive(cursor?: string, limit: number = 12, filters: ListingFilters = {}) {
    try {
      console.log(`[ListingService] Fetching listings | cursor: ${cursor}, limit: ${limit}, filters:`, filters);

      const where: any = {
        status: 'ACTIVE', // Only show published listings in production
      };

      // Full-text search (safe fallback if no results)
      let searchIds: string[] | null = null;
      if (filters.search?.trim()) {
        const searchTerm = filters.search.trim().split(/\s+/).join(' & ') + ':*';
        const rawResults = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Listing"
          WHERE status = 'ACTIVE' 
            AND search_vector @@ to_tsquery('english', ${searchTerm})
        `;
        searchIds = rawResults.map(r => r.id);

        if (searchIds.length > 0) {
          where.id = { in: searchIds };
        } else {
          console.log(`[ListingService] No results for search term: "${filters.search}"`);
          return { listings: [], data: [], nextCursor: undefined };
        }
      }

      // Apply other filters safely
      if (filters.category && filters.category !== 'all') {
        where.category = { slug: filters.category };
      }
      if (filters.condition && filters.condition !== 'all') {
        where.condition = filters.condition;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' };
      if (filters.sort === 'price_asc') orderBy = { price: 'asc' };
      if (filters.sort === 'price_desc') orderBy = { price: 'desc' };
      if (filters.sort === 'popular') orderBy = { views: 'desc' };

      const listings = await prisma.listing.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, name: true, avatar: true } }
        }
      });

      const hasMore = listings.length > limit;
      const nextCursor = hasMore ? listings[listings.length - 1].id : undefined;

      if (hasMore) listings.pop(); // Remove extra item used for pagination

      console.log(`[ListingService] Successfully returned ${listings.length} listings`);

      return { 
        listings, 
        data: listings, 
        nextCursor 
      };

    } catch (error: any) {
      console.error('[ListingService] Critical error in getAllActive:', error);
      // Never crash the frontend in production
      return { 
        listings: [], 
        data: [], 
        nextCursor: undefined,
        error: process.env.NODE_ENV === 'production' ? undefined : error.message 
      };
    }
  }
  /**
   * Fetches a single unique listing using its URL slug parameter descriptor
   */
  static getBySlug = async (slug: string) => {
    return await prisma.listing.findFirst({
      where: {
        slug: slug,
        status: 'ACTIVE', // Only return live market inventory items
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });
  };

  /**
   * Maps multi-part data objects safely into explicit database column formats
   */
  static async create(sellerId: string, data: any) {
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    
    // Safe typing wrapper to guarantee text inputs are cleanly saved as decimals in Postgres
    const decimalPrice = data.price ? new Prisma.Decimal(parseFloat(data.price).toFixed(2)) : new Prisma.Decimal(0);

    const listing = await prisma.listing.create({
      data: { 
        ...data, 
        price: decimalPrice,
        slug, 
        sellerId, 
        status: 'ACTIVE' 
      },
      include: {
        category: true
      }
    });
    
    return listing;
  }
}