import { v2 as cloudinary } from 'cloudinary';

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
    // Manually parse the URL to ensure config is correct
    // Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
    const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (matches) {
        cloudinary.config({
            api_key: matches[1],
            api_secret: matches[2],
            cloud_name: matches[3],
            secure: true
        });
    } else {
        // Fallback or let SDK try to handle it
        console.warn("CLOUDINARY_URL found but failed to parse manually.");
    }
} else {
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

export default cloudinary;
