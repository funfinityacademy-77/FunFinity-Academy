# WCAG 2.2 AA Accessibility Checklist
## FunFinity Academy - Navigation & Dashboard Components

### Component Analysis
- **Navbar.tsx** - Main navigation with desktop/mobile views
- **StudentDashboard.tsx** - Student dashboard with gamification elements

---

## 🔴 CRITICAL ISSUES (Must Fix)

### 1. Keyboard Trap Prevention

#### Issue: Mobile Menu Keyboard Trap
**Location:** `Navbar.tsx` lines 76-106
**Problem:** Mobile menu doesn't have escape key handler to close menu
**Fix Required:**
```tsx
// Add escape key handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [mobileMenuOpen]);

// Add to mobile menu button
<button
  aria-expanded={mobileMenuOpen}
  aria-controls="mobile-menu"
  aria-haspopup="true"
  // ... existing props
>
```

#### Issue: Tab Navigation in Modal
**Location:** `StudentDashboard.tsx` - Course details modal (when implemented)
**Fix Required:**
```tsx
// Add focus trap for modals
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTab);
  return () => element.removeEventListener('keydown', handleTab);
};
```

---

### 2. Logical Tab Ordering

#### Issue: Missing Tab Indexes
**Location:** `Navbar.tsx` lines 36-46, 66-72
**Fix Required:**
```tsx
// Desktop navigation links
<a
  href={link.href}
  tabIndex={0}
  className="..."
>
  {link.label}
</a>

// Mobile menu button
<button
  tabIndex={0}
  className="..."
  // ... existing props
>
```

#### Issue: Dashboard Tab Navigation
**Location:** `StudentDashboard.tsx` lines 332-350
**Fix Required:**
```tsx
// Add role and ARIA attributes to tab container
<div 
  role="tablist" 
  aria-label="Dashboard sections"
  className="flex space-x-2 p-1 bg-purple-800/20 rounded-xl"
>
  {(['overview', 'courses', 'achievements'] as const).map((tab) => (
    <motion.button
      key={tab}
      role="tab"
      aria-selected={activeTab === tab}
      aria-controls={`panel-${tab}`}
      id={`tab-${tab}`}
      tabIndex={activeTab === tab ? 0 : -1}
      onClick={() => setActiveTab(tab)}
      className="..."
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </motion.button>
  ))}
</div>

// Add to tab content panels
<motion.div
  key="overview"
  role="tabpanel"
  id="panel-overview"
  aria-labelledby="tab-overview"
  tabIndex={0}
  // ... existing props
>
```

---

### 3. Screen Reader Labels

#### Issue: Missing Labels on Interactive Elements
**Location:** `Navbar.tsx` lines 50-56, 57-62
**Fix Required:**
```tsx
// Theme toggle button
<button
  onClick={toggleTheme}
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  aria-pressed={theme === 'dark'}
  className="..."
>
  {theme === "dark" ? (
    <Sun aria-hidden="true" className="w-5 h-5" />
  ) : (
    <Moon aria-hidden="true" className="w-5 h-5" />
  )}
</button>

// Log In button
<Button
  variant="ghost"
  size="sm"
  onClick={() => window.location.href = '/auth'}
  aria-label="Log in to your account"
  className="..."
>
  Log In
</Button>

// Get Started button
<Button
  variant="hero"
  size="default"
  onClick={() => window.location.href = '/auth'}
  aria-label="Create a new account and get started"
  className="..."
>
  Get Started
</Button>
```

#### Issue: Gamification Elements Missing Labels
**Location:** `StudentDashboard.tsx` lines 243-251, 255-303
**Fix Required:**
```tsx
// Streak badge
<FloatingBadge role="status" aria-live="polite">
  <Flame aria-hidden="true" className="w-4 h-4 mr-1" />
  <span aria-label={`${state.studentStats?.streak || 0} day learning streak`}>
    {state.studentStats?.streak || 0} day streak
  </span>
</FloatingBadge>

// Level badge
<FloatingBadge color="yellow" role="status">
  <Zap aria-hidden="true" className="w-4 h-4 mr-1" />
  <span aria-label={`Current level ${state.studentStats?.level || 1}`}>
    Level {state.studentStats?.level || 1}
  </span>
</FloatingBadge>

// Stats cards
<AnimatedCard delay={0.1}>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-purple-200 text-sm">Total XP</p>
      <p className="text-2xl font-bold" aria-label={`${state.studentStats?.totalPoints?.toLocaleString() || 0} experience points`}>
        {state.studentStats?.totalPoints?.toLocaleString() || 0}
      </p>
    </div>
    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center" aria-hidden="true">
      <Zap className="w-5 h-5 text-purple-400" />
    </div>
  </div>
</AnimatedCard>

// Progress bar
<div className="w-full bg-purple-900/30 rounded-full h-4 overflow-hidden" role="progressbar" aria-valuenow={state.studentStats?.xp || 0} aria-valuemin={0} aria-valuemax={state.studentStats?.xpToNext || 100} aria-label={`Level progress: ${state.studentStats?.xp || 0} of ${state.studentStats?.xpToNext || 100} experience points`}>
  <motion.div
    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
    initial={{ width: 0 }}
    animate={{ width: `${xpProgress}%` }}
    transition={{ duration: 1, delay: 0.8 }}
  />
</div>
```

#### Issue: Course Cards Missing Labels
**Location:** `StudentDashboard.tsx` lines 369-396
**Fix Required:**
```tsx
<motion.div
  key={course.id}
  role="button"
  tabIndex={0}
  aria-label={`${course.title}, ${course.progress}% complete, next lesson: ${course.nextLesson}`}
  onClick={() => handleContinueCourse(course)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleContinueCourse(course);
    }
  }}
  className="..."
>
  {/* ... existing content */}
</motion.div>
```

#### Issue: Achievement Cards Missing Labels
**Location:** `StudentDashboard.tsx` lines 407-426
**Fix Required:**
```tsx
<motion.div
  key={achievement.id}
  role="article"
  aria-label={`Achievement: ${achievement.title}, ${achievement.unlocked ? 'unlocked' : 'locked'}, ${achievement.rarity} rarity`}
  className={`
    p-3 rounded-lg border-2 text-center
    ${getRarityColor(achievement.rarity)}
    ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}
  `}
>
  <div className="flex justify-center mb-2" aria-hidden="true">
    {achievement.icon}
  </div>
  <p className="font-medium text-sm">{achievement.title}</p>
  <p className="text-xs text-purple-200 mt-1">{achievement.description}</p>
</motion.div>
```

---

## 🟡 HIGH PRIORITY (Should Fix)

### 4. Focus Management

#### Issue: Focus Not Restored After Modal Close
**Fix Required:**
```tsx
// Store previous focus
const previousFocusRef = useRef<HTMLElement | null>(null);

// When opening modal
previousFocusRef.current = document.activeElement as HTMLElement;

// When closing modal
if (previousFocusRef.current) {
  previousFocusRef.current.focus();
}
```

#### Issue: Missing Focus Styles
**Fix Required:**
```css
/* Add to global CSS */
*:focus-visible {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}
```

---

### 5. Color Contrast

#### Issue: Text Contrast on Purple Background
**Location:** `StudentDashboard.tsx` - Various purple text elements
**Fix Required:**
```css
/* Ensure contrast ratio of at least 4.5:1 for normal text */
.text-purple-200 {
  color: #e9d5ff; /* Lighter purple for better contrast */
}

/* Ensure contrast ratio of at least 3:1 for large text */
.text-purple-400 {
  color: #c084fc; /* Adjusted for better contrast */
}
```

---

### 6. Skip Navigation Link

#### Issue: Missing Skip Link
**Fix Required:**
```tsx
// Add to layout.tsx or _app.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
>
  Skip to main content
</a>

// Add id to main content
<main id="main-content">
  {/* Your content */}
</main>
```

---

## 🟢 MEDIUM PRIORITY (Nice to Have)

### 7. Live Regions for Dynamic Content

#### Issue: Notifications Not Announced
**Location:** `StudentDashboard.tsx` - Notification system
**Fix Required:**
```tsx
// Add live region for notifications
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {state.notifications.map(n => n.message)}
</div>
```

---

### 8. Descriptive Page Titles

#### Issue: Generic Page Titles
**Fix Required:**
```tsx
// In each page component
useEffect(() => {
  document.title = 'Student Dashboard - FunFinity Academy';
  return () => {
    document.title = 'FunFinity Academy';
  };
}, []);
```

---

### 9. Heading Hierarchy

#### Issue: Missing Heading Levels
**Location:** `StudentDashboard.tsx`
**Fix Required:**
```tsx
// Ensure proper heading hierarchy
<header>
  <h1>Welcome back, Student!</h1>
</header>

<main>
  <section aria-labelledby="stats-heading">
    <h2 id="stats-heading" className="sr-only">Statistics Overview</h2>
    {/* Stats cards */}
  </section>

  <section aria-labelledby="progress-heading">
    <h2 id="progress-heading" className="sr-only">Level Progress</h2>
    {/* Progress bar */}
  </section>

  <section aria-labelledby="content-heading">
    <h2 id="content-heading" className="sr-only">Dashboard Content</h2>
    {/* Tab content */}
  </section>
</main>
```

---

### 10. Alt Text for Images

#### Issue: Missing Alt Text
**Fix Required:**
```tsx
// For all images
<Image
  src="/logo.png"
  alt="Funfinity Academy logo"
  // ... other props
/>
```

---

## 📋 COMPLETE ARIA ATTRIBUTE REFERENCE

### Navigation (Navbar.tsx)

```tsx
<header role="banner">
  <nav aria-label="Main navigation">
    <a href="/" aria-label="Funfinity Academy Home">
      {/* Logo */}
    </a>
    
    <div role="navigation" aria-label="Desktop menu">
      {navLinks.map((link) => (
        <a
          href={link.href}
          aria-label={`Navigate to ${link.label}`}
          tabIndex={0}
        >
          {link.label}
        </a>
      ))}
    </div>
    
    <button
      aria-label="Toggle mobile menu"
      aria-expanded={mobileMenuOpen}
      aria-controls="mobile-menu"
      aria-haspopup="true"
    >
      {/* Menu icon */}
    </button>
    
    <div
      id="mobile-menu"
      role="menu"
      aria-hidden={!mobileMenuOpen}
    >
      {/* Mobile menu items */}
    </div>
  </nav>
</header>
```

### Dashboard (StudentDashboard.tsx)

```tsx
<main role="main" aria-label="Student dashboard">
  <header>
    <h1>Welcome back, Student!</h1>
    
    <div role="status" aria-live="polite">
      <span aria-label={`${streak} day learning streak`}>
        {streak} day streak
      </span>
      <span aria-label={`Current level ${level}`}>
        Level {level}
      </span>
    </div>
  </header>
  
  <section aria-labelledby="stats-heading">
    <h2 id="stats-heading" className="sr-only">Statistics Overview</h2>
    {/* Stats cards with proper labels */}
  </section>
  
  <section aria-labelledby="progress-heading">
    <h2 id="progress-heading" className="sr-only">Level Progress</h2>
    <div
      role="progressbar"
      aria-valuenow={xp}
      aria-valuemin={0}
      aria-valuemax={xpToNext}
      aria-label={`Level progress: ${xp} of ${xpToNext} experience points`}
    >
      {/* Progress bar */}
    </div>
  </section>
  
  <div role="tablist" aria-label="Dashboard sections">
    {tabs.map((tab) => (
      <button
        role="tab"
        aria-selected={activeTab === tab}
        aria-controls={`panel-${tab}`}
        id={`tab-${tab}`}
        tabIndex={activeTab === tab ? 0 : -1}
      >
        {tab}
      </button>
    ))}
  </div>
  
  <div role="tabpanel" id="panel-{tab}" aria-labelledby="tab-{tab}">
    {/* Tab content */}
  </div>
  
  <section aria-labelledby="courses-heading">
    <h2 id="courses-heading">Continue Learning</h2>
    {courses.map((course) => (
      <article
        role="button"
        tabIndex={0}
        aria-label={`${course.title}, ${course.progress}% complete`}
      >
        {/* Course card */}
      </article>
    ))}
  </section>
  
  <section aria-labelledby="achievements-heading">
    <h2 id="achievements-heading">Recent Achievements</h2>
    {achievements.map((achievement) => (
      <article
        role="article"
        aria-label={`Achievement: ${achievement.title}, ${achievement.unlocked ? 'unlocked' : 'locked'}`}
      >
        {/* Achievement card */}
      </article>
    ))}
  </section>
</main>
```

---

## ✅ TESTING CHECKLIST

### Keyboard Navigation
- [ ] Tab through all interactive elements in logical order
- [ ] Shift+Tab navigates backwards
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals and menus
- [ ] Arrow keys navigate within tab lists and menus
- [ ] No keyboard traps exist

### Screen Reader Testing
- [ ] All images have descriptive alt text
- [ ] All form fields have associated labels
- [ ] All interactive elements have accessible names
- [ ] Dynamic content updates are announced
- [ ] Progress bars convey current value
- [ ] Status messages are in live regions
- [ ] Heading hierarchy is logical

### Visual Testing
- [ ] Focus indicators are visible on all elements
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text, 3:1 for large text)
- [ ] Text can be resized up to 200% without loss of content
- [ ] Content is usable when colors are removed
- [ ] No flashing content that could trigger seizures

### Mobile Testing
- [ ] Touch targets are at least 44x44 pixels
- [ ] Content is readable without horizontal scrolling
- [ ] Zoom works up to 200%
- [ ] Orientation changes don't break functionality

---

## 🛠️ IMPLEMENTATION PRIORITY

1. **Immediate (Critical):**
   - Add escape key handler for mobile menu
   - Add proper ARIA labels to all interactive elements
   - Fix tab ordering in dashboard tabs
   - Add screen reader labels to gamification elements

2. **Short-term (High Priority):**
   - Implement focus management
   - Add skip navigation link
   - Fix color contrast issues
   - Add focus styles

3. **Long-term (Medium Priority):**
   - Add live regions for notifications
   - Improve heading hierarchy
   - Add descriptive page titles
   - Comprehensive alt text audit

---

## 📚 RESOURCES

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Accessibility](https://react.dev/learn/accessibility)
- [Framer Motion Accessibility](https://www.framer.com/motion/accessibility/)
