import { build, context } from 'esbuild';
import { access, copyFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputDir = path.join(root, 'dist');
const options = {
  absWorkingDir: root,
  entryPoints: ['src/main.jsx'],
  outfile: path.join(outputDir, 'react-app.js'),
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
          await copyFile(path.join(root, 'src', name), path.join(outputDir, name));
        }
      });
    },
  }],
};
await mkdir(outputDir, { recursive: true });
if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching React sources. Run npm start in another terminal for localhost:4173.');
} else {
  console.log(`Project directory: ${root}`);
  console.log(`Build working directory: ${process.cwd()}`);
  console.log(`Install invocation directory: ${process.env.INIT_CWD || '(direct Node invocation)'}`);
  await build(options);
  const manifest = JSON.parse(await readFile(path.join(outputDir, 'assets/native/flights/manifest.json'), 'utf8'));
  const files = ['index.html', 'react-app.js', 'styles.css', 'scene-layouts.css',
    ...manifest.clips.flatMap(clip => [...clip.frames, clip.artLayout.src])];
  await Promise.all(files.map(file => access(path.join(outputDir, file))));
  console.log(`Verified deployment output: ${outputDir}`);
  console.log(`React entry files and ${manifest.clips.reduce((total, clip) => total + clip.frames.length, 0)} animation frames are present.`);
}
