const esbuild = require('esbuild');

// Check if watch flag is passed
const isWatch = process.argv.includes('--watch');

// Build configuration
const buildOptions = {
  entryPoints: ['code.ts'],
  bundle: true,
  outfile: 'code.js',
  platform: 'browser',
  target: 'es6',
  format: 'iife', // Immediately Invoked Function Expression - works well for Figma plugins
  minify: false,
  sourcemap: false,
  external: ['__html__'], // Exclude __html__ from bundling as it's provided by Figma
};

// If watch mode is enabled
if (isWatch) {
  // Start watch mode
  esbuild.context(buildOptions).then(context => {
    context.watch();
    console.log('Watching for changes...');
  });
} else {
  // Just build once
  esbuild.buildSync(buildOptions);
  console.log('Build complete!');
} 