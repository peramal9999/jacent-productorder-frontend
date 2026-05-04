import type { NextConfig } from "next";

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
