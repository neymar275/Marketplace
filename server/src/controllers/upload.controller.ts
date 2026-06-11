import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

export class UploadController {
  static getSignature = async (req: Request, res: Response) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create a secure signature valid for 1 hour
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'marketplace_listings',
        upload_preset: 'ml_default' // Standard default preset for free tier profiles
      },
      cloudinary.config().api_secret!
    );

    res.status(200).json({
      signature,
      timestamp,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      folder: 'marketplace_listings',
      uploadPreset: 'ml_default'
    });
  };
}