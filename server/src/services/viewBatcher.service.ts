import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';

export class ViewBatcher {
  static start() {
    setInterval(async () => {
      try {
        const keys = await redis.keys('views:listing:*');
        if (keys.length === 0) return;

        for (const key of keys) {
          const listingId = key.split(':')[2];
          const views = await redis.get(key);
          
          if (views) {
            await prisma.listing.update({
              where: { id: listingId },
              data: { views: { increment: parseInt(views, 10) } }
            });
            await redis.del(key);
          }
        }
        console.log(`[Batcher] Flushed ${keys.length} view counters to DB.`);
      } catch (error) {
        console.error('[Batcher Error]', error);
      }
    }, 60000); // 60 seconds
  }
}