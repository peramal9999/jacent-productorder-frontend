import type { NextConfig } from "next";

// Real backend URL. Browser never talks to this directly — Next proxies
// `/api/*` to it, so requests look same-origin and skip CORS preflight.
const BACKEND_ORIGIN =
	process.env.BACKEND_API_ORIGIN;

const nextConfig: NextConfig = {
	reactStrictMode: true, //  Strict Mode
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'jsmitemimage.s3.us-east-2.amazonaws.com',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
		],
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${BACKEND_ORIGIN}/api/:path*`,
			},
		];
	},
	...(process.env.NODE_ENV === 'production' && {
		typescript: {
			ignoreBuildErrors: true,
		},
		eslint: {
			ignoreDuringBuilds: true,
		},
	}),
};

export default nextConfig;
