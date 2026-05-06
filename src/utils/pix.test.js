import { describe, expect, it } from "vitest";
import { buildPixPayload, buildPixQrUrlFromPayload, crc16 } from "./pix";

describe("Pix helpers", () => {
  it("gera payload Pix com chave, valor e CRC", () => {
    const payload = buildPixPayload({
      key: "85999062338",
      amount: 32,
      merchantName: "FastDish",
      merchantCity: "FORTALEZA",
    });

    expect(payload).toContain("BR.GOV.BCB.PIX");
    expect(payload).toContain("85999062338");
    expect(payload).toContain("540532.00");
    expect(payload).toMatch(/6304[A-F0-9]{4}$/);
  });

  it("gera URL de QR code externa quando necessario", () => {
    const url = buildPixQrUrlFromPayload("payload teste");

    expect(url).toContain("api.qrserver.com");
    expect(url).toContain("payload%20teste");
  });

  it("calcula CRC16 de forma deterministica", () => {
    expect(crc16("ABC")).toBe(crc16("ABC"));
    expect(crc16("ABC")).not.toBe(crc16("ABD"));
  });
});
