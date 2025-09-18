# CSS Optimization Guide

This guide explains the comprehensive CSS optimization setup implemented in your Rails application to minimize unused CSS and improve page performance.

## 🎯 Overview

The CSS optimization system includes:
- **PurgeCSS**: Removes unused CSS rules
- **Critical CSS**: Inlines above-the-fold styles
- **CSS Minification**: Compresses CSS files
- **PostCSS Optimization**: Combines and optimizes CSS rules
- **Async Loading**: Loads non-critical CSS asynchronously

## 🚀 Quick Start

### 1. Run Full Optimization
```bash
# Analyze CSS usage and optimize everything
bundle exec rake css:full
```

### 2. Individual Tasks
```bash
# Analyze CSS usage
bundle exec rake css:analyze

# Generate critical CSS
bundle exec rake css:critical

# Optimize CSS for production
bundle exec rake css:optimize

# Clean up temporary files
bundle exec rake css:clean
```

## 📁 File Structure

```
config/webpack/
├── optimization.js          # Webpack CSS optimization config
└── production.js           # Production webpack config

app/helpers/
└── critical_css_helper.rb  # Critical CSS helper methods

app/views/layouts/
└── application.html.erb    # Updated layout with critical CSS

lib/tasks/
└── css_optimization.rake   # CSS optimization tasks

postcss.config.js           # PostCSS optimization plugins
```

## ⚙️ Configuration Details

### PurgeCSS Configuration
Located in `config/webpack/optimization.js`:

- **Content Sources**: Scans ERB templates, JavaScript files, and HTML files
- **Safelist**: Protects dynamically added classes (Bootstrap, Rails helpers, etc.)
- **Extractors**: Custom regex patterns to find CSS classes and IDs

### Critical CSS Strategy
- **Inline Critical CSS**: Above-the-fold styles are inlined in the HTML head
- **Async Loading**: Non-critical CSS loads asynchronously
- **Preloading**: Main CSS file is preloaded for faster subsequent loads

### PostCSS Optimizations
- **Autoprefixer**: Adds vendor prefixes
- **CSS Nesting**: Enables modern CSS nesting
- **Duplicate Selector Combination**: Merges duplicate selectors
- **Media Query Combination**: Combines similar media queries
- **Media Query Sorting**: Sorts media queries for better compression

## 🎨 Usage Examples

### In Your Views
```erb
<!-- Critical CSS is automatically inlined -->
<%= inline_critical_css %>

<!-- Load CSS asynchronously -->
<%= async_css_link_tag 'application' %>

<!-- Preload CSS for faster loading -->
<%= preload_critical_css %>
```

### Custom Critical CSS
Create `app/assets/stylesheets/critical.css` with your above-the-fold styles:
```css
/* Critical CSS - Above the fold styles */
body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
.header { background: #fff; border-bottom: 1px solid #e9ecef; }
.navbar { display: flex; align-items: center; padding: 1rem 0; }
.btn { padding: 0.5rem 1rem; background: #007bff; color: white; }
```

## 📊 Performance Benefits

### Before Optimization
- Large CSS bundles with unused styles
- Blocking CSS loading
- Poor First Contentful Paint (FCP)
- Slower page load times

### After Optimization
- ✅ **60-80% smaller CSS files** (PurgeCSS removes unused styles)
- ✅ **Faster First Contentful Paint** (Critical CSS inlined)
- ✅ **Non-blocking CSS loading** (Async loading)
- ✅ **Better Core Web Vitals** scores
- ✅ **Improved mobile performance**

## 🔧 Customization

### Adding New CSS Classes to Safelist
Edit `config/webpack/optimization.js`:
```javascript
safelist: [
  /^btn-/,           // All button variants
  /^alert-/,         // All alert variants
  /^your-custom-/,   // Your custom classes
]
```

### Modifying Critical CSS
1. Update `app/assets/stylesheets/critical.css`
2. Or modify the fallback in `app/helpers/critical_css_helper.rb`

### Adding New Content Sources for PurgeCSS
Edit the `paths` array in `config/webpack/optimization.js`:
```javascript
paths: glob.sync([
  path.join(__dirname, '../../app/views/**/*.erb'),
  path.join(__dirname, '../../app/helpers/**/*.rb'),
  path.join(__dirname, '../../app/javascript/**/*.js'),
  path.join(__dirname, '../../your-custom-path/**/*.html'), // Add new paths
]),
```

## 🐛 Troubleshooting

### Missing Styles After Optimization
1. **Check Safelist**: Add missing classes to the PurgeCSS safelist
2. **Verify Content Sources**: Ensure PurgeCSS scans all relevant files
3. **Test Locally**: Run `bundle exec rake css:analyze` to see what's being detected

### Critical CSS Not Loading
1. **Check File Exists**: Ensure `app/assets/stylesheets/critical.css` exists
2. **Verify Helper**: Check that `CriticalCssHelper` is included in `ApplicationHelper`
3. **Test Fallback**: The helper includes a fallback if the file doesn't exist

### Build Errors
1. **Check Dependencies**: Run `npm install` to ensure all packages are installed
2. **Webpack Version**: Ensure compatibility with webpack 4
3. **Node Version**: Use Node.js 14+ for best compatibility

## 📈 Monitoring

### Performance Metrics to Track
- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **Cumulative Layout Shift (CLS)**
- **CSS file sizes**
- **Total page load time**

### Tools for Monitoring
- **Google PageSpeed Insights**
- **Lighthouse**
- **WebPageTest**
- **Chrome DevTools Performance tab**

## 🔄 WordPress Adaptation

To adapt this setup for WordPress:

1. **Replace Webpack with Gulp/Webpack**:
   ```javascript
   // gulpfile.js
   const purgecss = require('@fullhuman/postcss-purgecss');
   
   gulp.task('css', () => {
     return gulp.src('src/css/**/*.css')
       .pipe(postcss([
         purgecss({
           content: ['**/*.php', '**/*.js'],
           safelist: [/^wp-/, /^admin-/, /^gutenberg-/]
         })
       ]))
       .pipe(gulp.dest('dist/css'));
   });
   ```

2. **WordPress Functions.php**:
   ```php
   function inline_critical_css() {
     $critical_css = file_get_contents(get_template_directory() . '/css/critical.css');
     echo '<style type="text/css">' . $critical_css . '</style>';
   }
   
   function async_css_loading($html, $handle) {
     if ($handle === 'main-css') {
       return str_replace("rel='stylesheet'", "rel='preload' as='style' onload=\"this.onload=null;this.rel='stylesheet'\"", $html);
     }
     return $html;
   }
   add_filter('style_loader_tag', 'async_css_loading', 10, 2);
   ```

## 🎉 Conclusion

This CSS optimization setup provides:
- **Automatic unused CSS removal**
- **Critical CSS inlining**
- **Async CSS loading**
- **Comprehensive optimization pipeline**
- **Easy customization and monitoring**

Run `bundle exec rake css:full` to get started with optimized CSS that will significantly improve your page load performance!