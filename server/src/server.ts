import dotenv from 'dotenv';
import path from 'path';

// Force load env tokens at the absolute top of the compilation stack before importing app modules
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

import app from './app';
import { redis } from './lib/redis';
import { ViewBatcher } from './services/viewBatcher.service';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // 1. Connect to the distributed Redis cache layer before routing traffic
    await redis.connect();
    
    // 2. Start the background batch processing analytics engine
    ViewBatcher.start();
    
    // 3. Fire up the central HTTP engine pipeline listen loop
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to boot market engine:', error);
    process.exit(1);
  }
}

bootstrap();