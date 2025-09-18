#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * CSS Optimization Script
 * This script demonstrates CSS optimization techniques that can be used
 * in both Rails and WordPress projects.
 */

class CSSOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.cssFiles = [];
    this.viewFiles = [];
    this.usedClasses = new Set();
    this.report = {
      timestamp: new Date().toISOString(),
      cssFiles: [],
      viewFiles: [],
      usedClasses: [],
      recommendations: []
    };
  }

  /**
   * Find all CSS files in the project
   */
  findCSSFiles() {
    console.log('🔍 Finding CSS files...');
    
    const patterns = [
      'app/assets/stylesheets/**/*.{css,scss,sass}',
      'public/css/**/*.css',
      'src/css/**/*.{css,scss,sass}',
      'assets/css/**/*.{css,scss,sass}',
      'styles/**/*.{css,scss,sass}'
    ];

    patterns.forEach(pattern => {
      const files = glob.sync(pattern, { cwd: this.projectRoot });
      this.cssFiles.push(...files);
    });

    this.cssFiles = [...new Set(this.cssFiles)]; // Remove duplicates
    console.log(`Found ${this.cssFiles.length} CSS files:`);
    this.cssFiles.forEach(file => console.log(`  - ${file}`));
    
    this.report.cssFiles = this.cssFiles;
  }

  /**
   * Find all view/template files
   */
  findViewFiles() {
    console.log('\n🔍 Finding view files...');
    
    const patterns = [
      'app/views/**/*.erb',
      'app/views/**/*.html',
      'templates/**/*.html',
      'templates/**/*.php',
      'views/**/*.html',
      'views/**/*.php',
      'public/**/*.html',
      'src/**/*.html',
      'src/**/*.jsx',
      'src/**/*.tsx'
    ];

    patterns.forEach(pattern => {
      const files = glob.sync(pattern, { cwd: this.projectRoot });
      this.viewFiles.push(...files);
    });

    this.viewFiles = [...new Set(this.viewFiles)]; // Remove duplicates
    console.log(`Found ${this.viewFiles.length} view files:`);
    this.viewFiles.forEach(file => console.log(`  - ${file}`));
    
    this.report.viewFiles = this.viewFiles;
  }

  /**
   * Extract CSS classes from view files
   */
  extractUsedClasses() {
    console.log('\n📊 Extracting CSS classes from view files...');
    
    this.viewFiles.forEach(viewFile => {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, viewFile), 'utf8');
        
        // Extract class names from HTML
        const classMatches = content.match(/class=["']([^"']+)["']/g) || [];
        classMatches.forEach(match => {
          const classes = match.match(/class=["']([^"']+)["']/)[1];
          classes.split(/\s+/).forEach(cls => {
            if (cls.trim()) {
              this.usedClasses.add(cls.trim());
            }
          });
        });

        // Extract IDs
        const idMatches = content.match(/id=["']([^"']+)["']/g) || [];
        idMatches.forEach(match => {
          const id = match.match(/id=["']([^"']+)["']/)[1];
          if (id.trim()) {
            this.usedClasses.add(`#${id.trim()}`);
          }
        });

        // Extract data attributes that might be used as CSS selectors
        const dataMatches = content.match(/data-[a-zA-Z-]+=["']([^"']+)["']/g) || [];
        dataMatches.forEach(match => {
          const dataAttr = match.match(/data-([a-zA-Z-]+)=["']([^"']+)["']/);
          if (dataAttr) {
            this.usedClasses.add(`[data-${dataAttr[1]}="${dataAttr[2]}"]`);
          }
        });

      } catch (error) {
        console.warn(`Warning: Could not read ${viewFile}: ${error.message}`);
      }
    });

    console.log(`Found ${this.usedClasses.size} unique CSS selectors in use:`);
    const classArray = Array.from(this.usedClasses).sort();
    classArray.slice(0, 20).forEach(cls => console.log(`  - ${cls}`));
    if (classArray.length > 20) {
      console.log(`  ... and ${classArray.length - 20} more`);
    }
    
    this.report.usedClasses = classArray;
  }

  /**
   * Analyze CSS files for unused styles
   */
  analyzeCSSFiles() {
    console.log('\n🔍 Analyzing CSS files for optimization opportunities...');
    
    let totalCSSSize = 0;
    let totalRules = 0;
    let unusedRules = 0;

    this.cssFiles.forEach(cssFile => {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, cssFile), 'utf8');
        const size = Buffer.byteLength(content, 'utf8');
        totalCSSSize += size;

        // Count CSS rules
        const rules = content.match(/[^{}]+{[^{}]*}/g) || [];
        totalRules += rules.length;

        // Simple analysis for unused rules (basic implementation)
        rules.forEach(rule => {
          const selectors = rule.split('{')[0].split(',').map(s => s.trim());
          const isUsed = selectors.some(selector => {
            // Remove pseudo-selectors and complex selectors for basic matching
            const cleanSelector = selector
              .replace(/::?[a-zA-Z-]+/g, '') // Remove pseudo-selectors
              .replace(/\[[^\]]+\]/g, '') // Remove attribute selectors
              .replace(/[>+~]/g, ' ') // Replace combinators with spaces
              .trim();
            
            return this.usedClasses.has(cleanSelector) || 
                   this.usedClasses.has(cleanSelector.replace(/^\./, '')) ||
                   this.usedClasses.has(cleanSelector.replace(/^#/, ''));
          });

          if (!isUsed) {
            unusedRules++;
          }
        });

        console.log(`  ${cssFile}: ${size} bytes, ${rules.length} rules`);

      } catch (error) {
        console.warn(`Warning: Could not analyze ${cssFile}: ${error.message}`);
      }
    });

    console.log(`\n📊 Analysis Summary:`);
    console.log(`  - Total CSS files: ${this.cssFiles.length}`);
    console.log(`  - Total CSS size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
    console.log(`  - Total CSS rules: ${totalRules}`);
    console.log(`  - Estimated unused rules: ${unusedRules} (${((unusedRules / totalRules) * 100).toFixed(1)}%)`);

    this.report.summary = {
      totalCSSFiles: this.cssFiles.length,
      totalCSSSize: totalCSSSize,
      totalRules: totalRules,
      unusedRules: unusedRules,
      unusedPercentage: (unusedRules / totalRules) * 100
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    console.log('\n💡 Optimization Recommendations:');
    
    const recommendations = [];

    if (this.report.summary.unusedPercentage > 30) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Remove Unused CSS',
        description: `${this.report.summary.unusedPercentage.toFixed(1)}% of CSS rules appear to be unused. Consider using PurgeCSS or similar tools.`,
        impact: 'High - Significant file size reduction'
      });
    }

    if (this.report.summary.totalCSSSize > 100 * 1024) { // 100KB
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Implement Critical CSS',
        description: 'CSS bundle is large. Consider inlining critical CSS and loading non-critical styles asynchronously.',
        impact: 'Medium - Faster First Contentful Paint'
      });
    }

    if (this.cssFiles.length > 5) {
      recommendations.push({
        priority: 'LOW',
        title: 'Consolidate CSS Files',
        description: `You have ${this.cssFiles.length} CSS files. Consider consolidating them to reduce HTTP requests.`,
        impact: 'Low - Fewer HTTP requests'
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      title: 'Enable CSS Minification',
      description: 'Minify CSS files in production to reduce file sizes.',
      impact: 'Medium - 20-30% size reduction'
    });

    recommendations.push({
      priority: 'HIGH',
      title: 'Use CSS PurgeCSS',
      description: 'Implement PurgeCSS to automatically remove unused CSS rules.',
      impact: 'High - 60-80% size reduction possible'
    });

    recommendations.forEach(rec => {
      console.log(`\n  [${rec.priority}] ${rec.title}`);
      console.log(`     ${rec.description}`);
      console.log(`     Impact: ${rec.impact}`);
    });

    this.report.recommendations = recommendations;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const reportPath = path.join(this.projectRoot, 'css-optimization-report.json');
    
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Run complete analysis
   */
  async run() {
    console.log('🚀 Starting CSS Optimization Analysis...\n');
    
    this.findCSSFiles();
    this.findViewFiles();
    this.extractUsedClasses();
    this.analyzeCSSFiles();
    this.generateRecommendations();
    this.generateReport();

    console.log('\n✅ Analysis complete!');
    console.log('\nNext steps:');
    console.log('1. Review the generated report');
    console.log('2. Implement PurgeCSS for unused CSS removal');
    console.log('3. Set up critical CSS inlining');
    console.log('4. Configure CSS minification for production');
    console.log('5. Test your application after optimization');
  }
}

// Run the analysis if this script is executed directly
if (require.main === module) {
  const optimizer = new CSSOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = CSSOptimizer;