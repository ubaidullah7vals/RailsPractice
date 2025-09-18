module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
        'color-mod-function': true,
        'logical-properties-and-values': true,
      }
    }),
    // Add CSS optimization plugins
    require('postcss-combine-duplicated-selectors'),
    require('postcss-combine-media-query'),
    require('postcss-sort-media-queries'),
  ]
}
