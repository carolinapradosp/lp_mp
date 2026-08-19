import type { Product } from '@/interfaces/Product';

import { useCartStore } from '@/store/cartStore';

const product: Product = {
  id: 'product-1',
  title: 'Produto teste',
  description: 'Produto usado nos testes',
  base_price: 1199,
  image_url: '/product.jpg',
  stock: 10,
  pricing_rules: [
    {
      min_quantity: 2,
      unit_price: 1119,
    },
    {
      min_quantity: 3,
      unit_price: 1099,
    },
    {
      min_quantity: 4,
      unit_price: 1059,
    },
  ],
};

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear();

    useCartStore.setState({
      products: [],
      hydrated: false,
    });
  });

  it('deve iniciar com o carrinho vazio', () => {
    const state = useCartStore.getState();

    expect(state.products).toEqual([]);
  });

  it('deve adicionar um produto ao carrinho', () => {
    useCartStore.getState().addToCart(product);

    const state = useCartStore.getState();

    expect(state.products).toHaveLength(1);

    expect(state.products[0]).toMatchObject({
      id: product.id,
      title: product.title,
      quantity: 1,
      price: 1199,
    });
  });

  it('deve aumentar a quantidade ao adicionar o mesmo produto novamente', () => {
    const store = useCartStore.getState();

    store.addToCart(product);
    store.addToCart(product);

    const state = useCartStore.getState();

    expect(state.products).toHaveLength(1);

    expect(state.products[0].quantity).toBe(2);
  });

  it('deve aplicar o preço progressivo ao adicionar a segunda unidade', () => {
    const store = useCartStore.getState();

    store.addToCart(product);
    store.addToCart(product);

    const state = useCartStore.getState();

    expect(state.products[0].quantity).toBe(2);
    expect(state.products[0].price).toBe(1119);
  });

  it('deve recalcular o preço conforme a quantidade aumenta', () => {
    const store = useCartStore.getState();

    store.addToCart(product);

    store.increase(product.id);
    store.increase(product.id);

    const state = useCartStore.getState();

    expect(state.products[0].quantity).toBe(3);
    expect(state.products[0].price).toBe(1099);
  });

  it('deve usar a última regra de preço quando a quantidade ultrapassa a maior faixa', () => {
    const store = useCartStore.getState();

    store.addToCart(product);

    store.increase(product.id);
    store.increase(product.id);
    store.increase(product.id);
    store.increase(product.id);

    const state = useCartStore.getState();

    expect(state.products[0].quantity).toBe(5);
    expect(state.products[0].price).toBe(1059);
  });

  it('não deve permitir quantidade maior que o estoque', () => {
    const limitedProduct: Product = {
      ...product,
      stock: 2,
    };

    const store = useCartStore.getState();

    store.addToCart(limitedProduct);
    store.increase(limitedProduct.id);
    store.increase(limitedProduct.id);

    const state = useCartStore.getState();

    expect(state.products[0].quantity).toBe(2);
  });

  it('não deve adicionar produto sem estoque', () => {
    const unavailableProduct: Product = {
      ...product,
      stock: 0,
    };

    useCartStore.getState().addToCart(unavailableProduct);

    const state = useCartStore.getState();

    expect(state.products).toHaveLength(0);
  });

  it('deve diminuir a quantidade do produto', () => {
    const store = useCartStore.getState();

    store.addToCart(product);
    store.increase(product.id);

    store.decrease(product.id);

    const state = useCartStore.getState();

    expect(state.products[0].quantity).toBe(1);
    expect(state.products[0].price).toBe(1199);
  });

  it('deve remover o produto quando diminuir a quantidade de 1', () => {
    const store = useCartStore.getState();

    store.addToCart(product);

    store.decrease(product.id);

    const state = useCartStore.getState();

    expect(state.products).toHaveLength(0);
  });

  it('deve remover um produto diretamente do carrinho', () => {
    const store = useCartStore.getState();

    store.addToCart(product);

    store.remove(product.id);

    const state = useCartStore.getState();

    expect(state.products).toHaveLength(0);
  });

  it('deve limpar todo o carrinho', () => {
    const secondProduct: Product = {
      ...product,
      id: 'product-2',
      title: 'Produto 2',
    };

    const store = useCartStore.getState();

    store.addToCart(product);
    store.addToCart(secondProduct);

    expect(useCartStore.getState().products).toHaveLength(2);

    store.clear();

    expect(useCartStore.getState().products).toHaveLength(0);
  });
});

describe('syncProducts', () => {
  beforeEach(() => {
    localStorage.clear();

    useCartStore.setState({
      products: [],
      hydrated: false,
    });
  });

  it('deve atualizar os dados do produto com informações novas do banco', () => {
    useCartStore.getState().addToCart(product);

    const updatedProduct: Product = {
      ...product,
      title: 'Produto atualizado',
      base_price: 1299,
      stock: 20,
    };

    useCartStore.getState().syncProducts([updatedProduct]);

    const cartItem = useCartStore.getState().products[0];

    expect(cartItem.title).toBe('Produto atualizado');

    expect(cartItem.base_price).toBe(1299);
    expect(cartItem.stock).toBe(20);
  });

  it('deve remover do carrinho um produto que não existe mais', () => {
    useCartStore.getState().addToCart(product);

    useCartStore.getState().syncProducts([]);

    expect(useCartStore.getState().products).toHaveLength(0);
  });

  it('deve reduzir a quantidade se o novo estoque for menor que a quantidade no carrinho', () => {
    const store = useCartStore.getState();

    store.addToCart(product);
    store.increase(product.id);
    store.increase(product.id);
    store.increase(product.id);

    expect(useCartStore.getState().products[0].quantity).toBe(4);

    const updatedProduct: Product = {
      ...product,
      stock: 2,
    };

    useCartStore.getState().syncProducts([updatedProduct]);

    const cartItem = useCartStore.getState().products[0];

    expect(cartItem.quantity).toBe(2);
    expect(cartItem.price).toBe(1119);
  });

  it('deve remover o produto se o estoque atualizado for zero', () => {
    useCartStore.getState().addToCart(product);

    const updatedProduct: Product = {
      ...product,
      stock: 0,
    };

    useCartStore.getState().syncProducts([updatedProduct]);

    expect(useCartStore.getState().products).toHaveLength(0);
  });

  it('deve recalcular o preço quando as regras forem atualizadas', () => {
    const store = useCartStore.getState();

    store.addToCart(product);
    store.increase(product.id);

    expect(useCartStore.getState().products[0].price).toBe(1119);

    const updatedProduct: Product = {
      ...product,

      pricing_rules: [
        {
          min_quantity: 2,
          unit_price: 999,
        },
      ],
    };

    useCartStore.getState().syncProducts([updatedProduct]);

    expect(useCartStore.getState().products[0].price).toBe(999);
  });
});
