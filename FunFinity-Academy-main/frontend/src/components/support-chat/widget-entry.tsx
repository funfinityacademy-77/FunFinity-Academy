import React from 'react';
import ReactDOM from 'react-dom/client';
import SupportChatWidget from './SupportChatWidget';

// Widget initialization function
function initSupportChat() {
  // Find the script tag that loaded this widget
  const scriptTag = document.querySelector('script[src*="widget"]');
  if (!scriptTag) {
    console.error('Support Chat widget script tag not found');
    return;
  }

  // Read configuration from data attributes
  const config = {
    supabaseUrl: scriptTag.getAttribute('data-supabase-url') || '',
    supabaseKey: scriptTag.getAttribute('data-supabase-key') || '',
    logoUrl: scriptTag.getAttribute('data-logo-url') || undefined,
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#3B82F6',
    textColor: scriptTag.getAttribute('data-text-color') || '#1F2937',
    bubbleBackground: scriptTag.getAttribute('data-bubble-background') || '#F3F4F6'
  };

  // Validate required configuration
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('Support Chat widget requires supabase-url and supabase-key data attributes');
    return;
  }

  // Create container for the widget
  const container = document.createElement('div');
  container.id = 'support-chat-widget-container';
  document.body.appendChild(container);

  // Render the widget
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <SupportChatWidget {...config} />
    </React.StrictMode>
  );
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupportChat);
} else {
  initSupportChat();
}

// Export for manual initialization if needed
export { initSupportChat };
export default SupportChatWidget;
