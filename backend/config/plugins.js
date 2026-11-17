const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

module.exports = ({ env }) => {
  // In the cloud (Render) the local disk is wiped on every restart/deploy, so
  // uploaded images are stored on Cloudinary when CLOUDINARY_NAME is set.
  // Locally (no Cloudinary vars) images are saved to /public/uploads.
  const useCloudinary = !!env('CLOUDINARY_NAME');

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
            upload: { folder: env('CLOUDINARY_FOLDER', 'ecommerce') },
            uploadStream: { folder: env('CLOUDINARY_FOLDER', 'ecommerce') },
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
