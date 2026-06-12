import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

/** Inline all JS/CSS into index.html so the file works from file:// without a server */
function inlineAssets(): Plugin {
  return {
    name: 'inline-assets',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk') chunk.code = chunk.code.replace(/<\/script/g, '<\\/script');
      }
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, '.output/standalone');
      const htmlPath = path.join(outDir, 'index.html');
      let html = fs.readFileSync(htmlPath, 'utf-8');

      // Inline CSS into <style> tags
      html = html.replace(
        /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g,
        (_match, href: string) => {
          const cssPath = path.join(outDir, href);
          const css = fs.readFileSync(cssPath, 'utf-8');
          fs.unlinkSync(cssPath);
          return `<style>${css}</style>`;
        },
      );

      // Find and inline JS via blob URL — works on file:// without CORS issues
      const scriptMatch = html.match(/<script\s+type="module"\s+[^>]*src="([^"]+)"[^>]*><\/script>/);
      if (scriptMatch) {
        const jsPath = path.join(outDir, scriptMatch[1]);
        let jsCode = fs.readFileSync(jsPath, 'utf-8');
        fs.unlinkSync(jsPath);

        // Strip Vite's modulepreload polyfill — it calls fetch() which fails on file://
        jsCode = jsCode.replace(
          /\(function\(\)\{const \w+=document\.createElement\("link"\)\.relList;[\s\S]*?\}\)\(\);?/,
          '',
        );

        html = html.replace(scriptMatch[0], '');

        // Embed JS as a blob URL script: regular <script> creates blob from ES module code,
        // then loads it as <script type="module" src="blob:..."> — bypasses file:// CORS
        const loader = [
          '<script>',
          '(function(){',
          '  var code = document.getElementById("__app_code").textContent;',
          '  var blob = new Blob([code], {type:"application/javascript"});',
          '  var url = URL.createObjectURL(blob);',
          '  var s = document.createElement("script");',
          '  s.type = "module";',
          '  s.src = url;',
          '  document.head.appendChild(s);',
          '})();',
          '</script>',
        ].join('\n');

        html = html.replace(
          '</body>',
          `<script id="__app_code" type="text/plain">${jsCode}</script>\n${loader}\n  </body>`,
        );
      }

      // Remove any remaining modulepreload links
      html = html.replace(/<link\s+rel="modulepreload"[^>]*>\s*/g, '');

      fs.writeFileSync(htmlPath, html);

      const assetsDir = path.join(outDir, 'assets');
      if (fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).length === 0) {
        fs.rmdirSync(assetsDir);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineAssets()],
  root: path.resolve(__dirname, 'standalone'),
  resolve: {
    alias: {
      '@/src': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs'),
  },
  base: './',
  build: {
    outDir: path.resolve(__dirname, '.output/standalone'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es',
        inlineDynamicImports: true,
      },
    },
  },
});
