/**
 * Playwright E2E Test: Student Flow
 * Tests A4 Study Note Generator and student features on live Vercel deployment
 */

import { test, expect } from '@playwright/test';

test.describe('Student Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with hero section', async ({ page }) => {
    // Verify hero section is visible
    await expect(page.locator('h1')).toContainText('AI-Powered Coding Academy');
    await expect(page.locator('text=Where curiosity meets depth')).toBeVisible();
    
    // Verify CTA button
    const ctaButton = page.locator('text=Start Learning Now');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('should display trust statistics', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(2000);
    
    // Verify stats are displayed
    await expect(page.locator('text=Students')).toBeVisible();
    await expect(page.locator('text=Courses')).toBeVisible();
    await expect(page.locator('text=Rating')).toBeVisible();
  });

  test('should navigate to A4 infographic generator', async ({ page }) => {
    // This test assumes the user is logged in
    // In production, authenticate first
    
    // Navigate to notes section
    await page.goto('/app/notes');
    
    // Verify infographic generator is visible
    await expect(page.locator('text=Infographic Generator')).toBeVisible();
  });

  test('should create A4 infographic with text element', async ({ page }) => {
    await page.goto('/app/notes');
    
    // Click add text element
    await page.click('button:has-text("Text")');
    
    // Verify text element is added
    await expect(page.locator('[contenteditable="true"]')).toBeVisible();
    
    // Type text
    await page.type('[contenteditable="true"]', 'Test Study Notes');
    
    // Verify text is displayed
    await expect(page.locator('text=Test Study Notes')).toBeVisible();
  });

  test('should change infographic element color', async ({ page }) => {
    await page.goto('/app/notes');
    
    // Add text element
    await page.click('button:has-text("Text")');
    
    // Select color picker
    await page.click('button[style*="background-color: #000000"]');
    
    // Verify color change
    const colorButton = page.locator('button[style*="background-color: #4a90e2"]');
    await expect(colorButton).toBeVisible();
  });

  test('should export infographic as image', async ({ page }) => {
    await page.goto('/app/notes');
    
    // Add element
    await page.click('button:has-text("Text")');
    await page.type('[contenteditable="true"]', 'Test Notes');
    
    // Click export button
    await page.click('button:has-text("Export as Image")');
    
    // Verify export started (toast notification)
    await expect(page.locator('text=Export started')).toBeVisible({ timeout: 5000 });
  });

  test('should use low bandwidth mode toggle', async ({ page }) => {
    await page.goto('/app/settings');
    
    // Verify low bandwidth toggle is visible
    await expect(page.locator('text=Low Bandwidth Mode')).toBeVisible();
    
    // Click toggle
    await page.click('button[role="switch"]');
    
    // Verify toggle state changed
    await expect(page.locator('text=Heavy assets disabled')).toBeVisible();
  });

  test('should test connection speed', async ({ page }) => {
    await page.goto('/app/settings');
    
    // Click test speed button
    await page.click('button:has-text("Test Speed")');
    
    // Wait for test to complete
    await page.waitForTimeout(3000);
    
    // Verify connection status is displayed
    await expect(page.locator('text=connection test complete')).toBeVisible();
  });

  test('should display responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile menu is visible
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
    
    // Verify hero text is readable on mobile
    const heroText = page.locator('h1');
    await expect(heroText).toBeVisible();
    
    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('should have proper z-index on modals', async ({ page }) => {
    await page.goto('/');
    
    // Click footer to open modal
    await page.click('footer');
    
    // Verify modal is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify modal has high z-index
    const zIndex = await page.locator('[role="dialog"]').evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });
    expect(parseInt(zIndex)).toBeGreaterThanOrEqual(50);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
    
    // Verify focus ring is visible
    const hasFocusRing = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return el && window.getComputedStyle(el).outline !== 'none';
    });
    expect(hasFocusRing).toBeTruthy();
  });

  test('should have proper ARIA labels for accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA labels on buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const hasText = await button.textContent();
      
      // Button should either have aria-label or text content
      expect(ariaLabel || hasText).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check contrast of main heading
    const heading = page.locator('h1');
    const backgroundColor = await heading.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const color = await heading.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Verify colors are not the same (basic contrast check)
    expect(backgroundColor).not.toBe(color);
  });

  test('should handle form validation with Zod schemas', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation errors appear
    await expect(page.locator('text=required')).toBeVisible({ timeout: 5000 });
  });

  test('should prevent XSS in form inputs', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to inject script
    await page.fill('input[type="email"]', '<script>alert("XSS")</script>');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify script was not executed (no alert)
    // And validation error appears
    await expect(page.locator('text=valid email')).toBeVisible({ timeout: 5000 });
  });
});
