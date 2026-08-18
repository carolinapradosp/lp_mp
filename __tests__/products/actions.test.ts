import { del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

import {
  deleteProduct,
  toggleProductStatus,
  type DeleteProductState,
} from '@/app/admin/(protected)/products/actions';

import { verifyAdminSession } from '@/lib/auth/admin-session';
import { sql } from '@/lib/database/neon';

jest.mock('@/lib/auth/admin-session', () => ({
  verifyAdminSession: jest.fn(),
}));

jest.mock('@/lib/database/neon', () => ({
  sql: jest.fn(),
}));

jest.mock('@vercel/blob', () => ({
  del: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockedVerifyAdminSession = verifyAdminSession as jest.MockedFunction<
  typeof verifyAdminSession
>;

const mockedSql = sql as unknown as jest.Mock;

const mockedDel = del as jest.MockedFunction<typeof del>;

const mockedRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

const initialDeleteState: DeleteProductState = {
  success: false,
  message: '',
};

function createDeleteFormData(productId = 'product-1'): FormData {
  const formData = new FormData();

  formData.set('product_id', productId);

  return formData;
}

function createStatusFormData({
  productId = 'product-1',
  active,
}: {
  productId?: string;
  active: boolean;
}): FormData {
  const formData = new FormData();

  formData.set('product_id', productId);

  formData.set('current_status', String(active));

  return formData;
}

describe('deleteProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedVerifyAdminSession.mockResolvedValue(true);
  });

  it('não deve excluir um produto que possui pedidos vinculados', async () => {
    const productId = 'product-with-orders';

    mockedSql
      .mockResolvedValueOnce([
        {
          id: productId,
          image_url:
            'https://example.public.blob.vercel-storage.com/products/product.jpg',
        },
      ])
      .mockResolvedValueOnce([
        {
          has_orders: true,
        },
      ]);

    const result = await deleteProduct(
      initialDeleteState,
      createDeleteFormData(productId)
    );

    expect(result).toEqual({
      success: false,
      message:
        'Este produto já possui pedidos vinculados e não pode ser excluído. Desative o produto para removê-lo da loja.',
    });

    /*
     * SELECT do produto +
     * SELECT para verificar pedidos.
     *
     * Nenhum DELETE deve acontecer.
     */
    expect(mockedSql).toHaveBeenCalledTimes(2);

    expect(mockedDel).not.toHaveBeenCalled();

    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it('deve excluir um produto sem pedidos vinculados', async () => {
    const productId = 'product-without-orders';

    const imageUrl =
      'https://example.public.blob.vercel-storage.com/products/product.jpg';

    mockedSql
      // Busca produto
      .mockResolvedValueOnce([
        {
          id: productId,
          image_url: imageUrl,
        },
      ])

      // Verifica pedidos
      .mockResolvedValueOnce([
        {
          has_orders: false,
        },
      ])

      // DELETE pricing rules
      .mockResolvedValueOnce([])

      // DELETE product
      .mockResolvedValueOnce([]);

    mockedDel.mockResolvedValueOnce(undefined);

    const result = await deleteProduct(
      initialDeleteState,
      createDeleteFormData(productId)
    );

    expect(result).toEqual({
      success: true,
      message: 'Produto excluído com sucesso.',
    });

    /*
     * 1 - busca produto
     * 2 - verifica pedidos
     * 3 - remove pricing rules
     * 4 - remove produto
     */
    expect(mockedSql).toHaveBeenCalledTimes(4);

    expect(mockedDel).toHaveBeenCalledTimes(1);

    expect(mockedDel).toHaveBeenCalledWith(imageUrl);

    expect(mockedRevalidatePath).toHaveBeenCalledWith('/');

    expect(mockedRevalidatePath).toHaveBeenCalledWith('/admin/products');
  });

  it('deve excluir o produto mesmo quando ele não possui imagem', async () => {
    const productId = 'product-without-image';

    mockedSql
      .mockResolvedValueOnce([
        {
          id: productId,
          image_url: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          has_orders: false,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await deleteProduct(
      initialDeleteState,
      createDeleteFormData(productId)
    );

    expect(result.success).toBe(true);

    expect(mockedSql).toHaveBeenCalledTimes(4);

    expect(mockedDel).not.toHaveBeenCalled();
  });

  it('não deve tentar excluir uma imagem externa ao Vercel Blob', async () => {
    const productId = 'external-image';

    mockedSql
      .mockResolvedValueOnce([
        {
          id: productId,
          image_url: 'https://images.example.com/product.jpg',
        },
      ])
      .mockResolvedValueOnce([
        {
          has_orders: false,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await deleteProduct(
      initialDeleteState,
      createDeleteFormData(productId)
    );

    expect(result.success).toBe(true);

    expect(mockedDel).not.toHaveBeenCalled();
  });
});

describe('toggleProductStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedVerifyAdminSession.mockResolvedValue(true);

    mockedSql.mockResolvedValue([]);
  });

  it('deve desativar um produto ativo', async () => {
    const productId = 'product-1';

    const formData = createStatusFormData({
      productId,
      active: true,
    });

    await toggleProductStatus(formData);

    expect(mockedSql).toHaveBeenCalledTimes(1);

    /*
     * A chamada do tagged template contém:
     *
     * ${!currentStatus}
     * ${productId}
     *
     * Portanto:
     * true -> false
     */
    expect(mockedSql.mock.calls[0][1]).toBe(false);

    expect(mockedSql.mock.calls[0][2]).toBe(productId);

    expect(mockedRevalidatePath).toHaveBeenCalledWith('/');

    expect(mockedRevalidatePath).toHaveBeenCalledWith('/admin/products');
  });

  it('deve ativar um produto inativo', async () => {
    const productId = 'product-2';

    const formData = createStatusFormData({
      productId,
      active: false,
    });

    await toggleProductStatus(formData);

    expect(mockedSql).toHaveBeenCalledTimes(1);

    /*
     * false -> true
     */
    expect(mockedSql.mock.calls[0][1]).toBe(true);

    expect(mockedSql.mock.calls[0][2]).toBe(productId);
  });
});
