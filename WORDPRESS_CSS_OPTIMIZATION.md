# WordPress CSS Optimization Guide

This guide shows how to adapt the CSS optimization techniques for WordPress projects.

## 🎯 WordPress-Specific CSS Optimization

### 1. Using PurgeCSS with WordPress

Create a `gulpfile.js` in your WordPress theme:

```javascript
const gulp = require('gulp');
const purgecss = require('@fullhuman/postcss-purgecss');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

gulp.task('css', () => {
  return gulp.src('src/css/**/*.css')
    .pipe(postcss([
      purgecss({
        content: [
          '**/*.php',
          '**/*.js',
          '**/*.html'
        ],
        safelist: [
          // WordPress core classes
          /^wp-/,
          /^admin-/,
          /^gutenberg-/,
          /^block-/,
          /^editor-/,
          /^components-/,
          /^interface-/,
          /^notice-/,
          /^updated/,
          /^error/,
          /^success/,
          /^warning/,
          /^info/,
          // Common WordPress classes
          /^menu-/,
          /^nav-/,
          /^widget-/,
          /^sidebar-/,
          /^content-/,
          /^entry-/,
          /^post-/,
          /^page-/,
          /^attachment-/,
          /^comment-/,
          /^pingback/,
          /^sticky/,
          /^tag-/,
          /^category-/,
          /^archive-/,
          /^search-/,
          /^home/,
          /^blog/,
          /^single-/,
          /^attachment/,
          /^error404/,
          /^no-results/,
          // WooCommerce classes
          /^woocommerce/,
          /^wc-/,
          /^cart-/,
          /^checkout-/,
          /^product-/,
          /^shop-/,
          /^order-/,
          /^account-/,
          // Contact Form 7
          /^wpcf7/,
          // Yoast SEO
          /^yoast/,
          // Dynamic content
          /^js-/,
          /^data-/,
          /^aria-/,
          /^role/,
          // Pseudo-selectors
          /^::/,
          /^:/,
          // Media queries
          /^@media/,
          // Keyframes
          /^@keyframes/,
          /^@-webkit-keyframes/,
          /^@-moz-keyframes/
        ],
        defaultExtractor: content => {
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          return broadMatches.concat(innerMatches);
        }
      }),
      autoprefixer(),
      cssnano()
    ]))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('watch', () => {
  gulp.watch('src/css/**/*.css', gulp.series('css'));
});

gulp.task('default', gulp.series('css'));
```

### 2. WordPress Functions.php Implementation

Add to your theme's `functions.php`:

```php
<?php
/**
 * CSS Optimization Functions
 */

// Enqueue optimized CSS
function enqueue_optimized_css() {
    // Critical CSS (inlined)
    $critical_css = get_critical_css();
    if ($critical_css) {
        echo '<style type="text/css">' . $critical_css . '</style>';
    }
    
    // Non-critical CSS (async loaded)
    wp_enqueue_style(
        'main-css',
        get_template_directory_uri() . '/dist/css/main.css',
        array(),
        filemtime(get_template_directory() . '/dist/css/main.css')
    );
}
add_action('wp_head', 'enqueue_optimized_css', 1);

// Get critical CSS content
function get_critical_css() {
    $critical_css_file = get_template_directory() . '/dist/css/critical.css';
    
    if (file_exists($critical_css_file)) {
        return file_get_contents($critical_css_file);
    }
    
    // Fallback critical CSS
    return '
        body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .header { background: #fff; border-bottom: 1px solid #e9ecef; }
        .navbar { display: flex; align-items: center; padding: 1rem 0; }
        .btn { padding: 0.5rem 1rem; background: #007bff; color: white; }
    ';
}

// Async CSS loading
function async_css_loading($html, $handle) {
    if ($handle === 'main-css') {
        return str_replace(
            "rel='stylesheet'",
            "rel='preload' as='style' onload=\"this.onload=null;this.rel='stylesheet'\"",
            $html
        );
    }
    return $html;
}
add_filter('style_loader_tag', 'async_css_loading', 10, 2);

// Remove unused CSS from plugins
function remove_unused_plugin_css() {
    // Remove unused plugin CSS
    wp_dequeue_style('contact-form-7');
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-block-style');
    
    // Only load on specific pages
    if (!is_woocommerce() && !is_cart() && !is_checkout()) {
        wp_dequeue_style('woocommerce-general');
        wp_dequeue_style('woocommerce-layout');
        wp_dequeue_style('woocommerce-smallscreen');
    }
}
add_action('wp_enqueue_scripts', 'remove_unused_plugin_css', 100);

// Preload critical resources
function preload_critical_resources() {
    echo '<link rel="preload" href="' . get_template_directory_uri() . '/dist/css/main.css" as="style">';
    echo '<link rel="preload" href="' . get_template_directory_uri() . '/dist/js/main.js" as="script">';
}
add_action('wp_head', 'preload_critical_resources', 1);
?>
```

### 3. WordPress Plugin Approach

Create a simple plugin for CSS optimization:

```php
<?php
/**
 * Plugin Name: CSS Optimizer
 * Description: Optimizes CSS by removing unused styles and implementing critical CSS
 * Version: 1.0.0
 */

class CSSOptimizer {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'optimize_css'), 999);
        add_action('wp_head', array($this, 'inline_critical_css'), 1);
    }
    
    public function optimize_css() {
        // Remove unused CSS from plugins
        $this->remove_unused_css();
        
        // Load CSS asynchronously
        $this->async_css_loading();
    }
    
    public function inline_critical_css() {
        $critical_css = $this->get_critical_css();
        echo '<style type="text/css">' . $critical_css . '</style>';
    }
    
    private function remove_unused_css() {
        // Remove unused plugin styles
        wp_dequeue_style('contact-form-7');
        wp_dequeue_style('wp-block-library');
        
        // Conditional loading
        if (!is_woocommerce()) {
            wp_dequeue_style('woocommerce-general');
        }
    }
    
    private function async_css_loading() {
        add_filter('style_loader_tag', function($html, $handle) {
            if (strpos($handle, 'main') !== false) {
                return str_replace(
                    "rel='stylesheet'",
                    "rel='preload' as='style' onload=\"this.onload=null;this.rel='stylesheet'\"",
                    $html
                );
            }
            return $html;
        }, 10, 2);
    }
    
    private function get_critical_css() {
        $file = plugin_dir_path(__FILE__) . 'css/critical.css';
        return file_exists($file) ? file_get_contents($file) : $this->get_fallback_css();
    }
    
    private function get_fallback_css() {
        return '
            body { margin: 0; font-family: system-ui, sans-serif; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #fff; border-bottom: 1px solid #e9ecef; }
        ';
    }
}

new CSSOptimizer();
?>
```

### 4. WordPress Build Process

Create a `package.json` for your WordPress theme:

```json
{
  "name": "wordpress-theme",
  "scripts": {
    "build": "gulp",
    "watch": "gulp watch",
    "css:analyze": "node scripts/css-analyzer.js",
    "css:optimize": "gulp css && npm run css:analyze"
  },
  "devDependencies": {
    "gulp": "^4.0.2",
    "gulp-postcss": "^9.0.1",
    "@fullhuman/postcss-purgecss": "^5.0.0",
    "autoprefixer": "^10.4.16",
    "cssnano": "^6.0.1"
  }
}
```

### 5. WordPress-Specific CSS Analysis

Create `scripts/css-analyzer.js`:

```javascript
const fs = require('fs');
const glob = require('glob');

class WordPressCSSAnalyzer {
  constructor() {
    this.themePath = './';
    this.cssFiles = [];
    this.phpFiles = [];
    this.usedClasses = new Set();
  }
  
  analyze() {
    console.log('🔍 Analyzing WordPress theme CSS...');
    
    // Find CSS files
    this.cssFiles = glob.sync('**/*.css', { ignore: ['node_modules/**', 'vendor/**'] });
    console.log(`Found ${this.cssFiles.length} CSS files`);
    
    // Find PHP files
    this.phpFiles = glob.sync('**/*.php', { ignore: ['node_modules/**', 'vendor/**'] });
    console.log(`Found ${this.phpFiles.length} PHP files`);
    
    // Extract classes from PHP files
    this.extractClassesFromPHP();
    
    // Analyze CSS usage
    this.analyzeCSSUsage();
    
    // Generate recommendations
    this.generateRecommendations();
  }
  
  extractClassesFromPHP() {
    this.phpFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract class names from PHP
      const classMatches = content.match(/class=["']([^"']+)["']/g) || [];
      classMatches.forEach(match => {
        const classes = match.match(/class=["']([^"']+)["']/)[1];
        classes.split(/\s+/).forEach(cls => {
          if (cls.trim()) {
            this.usedClasses.add(cls.trim());
          }
        });
      });
    });
    
    console.log(`Found ${this.usedClasses.size} unique CSS classes in use`);
  }
  
  analyzeCSSUsage() {
    let totalSize = 0;
    let totalRules = 0;
    let unusedRules = 0;
    
    this.cssFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');
      totalSize += size;
      
      const rules = content.match(/[^{}]+{[^{}]*}/g) || [];
      totalRules += rules.length;
      
      // Simple unused rule detection
      rules.forEach(rule => {
        const selectors = rule.split('{')[0].split(',').map(s => s.trim());
        const isUsed = selectors.some(selector => {
          const cleanSelector = selector.replace(/::?[a-zA-Z-]+/g, '').trim();
          return this.usedClasses.has(cleanSelector) || 
                 this.usedClasses.has(cleanSelector.replace(/^\./, ''));
        });
        
        if (!isUsed) unusedRules++;
      });
    });
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`  - Total CSS size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`  - Total CSS rules: ${totalRules}`);
    console.log(`  - Unused rules: ${unusedRules} (${((unusedRules / totalRules) * 100).toFixed(1)}%)`);
  }
  
  generateRecommendations() {
    console.log(`\n💡 WordPress Optimization Recommendations:`);
    console.log(`1. Use PurgeCSS with WordPress-specific safelist`);
    console.log(`2. Implement critical CSS inlining in functions.php`);
    console.log(`3. Load non-critical CSS asynchronously`);
    console.log(`4. Remove unused plugin CSS`);
    console.log(`5. Use conditional CSS loading for plugins`);
  }
}

const analyzer = new WordPressCSSAnalyzer();
analyzer.analyze();
```

## 🚀 Quick Start for WordPress

1. **Install dependencies**:
   ```bash
   npm install gulp gulp-postcss @fullhuman/postcss-purgecss autoprefixer cssnano
   ```

2. **Create gulpfile.js** (use the example above)

3. **Update functions.php** (use the example above)

4. **Run optimization**:
   ```bash
   npm run css:optimize
   ```

5. **Test your site** to ensure all styles are working

## 📊 Expected Results

- **60-80% reduction** in CSS file size
- **Faster First Contentful Paint** (FCP)
- **Improved Core Web Vitals** scores
- **Better mobile performance**
- **Reduced bandwidth usage**

## 🔧 WordPress-Specific Considerations

- **Plugin CSS**: Many plugins load unnecessary CSS
- **Admin Bar**: Don't purge admin-related classes
- **Gutenberg**: Preserve block editor classes
- **WooCommerce**: Conditional loading for e-commerce pages
- **Caching**: Clear cache after optimization
- **Testing**: Test on staging before production

This approach will significantly improve your WordPress site's performance by removing unused CSS and implementing critical CSS strategies!