import { v2 as cloudinary } from 'cloudinary';

const cloudinaryUrl = process.env.CLOUDINARY_URL;

try {
    if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
        // Manually parse the URL to ensure config is correct
        const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
        if (matches) {
            cloudinary.config({
                api_key: matches[1],
                api_secret: matches[2],
                cloud_name: matches[3],
                secure: true
            });
        }
    } else if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        // Fallback to individual keys if URL is missing or invalid
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });
    }
} catch (e) {
    console.warn("Failed to configure Cloudinary:", e);
}

export default cloudinary;
