/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  webpack: (config, { isServer }) => {
    // Handle WASM files for Transformers.js
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    
    // Handle Web Workers
    if (!isServer) {
      config.output.publicPath = '/_next/';
    }
    
    return config;
  },
  
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_ENABLE_CLIENT_LLM: process.env.NEXT_PUBLIC_ENABLE_CLIENT_LLM || 'true',
  },
};

module.exports = nextConfig;
