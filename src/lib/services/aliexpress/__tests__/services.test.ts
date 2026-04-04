import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiCall for all service tests
const mockApiCall = vi.fn().mockResolvedValue({ result: "ok" });
vi.mock("../client", () => ({
  apiCall: (...args: unknown[]) => mockApiCall(...args),
}));

import { getCategories, getProduct } from "../products";
import { queryShipping } from "../shipping";
import { createOrder, getOrder, getTracking } from "../orders";

describe("products", () => {
  beforeEach(() => mockApiCall.mockClear());

  it("getCategories calls correct method with auth", async () => {
    await getCategories();
    expect(mockApiCall).toHaveBeenCalledWith(
      "aliexpress.ds.category.get",
      {},
      true
    );
  });

  it("getProduct sends product_id and defaults", async () => {
    await getProduct("1005007426085378");
    expect(mockApiCall).toHaveBeenCalledWith(
      "aliexpress.ds.product.get",
      {
        product_id: "1005007426085378",
        ship_to_country: "US",
        target_currency: "USD",
        target_language: "en",
      },
      true
    );
  });

  it("getProduct accepts custom country/currency/lang", async () => {
    await getProduct("123", "MX", "MXN", "es");
    expect(mockApiCall).toHaveBeenCalledWith(
      "aliexpress.ds.product.get",
      expect.objectContaining({
        ship_to_country: "MX",
        target_currency: "MXN",
        target_language: "es",
      }),
      true
    );
  });
});

describe("shipping", () => {
  beforeEach(() => mockApiCall.mockClear());

  it("queryShipping sends camelCase queryDeliveryReq JSON", async () => {
    await queryShipping("123", "sku-456", "US", 2, "15.00", "USD");

    const [method, params, auth] = mockApiCall.mock.calls[0];
    expect(method).toBe("aliexpress.ds.freight.query");
    expect(auth).toBe(true);

    const req = JSON.parse(params.queryDeliveryReq);
    expect(req.productId).toBe(123);
    expect(req.selectedSkuId).toBe("sku-456");
    expect(req.shipToCountry).toBe("US");
    expect(req.quantity).toBe(2);
    expect(req.sendGoodsCountryCode).toBe("CN");

    // Top-level duplicates
    expect(params.currency).toBe("USD");
    expect(params.locale).toBe("en_US");
    expect(params.language).toBe("en");
  });
});

describe("orders", () => {
  beforeEach(() => mockApiCall.mockClear());

  const address = {
    full_name: "John Doe",
    phone_country: "+1",
    mobile_no: "5551234567",
    address: "123 Main St",
    city: "New York",
    province: "NY",
    country: "US",
    zip: "10001",
  };

  it("createOrder sends logistics_address and product_items as JSON", async () => {
    await createOrder("123", "color:Red", 1, "AliExpress Standard", address);

    const [method, params] = mockApiCall.mock.calls[0];
    expect(method).toBe("aliexpress.ds.order.create");

    const addr = JSON.parse(params.logistics_address);
    expect(addr.full_name).toBe("John Doe");
    expect(addr.country).toBe("US");

    const items = JSON.parse(params.product_items);
    expect(items).toHaveLength(1);
    expect(items[0].product_id).toBe(123);
    expect(items[0].sku_attr).toBe("color:Red");
    expect(items[0].logistics_service_name).toBe("AliExpress Standard");
  });

  it("getOrder calls correct method", async () => {
    await getOrder("900123");
    expect(mockApiCall).toHaveBeenCalledWith(
      "aliexpress.ds.trade.order.get",
      { order_id: "900123" },
      true
    );
  });

  it("getTracking calls correct method", async () => {
    await getTracking("900123");
    expect(mockApiCall).toHaveBeenCalledWith(
      "aliexpress.ds.trade.order.get",
      { order_id: "900123" },
      true
    );
  });
});
