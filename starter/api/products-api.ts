import type { APIRequestContext, APIResponse } from '@playwright/test';

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  // Returns the raw response: the test owns what must be true about it.
  async getProduct(id: number): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }
}
