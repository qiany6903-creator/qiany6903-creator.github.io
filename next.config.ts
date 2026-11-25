import type { NextConfig } from "next";

// GitHub Pages 项目站点部署在子路径下（如 /qianhuan6903），
// 通过环境变量注入 basePath；Vercel 等根路径托管不设置该变量即可。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  // GitHub Pages 是纯静态托管，必须导出静态站点
  output: 'export',

  // 静态托管下每个路由输出为 /xxx/index.html，加尾斜杠保证链接一致
  trailingSlash: true,

  basePath,

  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
