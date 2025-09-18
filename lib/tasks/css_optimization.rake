namespace :css do
  desc "Analyze CSS usage and generate optimization report"
  task :analyze => :environment do
    puts "🔍 Analyzing CSS usage..."
    
    # Get all CSS files
    css_files = Dir.glob(Rails.root.join('app/assets/stylesheets/**/*.{css,scss,sass}'))
    puts "Found #{css_files.length} CSS files:"
    css_files.each { |file| puts "  - #{file}" }
    
    # Get all view files
    view_files = Dir.glob(Rails.root.join('app/views/**/*.erb'))
    puts "\nFound #{view_files.length} view files:"
    view_files.each { |file| puts "  - #{file}" }
    
    # Analyze CSS classes used in views
    used_classes = Set.new
    view_files.each do |view_file|
      content = File.read(view_file)
      # Extract class names from HTML
      content.scan(/class=["']([^"']+)["']/) do |match|
        match[0].split(/\s+/).each { |cls| used_classes.add(cls) }
      end
    end
    
    puts "\n📊 Analysis Results:"
    puts "  - Total CSS files: #{css_files.length}"
    puts "  - Total view files: #{view_files.length}"
    puts "  - Unique CSS classes found in views: #{used_classes.length}"
    puts "  - Sample classes: #{used_classes.to_a.first(10).join(', ')}"
    
    # Generate report
    report_file = Rails.root.join('tmp/css_analysis_report.txt')
    File.open(report_file, 'w') do |f|
      f.puts "CSS Analysis Report - #{Time.current}"
      f.puts "=" * 50
      f.puts "CSS Files:"
      css_files.each { |file| f.puts "  #{file}" }
      f.puts "\nView Files:"
      view_files.each { |file| f.puts "  #{file}" }
      f.puts "\nUsed CSS Classes:"
      used_classes.to_a.sort.each { |cls| f.puts "  #{cls}" }
    end
    
    puts "\n📄 Report saved to: #{report_file}"
  end

  desc "Optimize CSS for production"
  task :optimize => :environment do
    puts "🚀 Optimizing CSS for production..."
    
    # Run webpack build with optimization
    system("RAILS_ENV=production bundle exec rails webpacker:compile")
    
    if $?.success?
      puts "✅ CSS optimization completed successfully!"
      
      # Show file sizes
      public_path = Rails.root.join('public/packs')
      if Dir.exist?(public_path)
        css_files = Dir.glob(public_path.join('**/*.css'))
        puts "\n📦 Optimized CSS files:"
        css_files.each do |file|
          size = File.size(file)
          puts "  - #{File.basename(file)}: #{size} bytes (#{(size / 1024.0).round(2)} KB)"
        end
      end
    else
      puts "❌ CSS optimization failed!"
      exit 1
    end
  end

  desc "Generate critical CSS for above-the-fold content"
  task :critical => :environment do
    puts "⚡ Generating critical CSS..."
    
    # This would typically use a tool like critical or penthouse
    # For now, we'll create a basic critical CSS extraction
    critical_css = <<~CSS
      /* Critical CSS - Above the fold styles */
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
      .header { background: #fff; border-bottom: 1px solid #e9ecef; }
      .navbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; }
      .btn { display: inline-block; padding: 0.5rem 1rem; background: #007bff; color: white; text-decoration: none; border-radius: 0.25rem; }
      .btn:hover { background: #0056b3; }
    CSS
    
    critical_file = Rails.root.join('app/assets/stylesheets/critical.css')
    File.write(critical_file, critical_css)
    
    puts "✅ Critical CSS generated: #{critical_file}"
  end

  desc "Clean up temporary CSS files"
  task :clean => :environment do
    puts "🧹 Cleaning up temporary CSS files..."
    
    # Remove analysis reports
    report_file = Rails.root.join('tmp/css_analysis_report.txt')
    File.delete(report_file) if File.exist?(report_file)
    
    # Remove compiled assets
    public_path = Rails.root.join('public/packs')
    if Dir.exist?(public_path)
      FileUtils.rm_rf(public_path)
      puts "  - Removed compiled assets from #{public_path}"
    end
    
    puts "✅ Cleanup completed!"
  end

  desc "Full CSS optimization workflow"
  task :full => [:analyze, :critical, :optimize] do
    puts "\n🎉 Full CSS optimization workflow completed!"
    puts "\nNext steps:"
    puts "  1. Test your application to ensure all styles are working"
    puts "  2. Check the generated CSS files in public/packs/"
    puts "  3. Consider implementing critical CSS inlining in your layout"
    puts "  4. Monitor your page load performance"
  end
end