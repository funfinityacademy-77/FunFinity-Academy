# Playwright E2E Test Suite

This directory contains end-to-end tests for FunFinity Academy using Playwright.

## Setup

Install dependencies:
```bash
npm install -D @playwright/test @types/node
npx playwright install
```

## Running Tests

Run all tests against live Vercel deployment:
```bash
npx playwright test
```

Run tests in headed mode (watch browser):
```bash
npx playwright test --headed
```

Run specific test file:
```bash
npx playwright test auth.spec.ts
```

Run tests in debug mode:
```bash
npx playwright test --debug
```

View test report:
```bash
npx playwright show-report
```

## Environment Variables

Set test credentials in `.env`:
```
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
```

## Test Coverage

- **auth.spec.ts**: Authentication flow, form validation, session management
- **student-flow.spec.ts**: Student features, A4 infographic generator, responsive design, accessibility

## CI/CD Integration

Tests are configured to run on CI with retries and parallel execution.
