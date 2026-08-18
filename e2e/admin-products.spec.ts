import { expect, test, type Page } from '@playwright/test';

async function loginAdmin(page: Page): Promise<void> {
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

  await expect(page).toHaveURL(/\/admin\/dashboard/, {
    timeout: 15_000,
  });
}

test.describe('Gerenciamento de produtos', () => {
  /*
   * Em modo dev, o Next pode demorar para
   * compilar páginas acessadas pela primeira vez.
   */
  test.setTimeout(120_000);

  test('deve cadastrar um produto e exibi-lo na listagem', async ({ page }) => {
    const productTitle = `Produto E2E ${Date.now()}`;

    // console.log('1 - Iniciando login');

    await loginAdmin(page);

    // console.log('2 - Login concluído');

    /*
     * Acessa Produtos.
     */
    await page
      .getByRole('link', {
        name: /produtos/i,
      })
      .click();

    await expect(page).toHaveURL(/\/admin\/products$/, {
      timeout: 20_000,
    });

    // console.log('3 - Página de produtos aberta');

    /*
     * Abre o cadastro.
     */
    await page
      .getByRole('link', {
        name: /novo produto/i,
      })
      .click();

    await expect(page).toHaveURL(/\/admin\/products\/new/, {
      timeout: 30_000,
    });

    await expect(page.locator('form[data-hydrated="true"]')).toBeVisible({
      timeout: 30_000,
    });

    // console.log('4 - Página de novo produto hidratada');

    await page.getByLabel('Nome do produto').fill(productTitle);

    await page
      .getByLabel('Descrição')
      .fill('Produto criado automaticamente pelo teste E2E.');

    await page.getByLabel('Preço base').fill('1.200,00');

    await page.getByLabel('Estoque').fill('10');

    // console.log('5 - Dados principais preenchidos');

    const quantityInputs = page.locator('input[id^="min-quantity-"]');

    const priceInputs = page.locator('input[id^="unit-price-"]');

    await page
      .getByRole('button', {
        name: /adicionar regra/i,
      })
      .click();

    await expect(quantityInputs).toHaveCount(1, {
      timeout: 10_000,
    });

    await expect(priceInputs).toHaveCount(1, {
      timeout: 10_000,
    });

    await quantityInputs.first().fill('2');

    await priceInputs.first().fill('1.100,00');

    // console.log('6 - Primeira regra preenchida');

    /*
     * Segunda regra.
     */
    await page
      .getByRole('button', {
        name: /adicionar regra/i,
      })
      .click();

    await expect(quantityInputs).toHaveCount(2, {
      timeout: 10_000,
    });

    await expect(priceInputs).toHaveCount(2, {
      timeout: 10_000,
    });

    await quantityInputs.nth(1).fill('3');

    await priceInputs.nth(1).fill('1.050,00');

    // console.log('7 - Segunda regra preenchida');

    /*
     * Salva o produto.
     */
    await page
      .getByRole('button', {
        name: /cadastrar produto/i,
      })
      .click();

    // console.log('8 - Clique em cadastrar realizado');

    /*
     * A Server Action deve retornar
     * para a listagem.
     */
    await expect(page).toHaveURL(/\/admin\/products$/, {
      timeout: 30_000,
    });

    // console.log('9 - Retornou para listagem');

    /*
     * Procura especificamente a linha
     * do produto criado pelo teste.
     */
    const productRow = page.getByRole('row').filter({
      hasText: productTitle,
    });

    await expect(productRow).toBeVisible({
      timeout: 15_000,
    });

    /*
     * Valida os dados exibidos.
     */
    await expect(productRow).toContainText('R$ 1.200,00');

    await expect(productRow).toContainText('10');

    /*
     * Quantidade de regras progressivas.
     */
    await expect(productRow).toContainText('2');

    // console.log('10 - Produto encontrado na tabela');

    /*
     * Confirma o window.confirm()
     * utilizado na exclusão.
     */
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');

      await dialog.accept();
    });

    /*
     * Exclui o produto criado pelo teste
     * para não deixar lixo no banco.
     */
    await productRow
      .getByRole('button', {
        name: new RegExp(`excluir ${productTitle}`, 'i'),
      })
      .click();

    // console.log('11 - Exclusão confirmada');

    /*
     * Confirma que desapareceu da tabela.
     */
    await expect(
      page.getByRole('row').filter({
        hasText: productTitle,
      })
    ).toHaveCount(0, {
      timeout: 15_000,
    });

    // console.log('12 - Produto removido da tabela');
  });
});
