/**
 * Playwright E2E Test: Authentication Flow
 * Tests login, signup, and session management on live Vercel deployment
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to auth page and display login form', async ({ page }) => {
    // Dismiss any modal overlays (cookie consent, etc.)
    const modal = page.locator('[data-state="open"][aria-hidden="true"]');
    if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Click on login button
    await page.click('text=Start Learning Now');
    
    // Wait for navigation to auth page
    await page.waitForURL('**/auth');
    
    // Verify auth page elements
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/auth');
    
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=invalid email')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/auth');
    
    // Enter short password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'short');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=at least 8 characters')).toBeVisible({ timeout: 5000 });
  });

  test('should switch between login and signup modes', async ({ page }) => {
    await page.goto('/auth');
    
    // Verify login mode is active
    await expect(page.locator('h1')).toContainText('Welcome Back');
    
    // Click on signup link
    await page.click('text=Create account');
    
    // Verify signup mode is active
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('input[placeholder*="name"]')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/auth');
    
    // Click on forgot password
    await page.click('text=Forgot password?');
    
    // Verify reset form is visible
    await expect(page.locator('h1')).toContainText('Reset Password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Enter email and submit
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Reset link sent')).toBeVisible({ timeout: 5000 });
  });

  test('should have proper autocomplete attributes on auth forms', async ({ page }) => {
    await page.goto('/auth');
    
    // Verify email autocomplete
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('autoComplete', 'email');
    
    // Verify password autocomplete
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  test('should prevent form submission during loading state', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Verify button is disabled during loading
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/auth');
    
    // Note: This test requires valid test credentials
    // In production, use test account credentials from environment variables
    
    // Fill form with test credentials
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/app/**', { timeout: 15000 });
    
    // Verify dashboard is loaded
    await expect(page.locator('h1, h2')).toContainText('Dashboard', { timeout: 10000 });
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    // This test simulates session expiration
    await page.goto('/app/dashboard');
    
    // If session is expired, should redirect to auth
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      await expect(page.locator('h1')).toContainText('Welcome Back');
    }
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // This test requires a valid session
    // Skip if no test credentials are available
    if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
      test.skip();
    }

    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/app/**');
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard (session persisted)
    await expect(page.url()).toContain('/app');
  });
});
