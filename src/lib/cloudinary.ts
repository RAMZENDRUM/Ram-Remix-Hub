import { v2 as cloudinary } from 'cloudinary';

// If CLOUDINARY_URL is provided (e.g. from Vercel Postgres integration or manual), it auto-configures.
// Otherwise, we use individual keys.
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });
} else {
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

export default cloudinary;
