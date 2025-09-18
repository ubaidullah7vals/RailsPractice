#!/usr/bin/env node

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

/**
 * Build script to demonstrate CSS optimization
 * This shows how the webpack configuration would work
 */

console.log('🚀 Building optimized CSS...');

// Simple webpack config for demonstration
const config = {
  mode: 'production',
  entry: {
    application: './app/assets/stylesheets/application.css',
    critical: './app/assets/stylesheets/critical.css'
  },
  output: {
    path: path.resolve(__dirname, '../public/packs'),
    filename: 'js/[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer'),
                  require('postcss-preset-env')({
                    stage: 2,
                    features: {
                      'nesting-rules': true,
                      'custom-properties': true,
                    },
                  }),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};

// Run webpack build
webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('❌ Build failed:', err || stats.toJson().errors);
    process.exit(1);
  }

  console.log('✅ Build completed successfully!');
  
  // Show build stats
  const info = stats.toJson();
  console.log('\n📊 Build Statistics:');
  console.log(`  - Build time: ${info.time}ms`);
  console.log(`  - Assets: ${info.assets.length}`);
  
  info.assets.forEach(asset => {
    const size = (asset.size / 1024).toFixed(2);
    console.log(`    - ${asset.name}: ${size} KB`);
  });

  console.log('\n🎉 CSS optimization build complete!');
  console.log('\nTo see the full optimization in action:');
  console.log('1. Run: npm run build:production');
  console.log('2. Check the generated files in public/packs/');
  console.log('3. Compare file sizes before and after optimization');
});