/** @type {import('next').NextConfig} */
const nextConfig = {
	swcMinify: false,
	reactStrictMode: true,
	images: {
		unoptimized: true,
	},
	experimental: {
		appDir: true,
	},
};

module.exports = nextConfig;
