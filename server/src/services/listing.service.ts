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
  static async getAllActive(cursor?: string, limit: number = 12, filters: ListingFilters = {}) {
    // 1. Full-Text Search via Raw SQL
    let searchIds: string[] | null = null;

    if (filters.search) {
      // Format search string for tsquery (e.g., "vintage bike" -> "vintage & bike")
      const formattedSearch = filters.search.trim().split(/\s+/).join(' & ') + ':*';

      const rawResults = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Listing"
        WHERE status = 'ACTIVE' 
        AND search_vector @@ to_tsquery('english', ${formattedSearch})
      `;

      searchIds = rawResults.map(r => r.id);

      // If search yielded no results, exit early
      if (searchIds.length === 0) return { listings: [], data: [], nextCursor: undefined };
    }

    // 2. Build Prisma Where Clause
    const where: any = { status: 'ACTIVE' };

    if (searchIds) where.id = { in: searchIds };
    if (filters.category && filters.category !== 'all') where.category = { slug: filters.category };
    if (filters.condition && filters.condition !== 'all') where.condition = filters.condition;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    // 3. Build Sorting Logic
    let orderBy: any = { createdAt: 'desc' };
    if (filters.sort === 'price_asc') orderBy = { price: 'asc' };
    if (filters.sort === 'price_desc') orderBy = { price: 'desc' };
    if (filters.sort === 'popular') orderBy = { views: 'desc' };

    // 4. Execute Query
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

    let nextCursor: string | undefined = undefined;
    if (listings.length > limit) {
      const nextItem = listings.pop();
      nextCursor = nextItem?.id;
    }

    // FIXED: Returns both data aliases for absolute full-stack pipeline stability
    return { listings, data: listings, nextCursor };
  }

  static getUserInventory = async (sellerId: string) => {
  return await prisma.listing.findMany({
    where: {
      sellerId: sellerId, // Filters database to only return items owned by the request sender
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc', // Pushes newest creation posts to the top of the grid view
    }
  });
};

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