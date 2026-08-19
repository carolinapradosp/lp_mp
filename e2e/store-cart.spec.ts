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

async function createTestProduct(
  page: Page,
  productTitle: string
): Promise<void> {
  await loginAdmin(page);

  await page.goto('/admin/products');

  await expect(page).toHaveURL(/\/admin\/products$/, {
    timeout: 20_000,
  });

  await page
    .getByRole('link', {
      name: /novo produto/i,
    })
    .click();

  await expect(page).toHaveURL(/\/admin\/products\/new/, {
    timeout: 30_000,
  });

  /*
   * Espera o ProductForm estar hidratado.
   */
  await expect(page.locator('form[data-hydrated="true"]')).toBeVisible({
    timeout: 30_000,
  });

  await page.getByLabel('Nome do produto').fill(productTitle);

  await page
    .getByLabel('Descrição')
    .fill('Produto criado para teste E2E do carrinho.');

  await page.getByLabel('Preço base').fill('1.200,00');

  await page.getByLabel('Estoque').fill('10');

  const quantityInputs = page.locator('input[id^="min-quantity-"]');

  const priceInputs = page.locator('input[id^="unit-price-"]');

  /*
   * Regra para 2 unidades.
   */
  await page
    .getByRole('button', {
      name: /adicionar regra/i,
    })
    .click();

  await expect(quantityInputs).toHaveCount(1);

  await quantityInputs.nth(0).fill('2');

  await priceInputs.nth(0).fill('1.100,00');

  /*
   * Regra para 3 unidades.
   */
  await page
    .getByRole('button', {
      name: /adicionar regra/i,
    })
    .click();

  await expect(quantityInputs).toHaveCount(2);

  await quantityInputs.nth(1).fill('3');

  await priceInputs.nth(1).fill('1.050,00');

  /*
   * Regra para 4 unidades.
   */
  await page
    .getByRole('button', {
      name: /adicionar regra/i,
    })
    .click();

  await expect(quantityInputs).toHaveCount(3);

  await quantityInputs.nth(2).fill('4');

  await priceInputs.nth(2).fill('1.000,00');

  await page
    .getByRole('button', {
      name: /cadastrar produto/i,
    })
    .click();

  await expect(page).toHaveURL(/\/admin\/products$/, {
    timeout: 30_000,
  });

  await expect(
    page.getByRole('row').filter({
      hasText: productTitle,
    })
  ).toBeVisible({
    timeout: 15_000,
  });
}

async function deleteTestProduct(
  page: Page,
  productTitle: string
): Promise<void> {
  await page.goto('/admin/products');

  await expect(page).toHaveURL(/\/admin\/products$/, {
    timeout: 20_000,
  });

  const productRow = page.getByRole('row').filter({
    hasText: productTitle,
  });

  /*
   * Se o teste falhou antes do cadastro terminar,
   * não há nada para limpar.
   */
  if ((await productRow.count()) === 0) {
    return;
  }

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  await productRow
    .getByRole('button', {
      name: new RegExp(`excluir ${productTitle}`, 'i'),
    })
    .click();

  await expect(productRow).toHaveCount(0, {
    timeout: 15_000,
  });
}

test.describe('Loja e carrinho', () => {
  test.setTimeout(180_000);

  test('deve aplicar preço progressivo conforme a quantidade aumenta', async ({
    page,
  }) => {
    const productTitle = `Produto Carrinho E2E ${Date.now()}`;

    let productCreated = false;

    try {
      /*
       * Cria produto controlado para o teste.
       */
      await createTestProduct(page, productTitle);

      productCreated = true;

      /*
       * Abre a loja.
       */
      await page.goto('/');

      /*
       * Remove eventual carrinho persistido
       * de execução anterior.
       */
      await page.evaluate(() => {
        localStorage.removeItem('cart-storage');
      });

      await page.reload();

      /*
       * Espera o Zustand terminar
       * a hidratação.
       */
      await expect(page.locator('[data-cart-hydrated="true"]')).toBeVisible({
        timeout: 30_000,
      });

      /*
       * Localiza exatamente o produto
       * criado pelo teste.
       */
      const productCard = page.getByRole('article').filter({
        hasText: productTitle,
      });

      await expect(productCard).toBeVisible({
        timeout: 20_000,
      });

      /*
       * Preço base na LP.
       */
      await expect(productCard).toContainText('R$ 1.200,00');

      /*
       * Adiciona 1 unidade.
       */
      await productCard
        .getByRole('button', {
          name: /adicionar/i,
        })
        .click();

      /*
       * Abre o MiniCart.
       */
      await page
        .getByRole('button', {
          name: /abrir carrinho com 1 item/i,
        })
        .click();

      const miniCart = page.getByRole('dialog');

      await expect(miniCart).toBeVisible();

      /*
       * Quantidade 1.
       */
      await expect(
        miniCart.getByLabel(`Quantidade de ${productTitle}: 1`)
      ).toBeVisible();

      /*
       * Preço unitário inicial.
       */
      await expect(miniCart).toContainText('R$ 1.200,00');

      /*
       * TOTAL = 1 × 1200
       */
      await expect(miniCart).toContainText('R$ 1.200,00');

      /*
       * -------------------------
       * QUANTIDADE 2
       * -------------------------
       */

      await miniCart
        .getByRole('button', {
          name: new RegExp(`aumentar quantidade de ${productTitle}`, 'i'),
        })
        .click();

      await expect(
        miniCart.getByLabel(`Quantidade de ${productTitle}: 2`)
      ).toBeVisible();

      /*
       * Regra:
       * 2 unidades => R$ 1.100
       */
      await expect(miniCart).toContainText('R$ 1.100,00');

      /*
       * Total:
       * 2 × 1100 = 2200
       */
      await expect(miniCart).toContainText('R$ 2.200,00');

      /*
       * -------------------------
       * QUANTIDADE 3
       * -------------------------
       */

      await miniCart
        .getByRole('button', {
          name: new RegExp(`aumentar quantidade de ${productTitle}`, 'i'),
        })
        .click();

      await expect(
        miniCart.getByLabel(`Quantidade de ${productTitle}: 3`)
      ).toBeVisible();

      /*
       * Regra:
       * 3 unidades => R$ 1.050
       */
      await expect(miniCart).toContainText('R$ 1.050,00');

      /*
       * Total:
       * 3 × 1050 = 3150
       */
      await expect(miniCart).toContainText('R$ 3.150,00');

      /*
       * -------------------------
       * QUANTIDADE 4
       * -------------------------
       */

      await miniCart
        .getByRole('button', {
          name: new RegExp(`aumentar quantidade de ${productTitle}`, 'i'),
        })
        .click();

      await expect(
        miniCart.getByLabel(`Quantidade de ${productTitle}: 4`)
      ).toBeVisible();

      /*
       * Regra:
       * 4 unidades => R$ 1.000
       */
      await expect(miniCart).toContainText('R$ 1.000,00');

      /*
       * Total:
       * 4 × 1000 = 4000
       */
      await expect(miniCart).toContainText('R$ 4.000,00');

      /*
       * O footer do MiniCart também
       * deve mostrar o total geral.
       */
      const miniCartFooter = miniCart.locator('footer');

      await expect(miniCartFooter).toContainText('R$ 4.000,00');

      /*
       * Remove o produto do carrinho.
       */
      await miniCart
        .getByRole('button', {
          name: new RegExp(`remover ${productTitle} do carrinho`, 'i'),
        })
        .click();

      /*
       * Carrinho vazio novamente.
       */
      await expect(miniCart.getByText('Seu carrinho está vazio')).toBeVisible();
    } finally {
      /*
       * Limpeza do banco mesmo se alguma
       * expectativa do carrinho falhar.
       */
      if (productCreated) {
        await deleteTestProduct(page, productTitle);
      }
    }
  });
});
