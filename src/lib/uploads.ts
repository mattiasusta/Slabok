import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_URL_PREFIX } from "@/lib/validation";

// Le foto sono ospitate su Cloudinary (piano gratuito) invece che sul filesystem
// locale: il piano free di Render (e la maggior parte delle piattaforme serverless)
// non ha disco persistente, quindi qualsiasi file scritto in locale verrebbe perso
// ad ogni riavvio/deploy.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export { CLOUDINARY_URL_PREFIX };
