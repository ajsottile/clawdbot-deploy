/**
 * ClawBot Deploy - Deployment Flow E2E Tests
 * 
 * STATUS: Framework ready, tests pending feature development
 * 
 * These tests cover the critical user journey:
 * User login → Configure deployment → Deploy VM → Verify success
 */

import { test, expect } from '@playwright/test';

// Test fixtures
const TEST_USER = {
  email: 'deploy-test@example.com',
  password: 'SecurePass123!'
};

const VALID_AZURE_CREDS = {
  subscriptionId: process.env.TEST_AZURE_SUBSCRIPTION_ID || 'test-sub-id',
  tenantId: process.env.TEST_AZURE_TENANT_ID || 'test-tenant-id',
  clientId: process.env.TEST_AZURE_CLIENT_ID || 'test-client-id',
  clientSecret: process.env.TEST_AZURE_CLIENT_SECRET || 'test-secret'
};

test.describe('Azure Credentials Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow user to add Azure credentials', async ({ page }) => {
    await page.goto('/settings/azure');
    
    await page.fill('[data-testid="subscription-id"]', VALID_AZURE_CREDS.subscriptionId);
    await page.fill('[data-testid="tenant-id"]', VALID_AZURE_CREDS.tenantId);
    await page.fill('[data-testid="client-id"]', VALID_AZURE_CREDS.clientId);
    await page.fill('[data-testid="client-secret"]', VALID_AZURE_CREDS.clientSecret);
    
    await page.click('[data-testid="test-connection-button"]');
    await expect(page.locator('[data-testid="connection-status"]')).toContainText(/success|connected/i);
    
    await page.click('[data-testid="save-credentials-button"]');
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
  });

  test('should mask credential values in UI', async ({ page }) => {
    await page.goto('/settings/azure');
    
    // Assuming credentials already saved
    const secretInput = page.locator('[data-testid="client-secret"]');
    
    // Input type should be password (masked)
    await expect(secretInput).toHaveAttribute('type', 'password');
  });

  test('should show clear error for invalid credentials', async ({ page }) => {
    await page.goto('/settings/azure');
    
    await page.fill('[data-testid="subscription-id"]', 'invalid');
    await page.fill('[data-testid="tenant-id"]', 'invalid');
    await page.fill('[data-testid="client-id"]', 'invalid');
    await page.fill('[data-testid="client-secret"]', 'invalid');
    
    await page.click('[data-testid="test-connection-button"]');
    
    await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="connection-error"]')).not.toContainText(/stack|trace|exception/i);
  });
});

test.describe('VM Deployment Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login and assume Azure creds are configured
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display deployment wizard with all options', async ({ page }) => {
    await page.click('[data-testid="new-deployment-button"]');
    
    // Step 1: Region selection
    await expect(page.locator('[data-testid="region-select"]')).toBeVisible();
    const regionOptions = await page.locator('[data-testid="region-option"]').count();
    expect(regionOptions).toBeGreaterThan(5); // Should have multiple regions
    
    // Step 2: VM Size selection
    await page.selectOption('[data-testid="region-select"]', 'eastus');
    await page.click('[data-testid="next-step"]');
    
    await expect(page.locator('[data-testid="vm-size-select"]')).toBeVisible();
    
    // Step 3: Configuration
    await page.selectOption('[data-testid="vm-size-select"]', 'Standard_B1s');
    await page.click('[data-testid="next-step"]');
    
    await expect(page.locator('[data-testid="vm-name-input"]')).toBeVisible();
  });

  test('should validate VM name requirements', async ({ page }) => {
    await page.click('[data-testid="new-deployment-button"]');
    
    // Navigate to name step
    await page.selectOption('[data-testid="region-select"]', 'eastus');
    await page.click('[data-testid="next-step"]');
    await page.selectOption('[data-testid="vm-size-select"]', 'Standard_B1s');
    await page.click('[data-testid="next-step"]');
    
    // Try invalid name (too short)
    await page.fill('[data-testid="vm-name-input"]', 'a');
    await page.click('[data-testid="deploy-button"]');
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    
    // Try invalid name (special chars)
    await page.fill('[data-testid="vm-name-input"]', 'my_vm!@#');
    await page.click('[data-testid="deploy-button"]');
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    
    // Valid name
    await page.fill('[data-testid="vm-name-input"]', 'my-openclaw-vm');
    await expect(page.locator('[data-testid="name-error"]')).not.toBeVisible();
  });

  test('should show deployment progress', async ({ page }) => {
    // Complete wizard
    await page.click('[data-testid="new-deployment-button"]');
    await page.selectOption('[data-testid="region-select"]', 'eastus');
    await page.click('[data-testid="next-step"]');
    await page.selectOption('[data-testid="vm-size-select"]', 'Standard_B1s');
    await page.click('[data-testid="next-step"]');
    await page.fill('[data-testid="vm-name-input"]', 'test-vm-' + Date.now());
    await page.click('[data-testid="deploy-button"]');
    
    // Should show progress
    await expect(page.locator('[data-testid="deployment-progress"]')).toBeVisible();
    
    // Should have clear status messages
    await expect(page.locator('[data-testid="status-message"]')).toBeVisible();
    
    // Progress should update (wait for at least one update)
    const initialStatus = await page.locator('[data-testid="status-message"]').textContent();
    await page.waitForTimeout(5000);
    
    // Either status changed or deployment completed
    const currentStatus = await page.locator('[data-testid="status-message"]').textContent();
    const hasProgress = initialStatus !== currentStatus || 
                        await page.locator('[data-testid="deployment-success"]').isVisible() ||
                        await page.locator('[data-testid="deployment-error"]').isVisible();
    expect(hasProgress).toBeTruthy();
  });

  test.skip('should complete full deployment successfully', async ({ page }) => {
    // SKIP: This test requires real Azure credentials and takes ~5 minutes
    // Run manually: npx playwright test --grep "full deployment" --project=integration
    
    await page.click('[data-testid="new-deployment-button"]');
    await page.selectOption('[data-testid="region-select"]', 'eastus');
    await page.click('[data-testid="next-step"]');
    await page.selectOption('[data-testid="vm-size-select"]', 'Standard_B1s');
    await page.click('[data-testid="next-step"]');
    await page.fill('[data-testid="vm-name-input"]', 'qa-test-vm-' + Date.now());
    await page.click('[data-testid="deploy-button"]');
    
    // Wait for completion (up to 5 minutes)
    await expect(page.locator('[data-testid="deployment-success"]')).toBeVisible({ timeout: 300000 });
    
    // Should show VM details
    await expect(page.locator('[data-testid="vm-ip-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="openclaw-status"]')).toContainText(/running|healthy/i);
  });
});

test.describe('Instance Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');
  });

  test('should display list of deployed instances', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show instances table or empty state
    const hasInstances = await page.locator('[data-testid="instance-row"]').count() > 0;
    const hasEmptyState = await page.locator('[data-testid="no-instances"]').isVisible();
    
    expect(hasInstances || hasEmptyState).toBeTruthy();
  });

  test('should show instance status in real-time', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Assuming at least one instance exists
    const statusIndicator = page.locator('[data-testid="instance-status"]').first();
    
    if (await statusIndicator.isVisible()) {
      // Status should be one of: running, stopped, starting, stopping, error
      const statusText = await statusIndicator.textContent();
      expect(statusText).toMatch(/running|stopped|starting|stopping|error/i);
    }
  });

  test('should allow stopping a running instance', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find a running instance
    const runningInstance = page.locator('[data-testid="instance-row"]:has([data-testid="instance-status"]:text("Running"))').first();
    
    if (await runningInstance.isVisible()) {
      await runningInstance.locator('[data-testid="stop-button"]').click();
      
      // Should show confirmation
      await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
      await page.click('[data-testid="confirm-stop"]');
      
      // Status should change
      await expect(runningInstance.locator('[data-testid="instance-status"]')).toContainText(/stopping|stopped/i, { timeout: 60000 });
    }
  });

  test('should allow deleting an instance with cleanup', async ({ page }) => {
    await page.goto('/dashboard');
    
    const instance = page.locator('[data-testid="instance-row"]').first();
    
    if (await instance.isVisible()) {
      await instance.locator('[data-testid="delete-button"]').click();
      
      // Must show warning
      await expect(page.locator('[data-testid="delete-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-warning"]')).toContainText(/permanent|cannot be undone/i);
      
      // Require confirmation (type instance name)
      const instanceName = await instance.locator('[data-testid="instance-name"]').textContent();
      await page.fill('[data-testid="confirm-delete-input"]', instanceName!);
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Should remove from list
      await expect(instance).not.toBeVisible({ timeout: 60000 });
    }
  });
});
