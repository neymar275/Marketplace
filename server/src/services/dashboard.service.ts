import { prisma } from '../lib/prisma';

export class DashboardService {
  static async getSellerStats(sellerId: string) {
    // 1. Get basic counts
    const activeListings = await prisma.listing.count({
      where: { sellerId, status: 'ACTIVE' }
    });

    const pendingOrders = await prisma.order.count({
      where: {
        status: 'PENDING',
        items: { some: { listing: { sellerId } } }
      }
    });

    // 2. Fetch all completed orders for this seller to calculate revenue
    const paidOrders = await prisma.orderItem.findMany({
      where: {
        listing: { sellerId },
        order: { status: 'PAID' }
      },
      include: { order: true }
    });

    const totalRevenue = paidOrders.reduce((sum, item) => sum + Number(item.priceAtPurchase), 0);

    // 3. Mock Chart Data (In production, this would use a raw SQL GROUP BY date query)
    // We generate the last 7 days dynamically so the UI always looks alive
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: Math.floor(Math.random() * 100) + 20, // Simulated views
        revenue: Math.floor(Math.random() * 500)     // Simulated revenue
      };
    });

    // 4. Get recent listings for the data table
    const recentListings = await prisma.listing.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      stats: {
        revenue: totalRevenue,
        activeListings,
        pendingOrders,
        unreadMessages: 0 // Placeholder until messaging is built
      },
      chartData,
      recentListings
    };
  }
}