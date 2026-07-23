import React, { useEffect, useRef, useState } from 'react';

interface HiddenScrollSidebarProps {
  children: React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onScrollEnd?: () => void;
  storageKey?: string; // Key for persisting scroll position
}

export function HiddenScrollSidebar({ 
  children, 
  className = '', 
  onScroll,
  onScrollEnd,
  storageKey
}: HiddenScrollSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Restore scroll position from localStorage if storageKey is provided
    if (storageKey && !hasRestoredPosition) {
      const savedPosition = localStorage.getItem(`sidebar-scroll-${storageKey}`);
      if (savedPosition) {
        sidebar.scrollTop = parseInt(savedPosition, 10);
        setHasRestoredPosition(true);
      }
    }

    // Hide scrollbars using CSS as specified in requirements
    sidebar.style.overflowY = 'scroll';
    sidebar.style.scrollbarWidth = 'none'; // Firefox
    sidebar.style.msOverflowStyle = 'none'; // IE/Edge

    // Create style element for WebKit browsers
    const style = document.createElement('style');
    style.textContent = `
      .hidden-scroll-sidebar::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }
      .hidden-scroll-sidebar {
        -ms-overflow-style: none; /* IE/Edge */
        scrollbar-width: none; /* Firefox */
      }
    `;
    
    // Add style to head if not already present
    if (!document.querySelector('style[data-hidden-scroll]')) {
      style.setAttribute('data-hidden-scroll', 'true');
      document.head.appendChild(style);
    }

    // Add class to sidebar
    sidebar.classList.add('hidden-scroll-sidebar');

    // Handle scroll events
    const handleScroll = () => {
      if (!sidebar) return;

      const scrollTop = sidebar.scrollTop;
      const scrollHeight = sidebar.scrollHeight;
      const clientHeight = sidebar.clientHeight;
      
      // Save scroll position to localStorage if storageKey is provided
      if (storageKey) {
        localStorage.setItem(`sidebar-scroll-${storageKey}`, scrollTop.toString());
      }
      
      // Check if user is scrolling
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      
      if (isAtBottom) {
        setIsScrolling(false);
        onScrollEnd?.();
      } else if (scrollTop > 0) {
        setIsScrolling(true);
      }

      onScroll?.(scrollTop);
    };

    // Throttle scroll events
    const throttledHandleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      setScrollTimeout(setTimeout(() => {
        handleScroll();
        setScrollTimeout(null);
      }, 16)); // ~60fps
    };

    sidebar.addEventListener('scroll', throttledHandleScroll);
    
    // Handle mouse wheel events for additional protection
    const handleWheel = (e: WheelEvent) => {
      // Prevent scroll acceleration
      if (Math.abs(e.deltaY) > 50) {
        e.preventDefault();
        console.log('🛡 Scroll acceleration detected and blocked');
      }
    };

    sidebar.addEventListener('wheel', handleWheel, { passive: false });

    // Handle touch events for mobile
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      
      // Prevent rapid scrolling
      if (Math.abs(deltaY) > 30) {
        e.preventDefault();
        console.log('🛡 Rapid touch scroll detected and blocked');
      }
    };

    sidebar.addEventListener('touchstart', handleTouchStart);
    sidebar.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup
    return () => {
      sidebar.removeEventListener('scroll', throttledHandleScroll);
      sidebar.removeEventListener('wheel', handleWheel);
      sidebar.removeEventListener('touchstart', handleTouchStart);
      sidebar.removeEventListener('touchmove', handleTouchMove);
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [onScroll, onScrollEnd]);

  // Add CSS-in-JS protection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hidden-scroll-sidebar::-webkit-scrollbar {
        display: none !important;
      }
      .hidden-scroll-sidebar::-webkit-scrollbar-track {
        background: transparent !important;
      }
      .hidden-scroll-sidebar::-webkit-scrollbar-thumb {
        background: transparent !important;
      }
      .hidden-scroll-sidebar {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      /* Prevent scroll bar manipulation */
      .hidden-scroll-sidebar::-webkit-scrollbar {
        width: 0px !important;
        height: 0px !important;
      }
      
      /* Hide scroll indicators */
      .hidden-scroll-sidebar::-webkit-scrollbar-corner {
        background: transparent !important;
      }
      
      /* Additional protection against scroll manipulation */
      .hidden-scroll-sidebar {
        overflow-x: hidden !important;
        overflow-y: scroll !important;
        position: relative !important;
      }
      
      /* Prevent right-click context menu on scroll */
      .hidden-scroll-sidebar {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    
    // Add protective styles
    if (!document.querySelector('style[data-sidebar-protection]')) {
      style.setAttribute('data-sidebar-protection', 'true');
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.querySelector('style[data-sidebar-protection]');
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`hidden-scroll-sidebar ${className} ${isScrolling ? 'scrolling' : ''}`}
      style={{
        position: 'relative',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none'
      }}
    >
      {children}
      
      {/* Visual indicator for scrolling state */}
      {isScrolling && (
        <div
          style={{
            position: 'absolute',
            right: '2px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '40px',
            background: 'rgba(0, 123, 255, 0.3)',
            borderRadius: '2px',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            zIndex: 1000
          }}
        />
      )}
    </div>
  );
}

// CSS utility for hidden scroll
export const hiddenScrollStyles = `
  .hidden-scroll-sidebar {
    overflow-y: scroll;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  
  .hidden-scroll-sidebar::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  
  .hidden-scroll-sidebar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .hidden-scroll-sidebar::-webkit-scrollbar-thumb {
    background: transparent;
  }
  
  .hidden-scroll-sidebar::-webkit-scrollbar-corner {
    background: transparent;
  }
  
  /* Additional protection styles */
  .hidden-scroll-sidebar {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: relative;
  }
  
  .hidden-scroll-sidebar.scrolling {
    cursor: grabbing;
  }
  
  .hidden-scroll-sidebar .scroll-indicator {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 40px;
    background: rgba(0, 123, 255, 0.3);
    border-radius: 2px;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 1000;
  }
`;
