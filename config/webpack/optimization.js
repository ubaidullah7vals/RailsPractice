const { environment } = require('@rails/webpacker')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const glob = require('glob')
const path = require('path')

// Custom CSS optimization configuration
const cssOptimization = {
  plugins: [
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css',
    }),

    // Remove unused CSS
    new PurgeCSSPlugin({
      paths: glob.sync([
        path.join(__dirname, '../../app/views/**/*.erb'),
        path.join(__dirname, '../../app/helpers/**/*.rb'),
        path.join(__dirname, '../../app/javascript/**/*.js'),
        path.join(__dirname, '../../app/assets/**/*.js'),
        path.join(__dirname, '../../public/**/*.html'),
      ]),
      // Safelist patterns for CSS that might be dynamically added
      safelist: [
        /^btn-/,
        /^alert-/,
        /^modal-/,
        /^dropdown-/,
        /^nav-/,
        /^navbar-/,
        /^carousel-/,
        /^tooltip-/,
        /^popover-/,
        /^badge-/,
        /^progress-/,
        /^spinner-/,
        /^loading-/,
        /^fade/,
        /^show/,
        /^hide/,
        /^active/,
        /^disabled/,
        /^selected/,
        /^highlight/,
        /^error/,
        /^success/,
        /^warning/,
        /^info/,
        /^danger/,
        /^primary/,
        /^secondary/,
        /^light/,
        /^dark/,
        // Rails specific classes
        /^field_with_errors/,
        /^error_explanation/,
        /^flash/,
        /^notice/,
        /^alert/,
        // Turbolinks classes
        /^turbolinks/,
        // Dynamic content classes
        /^js-/,
        /^data-/,
        /^aria-/,
        /^role/,
      ],
      // Additional options for better detection
      defaultExtractor: content => {
        // Extract class names, IDs, and attributes
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []
        return broadMatches.concat(innerMatches)
      },
      // Whitelist specific selectors that might be missed
      whitelistPatterns: [
        /^\./, // All classes
        /^#/, // All IDs
        /^\[/, // All attributes
        /^:/, // All pseudo-selectors
      ],
    }),

    // Optimize and minify CSS
    new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        safe: true,
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        minifyFontValues: true,
        minifySelectors: true,
        mergeLonghand: true,
        mergeRules: true,
      },
    }),
  ],

  // CSS optimization rules
  module: {
    rules: [
      {
        test: /\.(css|scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: false,
            },
          },
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
                      'custom-media-queries': true,
                    },
                  }),
                ],
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },

  // Optimization settings
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.(css|scss|sass)$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
}

// Merge with existing environment
environment.config.merge(cssOptimization)

module.exports = environment