import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages 是纯静态托管，必须导出静态站点
  output: 'export',

  // 静态托管下每个路由输出为 /xxx/index.html，加尾斜杠保证链接一致
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
