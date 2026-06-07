import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from './use-cart';

function resetStore() {
  useCart.setState({ items: [], buyNowItem: null });
}

describe('useCart', () => {
  beforeEach(resetStore);

  it('starts empty', () => {
    expect(useCart.getState().items).toEqual([]);
    expect(useCart.getState().buyNowItem).toBeNull();
  });

  it('adds a new item', () => {
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0]).toMatchObject({ productId: 'p1', quantity: 1, price: 100 });
  });

  it('increments quantity for an existing item', () => {
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    expect(useCart.getState().items[0].quantity).toBe(2);
  });

  it('removes an item by productId', () => {
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    useCart.getState().removeItem('p1');
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('updates quantity', () => {
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    useCart.getState().updateQuantity('p1', 3);
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it('removes item when quantity <= 0', () => {
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    useCart.getState().updateQuantity('p1', 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('clears the cart', () => {
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    useCart.getState().clearCart();
    expect(useCart.getState().items).toEqual([]);
  });

  it('sets and clears buy-now item', () => {
    useCart.getState().setBuyNowItem({ productId: 'p2', name: 'B', price: 200, imageUrl: null });
    expect(useCart.getState().buyNowItem).toMatchObject({ productId: 'p2', quantity: 1 });
    useCart.getState().clearBuyNowItem();
    expect(useCart.getState().buyNowItem).toBeNull();
  });

  it('computes total correctly', () => {
    useCart.getState().addItem({ productId: 'p1', name: 'A', price: 100, imageUrl: null });
    useCart.getState().updateQuantity('p1', 2);
    useCart.getState().addItem({ productId: 'p2', name: 'B', price: 50, imageUrl: null });
    expect(useCart.getState().getTotal()).toBe(250);
  });

  it('returns total 0 when empty', () => {
    expect(useCart.getState().getTotal()).toBe(0);
  });
});
