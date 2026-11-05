import { build, context } from 'esbuild';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const options = {
  absWorkingDir: root,
  entryPoints: ['src/main.jsx'],
  outfile: 'dist/react-app.js',
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  target: ['es2022'],
  minify: true,
  sourcemap: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'linked',
  plugins: [{
    name: 'portfolio-static-files',
    setup(builder) {
      builder.onLoad({ filter: /[\\/]src[\\/]main\.jsx$/ }, async args => ({
        contents: await readFile(args.path, 'utf8'),
        loader: 'jsx',
        watchFiles: ['index.html', 'styles.css', 'scene-layouts.css'].map(name => path.join(root, 'src', name)),
      }));
      builder.onEnd(async result => {
        if (result.errors.length) return;
        for (const name of ['index.html', 'styles.css', 'scene-layouts.css']) {
          await copyFile(path.join(root, 'src', name), path.join(root, 'dist', name));
        }
      });
    },
  }],
};
await mkdir(path.join(root, 'dist'), { recursive: true });
if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching React sources. Run npm start in another terminal for localhost:4173.');
} else {
  await build(options);
  console.log('React portfolio built in dist/. Steam animation assets preserved.');
}
