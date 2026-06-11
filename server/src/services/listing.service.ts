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
   * Production-ready active listings fetch
   */
  static async getAllActive(cursor?: string, limit: number = 12, filters: ListingFilters = {}) {
    try {
      console.log(`[ListingService] Fetching listings | cursor: ${cursor}, limit: ${limit}, filters:`, filters);

      const where: any = { status: 'ACTIVE' };

      // Full-text search
      if (filters.search?.trim()) {
        const searchTerm = filters.search.trim().split(/\s+/).join(' & ') + ':*';
        const rawResults = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Listing"
          WHERE status = 'ACTIVE' 
            AND search_vector @@ to_tsquery('english', ${searchTerm})
        `;
        const searchIds = rawResults.map(r => r.id);
        if (searchIds.length > 0) {
          where.id = { in: searchIds };
        } else {
          return { listings: [], data: [], nextCursor: undefined };
        }
      }

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
      if (hasMore) listings.pop();

      return { 
        listings, 
        data: listings, 
        nextCursor 
      };

    } catch (error: any) {
      console.error('[ListingService] Critical error in getAllActive:', error);
      return { 
        listings: [], 
        data: [], 
        nextCursor: undefined 
      };
    }
  }

  /**
   * Get user's own listings
   */
  static getUserInventory = async (sellerId: string) => {
    try {
      return await prisma.listing.findMany({
        where: {
          sellerId,
          status: 'ACTIVE',
        },
        include: {
          category: {
            select: { name: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error in getUserInventory:', error);
      return [];
    }
  };

  /**
   * Get single listing by slug
   */
  static getBySlug = async (slug: string) => {
    return await prisma.listing.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, avatar: true } }
      }
    });
  };

  /**
   * Create new listing
   */
  static async create(sellerId: string, data: any) {
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    
    const decimalPrice = data.price 
      ? new Prisma.Decimal(parseFloat(data.price).toFixed(2)) 
      : new Prisma.Decimal(0);

    return await prisma.listing.create({
      data: { 
        ...data, 
        price: decimalPrice,
        slug, 
        sellerId, 
        status: 'ACTIVE' 
      },
      include: { category: true }
    });
  }
}