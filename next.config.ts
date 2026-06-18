import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera o servidor "standalone" — imagem Docker enxuta para deploy no Coolify.
  output: "standalone",
};

export default nextConfig;
