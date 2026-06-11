import dotenv from 'dotenv';
import path from 'path';

// Load local environment tokens if executing on a development machine
// In production (Render), cloud container tokens are injected natively into process.env
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
}

import app from './app';
import { redis } from './lib/redis';
import { ViewBatcher } from './services/viewBatcher.service';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // 1. Connect to the distributed Redis cache layer before routing traffic
    await redis.connect();
    console.log('Successfully established connection to cloud Key-Value cache engine.');
    
    // 2. Start the background batch processing analytics engine
    ViewBatcher.start();
    console.log('Analytics metric batch processing queues initialized.');
    
    // 3. Fire up the central HTTP engine pipeline listen loop
    app.listen(PORT, () => {
      console.log(`Server engine is running live on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to boot market engine:', error);
    process.exit(1);
  }
}

bootstrap();