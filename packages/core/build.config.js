import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SIZE_BUDGET = 5 * 1024; // 5KB in bytes

async function buildFramework() {
  const checkSize = process.argv.includes('--check-size');

  try {
    // Build ESM bundle
    await build({
      entryPoints: ['src/index.js'],
      bundle: true,
      format: 'esm',
      outfile: 'dist/front.esm.js',
      minify: true,
      sourcemap: true,
      target: 'es2020',
      external: ['uhtml'], // uhtml is a peer dependency
      banner: {
        js: '/* front.js - A secure-by-default micro-framework */',
      },
    });

    // Build UMD bundle for browser
    await build({
      entryPoints: ['src/index.js'],
      bundle: true,
      format: 'iife',
      globalName: 'Front',
      outfile: 'dist/front.umd.js',
      minify: true,
      sourcemap: true,
      target: 'es2020',
      external: ['uhtml'],
      banner: {
        js: '/* front.js - A secure-by-default micro-framework */',
      },
    });

    console.log('✅ Build complete!');

    if (checkSize) {
      const esmPath = join(__dirname, 'dist/front.esm.js');
      const esmContent = readFileSync(esmPath);
      const gzipped = gzipSync(esmContent);
      
      const sizeKB = (esmContent.length / 1024).toFixed(2);
      const gzipKB = (gzipped.length / 1024).toFixed(2);
      
      console.log(`\n📦 Bundle Size:`);
      console.log(`   Minified: ${sizeKB} KB`);
      console.log(`   Gzipped:  ${gzipKB} KB`);
      console.log(`   Budget:   ${(SIZE_BUDGET / 1024).toFixed(2)} KB`);
      
      if (gzipped.length > SIZE_BUDGET) {
        console.error(`\n❌ Size budget exceeded!`);
        process.exit(1);
      } else {
        console.log(`\n✅ Size budget met!`);
      }
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildFramework();

