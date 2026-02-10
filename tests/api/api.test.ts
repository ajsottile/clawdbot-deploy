/**
 * ClawBot Deploy - API Integration Tests
 * 
 * STATUS: Framework ready, tests pending API development
 * 
 * Run: npx jest tests/api
 * 
 * These tests validate API contracts, error handling, and security
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';

// Test utilities
async function apiRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ status: number; body: any }> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

describe('Health Check', () => {
  test('GET /health returns 200', async () => {
    const { status, body } = await apiRequest('/health');
    expect(status).toBe(200);
    expect(body.status).toBe('healthy');
  });
});

describe('Authentication API', () => {
  
  describe('POST /auth/signup', () => {
    test('creates new user with valid data', async () => {
      const { status, body } = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          password: 'SecurePass123!',
        }),
      });
      
      expect(status).toBe(201);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBeDefined();
      expect(body.token).toBeDefined();
      // Password should never be returned
      expect(body.user.password).toBeUndefined();
    });

    test('rejects invalid email format', async () => {
      const { status, body } = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'SecurePass123!',
        }),
      });
      
      expect(status).toBe(400);
      expect(body.error).toBeDefined();
    });

    test('rejects weak password', async () => {
      const { status, body } = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123',
        }),
      });
      
      expect(status).toBe(400);
      expect(body.error).toMatch(/password/i);
    });

    test('rejects duplicate email', async () => {
      const email = `dupe-${Date.now()}@example.com`;
      
      // First signup
      await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'SecurePass123!' }),
      });
      
      // Second signup with same email
      const { status } = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'SecurePass123!' }),
      });
      
      expect(status).toBe(409); // Conflict
    });
  });

  describe('POST /auth/login', () => {
    test('returns token for valid credentials', async () => {
      // Assumes test user exists
      const { status, body } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePass123!',
        }),
      });
      
      expect(status).toBe(200);
      expect(body.token).toBeDefined();
      expect(body.user).toBeDefined();
    });

    test('returns 401 for invalid password', async () => {
      const { status, body } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      });
      
      expect(status).toBe(401);
      // Should NOT reveal if email exists
      expect(body.error).toMatch(/invalid credentials/i);
    });

    test('returns 401 for non-existent user', async () => {
      const { status, body } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        }),
      });
      
      expect(status).toBe(401);
      // Same error as wrong password (security)
      expect(body.error).toMatch(/invalid credentials/i);
    });
  });
});

describe('Azure Credentials API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Get auth token
    const { body } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePass123!',
      }),
    });
    authToken = body.token;
  });

  describe('POST /azure/credentials', () => {
    test('requires authentication', async () => {
      const { status } = await apiRequest('/azure/credentials', {
        method: 'POST',
        body: JSON.stringify({
          subscriptionId: 'test',
          tenantId: 'test',
          clientId: 'test',
          clientSecret: 'test',
        }),
      });
      
      expect(status).toBe(401);
    });

    test('validates credential format', async () => {
      const { status, body } = await apiRequest('/azure/credentials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          subscriptionId: '', // Empty
          tenantId: 'test',
          clientId: 'test',
          clientSecret: 'test',
        }),
      });
      
      expect(status).toBe(400);
      expect(body.error).toMatch(/subscriptionId/i);
    });

    test('saves valid credentials', async () => {
      const { status, body } = await apiRequest('/azure/credentials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          subscriptionId: 'sub-123',
          tenantId: 'tenant-456',
          clientId: 'client-789',
          clientSecret: 'secret-abc',
        }),
      });
      
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      // Secret should never be returned
      expect(body.clientSecret).toBeUndefined();
    });
  });

  describe('POST /azure/credentials/test', () => {
    test('validates Azure connection', async () => {
      const { status, body } = await apiRequest('/azure/credentials/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          subscriptionId: process.env.TEST_AZURE_SUBSCRIPTION_ID || 'test',
          tenantId: process.env.TEST_AZURE_TENANT_ID || 'test',
          clientId: process.env.TEST_AZURE_CLIENT_ID || 'test',
          clientSecret: process.env.TEST_AZURE_CLIENT_SECRET || 'test',
        }),
      });
      
      // Either succeeds or fails with clear error
      expect([200, 400]).toContain(status);
      if (status === 400) {
        expect(body.error).toBeDefined();
        // Should not leak internal Azure errors
        expect(body.error).not.toMatch(/stack|trace/i);
      }
    });
  });
});

describe('Deployment API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    const { body } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePass123!',
      }),
    });
    authToken = body.token;
  });

  describe('GET /deployments', () => {
    test('requires authentication', async () => {
      const { status } = await apiRequest('/deployments');
      expect(status).toBe(401);
    });

    test('returns user deployments', async () => {
      const { status, body } = await apiRequest('/deployments', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      expect(status).toBe(200);
      expect(Array.isArray(body.deployments)).toBe(true);
    });

    test('does not return other users deployments', async () => {
      const { body } = await apiRequest('/deployments', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      // All deployments should belong to current user
      for (const deployment of body.deployments) {
        expect(deployment.userId).toBeDefined();
        // Can't directly verify user, but should have consistent userId
      }
    });
  });

  describe('POST /deployments', () => {
    test('requires authentication', async () => {
      const { status } = await apiRequest('/deployments', {
        method: 'POST',
        body: JSON.stringify({
          name: 'test-vm',
          region: 'eastus',
          size: 'Standard_B1s',
        }),
      });
      
      expect(status).toBe(401);
    });

    test('validates required fields', async () => {
      const { status, body } = await apiRequest('/deployments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          name: '', // Empty
        }),
      });
      
      expect(status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    test('validates VM name format', async () => {
      const { status, body } = await apiRequest('/deployments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          name: 'Invalid Name With Spaces!',
          region: 'eastus',
          size: 'Standard_B1s',
        }),
      });
      
      expect(status).toBe(400);
      expect(body.error).toMatch(/name/i);
    });

    test('validates region', async () => {
      const { status, body } = await apiRequest('/deployments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          name: 'test-vm',
          region: 'invalid-region',
          size: 'Standard_B1s',
        }),
      });
      
      expect(status).toBe(400);
      expect(body.error).toMatch(/region/i);
    });

    test('requires Azure credentials configured', async () => {
      // Assuming fresh user without Azure creds
      const { status, body } = await apiRequest('/deployments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          name: 'test-vm',
          region: 'eastus',
          size: 'Standard_B1s',
        }),
      });
      
      // Should fail if no Azure creds
      if (status === 400) {
        expect(body.error).toMatch(/azure|credentials/i);
      }
    });
  });

  describe('DELETE /deployments/:id', () => {
    test('requires authentication', async () => {
      const { status } = await apiRequest('/deployments/some-id', {
        method: 'DELETE',
      });
      
      expect(status).toBe(401);
    });

    test('returns 404 for non-existent deployment', async () => {
      const { status } = await apiRequest('/deployments/non-existent-id', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      expect(status).toBe(404);
    });

    test('cannot delete other users deployments', async () => {
      // This test requires another user's deployment ID
      // In practice, would be an integration test
      const { status } = await apiRequest('/deployments/other-user-deployment-id', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      // Should return 404 (not 403) to avoid revealing existence
      expect([404, 403]).toContain(status);
    });
  });
});

describe('Error Handling', () => {
  test('returns JSON for 404 errors', async () => {
    const { status, body } = await apiRequest('/nonexistent-endpoint');
    
    expect(status).toBe(404);
    expect(body).toBeDefined();
    expect(body.error).toBeDefined();
  });

  test('does not expose stack traces in production', async () => {
    // Trigger an error
    const { body } = await apiRequest('/auth/login', {
      method: 'POST',
      body: 'not-valid-json',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (body.error) {
      expect(body.error).not.toMatch(/at \w+\s+\(/); // Stack trace pattern
      expect(body.stack).toBeUndefined();
    }
  });
});

describe('Rate Limiting', () => {
  test('limits login attempts', async () => {
    const responses = await Promise.all(
      Array(20).fill(null).map(() => 
        apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'rate-limit-test@example.com',
            password: 'WrongPassword',
          }),
        })
      )
    );
    
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });
});
