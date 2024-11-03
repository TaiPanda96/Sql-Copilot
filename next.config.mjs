/** @type {import('next').NextConfig} */
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.plugins = [...config.plugins, new PrismaPlugin()]
        }

        return config
    },
    env: {
        KINDE_SITE_URL: process.env.KINDE_SITE_URL ?? `https://${process.env.VERCEL_URL}`,
        KINDE_POST_LOGOUT_REDIRECT_URL:
            process.env.KINDE_POST_LOGOUT_REDIRECT_URL ?? `https://${process.env.VERCEL_URL}`,
        KINDE_POST_LOGIN_REDIRECT_URL:
            process.env.KINDE_POST_LOGIN_REDIRECT_URL ?? `https://${process.env.VERCEL_URL}/api/auth/success`,
    }
};

export default nextConfig;
