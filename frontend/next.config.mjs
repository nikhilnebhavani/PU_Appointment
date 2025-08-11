// Import the next-pwa package
import withPWA from 'next-pwa';

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'appointment.paruluniversity.ac.in',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
};

const pwaConfig = withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development', // Disable PWA in development
});

// Use function style export to properly merge configs
export default pwaConfig({
    ...nextConfig,
});
