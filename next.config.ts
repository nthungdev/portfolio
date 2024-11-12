import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  // images: {
  //     unoptimized: true,
  // },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
};

export default nextConfig;
