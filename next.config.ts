import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://gbwiftzlqmnmqpnovzoo.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdid2lmdHpscW1ubXFwbm92em9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDc5ODgsImV4cCI6MjA5MTk4Mzk4OH0.eiF-8nkfq3XNV0MmuGV_6Lys6YAFXxcPHM32u29L4ow",
  },
};

export default nextConfig;