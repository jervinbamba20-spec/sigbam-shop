// Product images only: JPEG, PNG, WebP, GIF and AVIF up to 5 MB (no SVG).
const allowedMediaTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const deniedTypes = ['image/svg+xml'];

module.exports = ({ env }) => {
  // In the cloud (Render) the local disk is wiped on every restart/deploy, so
  // uploaded images are stored on Cloudinary when ALL three variables are set.
  // Locally (no Cloudinary vars) images are saved to /public/uploads.
  const useCloudinary = !!(env('CLOUDINARY_NAME') && env('CLOUDINARY_KEY') && env('CLOUDINARY_SECRET'));
  const folder = env('CLOUDINARY_FOLDER', 'shopkart');

  return {
    'users-permissions': {
      config: {
        jwtManagement: 'refresh',
        sessions: {
          httpOnly: true,
        },
      },
    },
    upload: {
      config: {
        sizeLimit: 5 * 1024 * 1024, // 5 MB
        ...(useCloudinary && {
          provider: 'cloudinary',
          providerOptions: {
            cloud_name: env('CLOUDINARY_NAME'),
            api_key: env('CLOUDINARY_KEY'),
            api_secret: env('CLOUDINARY_SECRET'),
          },
          actionOptions: {
            upload: { folder },
            uploadStream: { folder },
            delete: {},
          },
        }),
        security: {
          allowedTypes: allowedMediaTypes,
          deniedTypes,
        },
      },
    },
  };
};
