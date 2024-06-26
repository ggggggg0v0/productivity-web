import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import uni from "@dcloudio/vite-plugin-uni";
import { visualizer } from "rollup-plugin-visualizer";

function 打包分析() {
  return [
    visualizer({
      gzipSize: false,
      brotliSize: true,
      emitFile: false,
      filename: "analysis_visualizer.html", //
      open: true,
    }),
  ];
}

// https://vitejs.dev/config/
export default defineConfig({
  // 讓讀取 .html 內的資源使用相對路徑
  base: "",
  plugins: [react(), ...打包分析()],
  resolve: {
    alias: {
      "@": "/src", // 將 @ 映射到 src
    },
  },
  build: {
    // 改變輸出資料的檔案
    outDir: "docs",
  },
});
