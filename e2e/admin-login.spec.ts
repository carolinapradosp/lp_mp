import { expect, test } from '@playwright/test';

test.describe('Login administrativo', () => {
  test('deve permitir login com credenciais válidas', async ({ page }) => {
    const username = process.env.E2E_ADMIN_USERNAME;

    const password = process.env.E2E_ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error(
        'Defina E2E_ADMIN_USERNAME e E2E_ADMIN_PASSWORD no .env.local'
      );
    }

    await page.goto('/admin');

    await page.locator('input[name="username"]').fill(username);

    await page.locator('input[name="password"]').fill(password);

    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin/login') &&
        response.request().method() === 'POST'
    );

    await page
      .getByRole('button', {
        name: /entrar/i,
      })
      .click();

    const loginResponse = await loginResponsePromise;

    expect(loginResponse.status()).toBe(200);

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await expect(page.getByText('Painel Administrativo')).toBeVisible();
  });

  test('deve impedir acesso ao dashboard sem autenticação', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/admin$/);

    await expect(
      page.getByRole('button', {
        name: /entrar/i,
      })
    ).toBeVisible();
  });
});
