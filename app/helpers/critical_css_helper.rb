module CriticalCssHelper
  # Inline critical CSS for above-the-fold content
  def inline_critical_css
    critical_css_path = Rails.root.join('app/assets/stylesheets/critical.css')
    
    if File.exist?(critical_css_path)
      content = File.read(critical_css_path)
      content_tag(:style, content.html_safe, type: 'text/css')
    else
      # Fallback critical CSS if file doesn't exist
      fallback_critical_css.html_safe
    end
  end

  # Load non-critical CSS asynchronously
  def async_css_link_tag(name, options = {})
    options = options.merge(
      media: 'print',
      onload: "this.media='all'",
      'data-turbolinks-track': 'reload'
    )
    
    stylesheet_link_tag(name, options) +
    noscript_tag do
      stylesheet_link_tag(name, media: 'all', 'data-turbolinks-track': 'reload')
    end
  end

  # Preload critical CSS
  def preload_critical_css
    content_tag(:link, 
      rel: 'preload', 
      href: asset_path('application.css'), 
      as: 'style',
      onload: "this.onload=null;this.rel='stylesheet'"
    )
  end

  private

  def fallback_critical_css
    <<~CSS
      <style type="text/css">
        /* Critical CSS Fallback */
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
        }
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 0 15px; 
        }
        .header { 
          background: #fff; 
          border-bottom: 1px solid #e9ecef; 
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .navbar { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 1rem 0; 
        }
        .btn { 
          display: inline-block; 
          padding: 0.5rem 1rem; 
          background: #007bff; 
          color: white; 
          text-decoration: none; 
          border-radius: 0.25rem; 
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease-in-out;
        }
        .btn:hover { 
          background: #0056b3; 
        }
        .main-content {
          min-height: calc(100vh - 200px);
          padding: 2rem 0;
        }
        .footer {
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          padding: 2rem 0;
          margin-top: auto;
        }
        /* Loading states */
        .loading {
          opacity: 0.6;
          pointer-events: none;
        }
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Responsive */
        @media (max-width: 768px) {
          .container { padding: 0 10px; }
          .navbar { flex-direction: column; gap: 1rem; }
        }
      </style>
    CSS
  end

  def noscript_tag(&block)
    content_tag(:noscript, &block)
  end
end