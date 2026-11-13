// Only the fields the API test asserts on. A type is compile-time only:
// runtime behavior is verified by the assertions in the test.
export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
}

// Public DummyJSON product used as the scenario input.
export const productId = 1;
