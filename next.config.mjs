/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 專案未內建 ESLint 設定，避免部署時因 Lint 檢查中斷 build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
