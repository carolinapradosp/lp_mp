// e2e/admin-login.spec.ts
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

    await page.getByPlaceholder('Digite seu usuário').fill(username);
    await page.getByPlaceholder('Digite sua senha').fill(password);

    const dashboardUrl = new URL('/admin/dashboard', page.url()).href;

    const loginResponsePromise = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/admin/login' &&
        response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Entrar', exact: true }).click();

    const loginResponse = await loginResponsePromise;

    expect(
      loginResponse.status(),
      'A API de login deve retornar HTTP 200'
    ).toBe(200);

    await expect
      .poll(
        async () => {
          const cookies = await page.context().cookies(dashboardUrl);

          return cookies.some(
            (cookie) =>
              cookie.name === 'admin-session' && cookie.value.length > 0
          );
        },
        {
          message:
            'O login deve gravar o cookie admin-session disponível para o dashboard',
        }
      )
      .toBe(true);

    // Permite a compilação inicial da página no servidor de desenvolvimento.
    await expect(page).toHaveURL(/\/admin\/dashboard\/?$/, {
      timeout: 15_000,
    });

    await expect(
      page.getByRole('link', { name: 'Pedidos', exact: true })
    ).toBeVisible();
  });

  test('deve impedir acesso ao dashboard sem autenticação', async ({
    page,
  }) => {
    // Cada teste recebe um contexto de navegador isolado por padrão.
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/admin\/?$/);

    await expect(
      page.getByRole('button', { name: 'Entrar', exact: true })
    ).toBeVisible();
  });
});
