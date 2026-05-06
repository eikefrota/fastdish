import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import PaymentModal from "./PaymentModal";

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve("data:image/png;base64,qr")),
  },
}));

const cart = [{ name: "Pizza Calabresa", price: 32, quantity: 1 }];

function renderPayment(props = {}) {
  const setAddress = vi.fn();
  const onConfirm = vi.fn();
  const result = render(
    <PaymentModal
      address={{ paymentMethod: "", changeFor: "", ...props.address }}
      setAddress={setAddress}
      onReturn={vi.fn()}
      onConfirm={onConfirm}
      cart={cart}
      total={32}
      orderTotal={32}
      {...props}
    />
  );

  return { ...result, setAddress, onConfirm };
}

describe("PaymentModal", () => {
  it("envia payload Pix e atualização de pagamento ao confirmar", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderPayment({
      address: { paymentMethod: "Pix", changeFor: "" },
    });

    await waitFor(() => {
      expect(screen.getByAltText(/qr code do pix/i)).toHaveAttribute(
        "src",
        "data:image/png;base64,qr"
      );
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /finalizar pedido/i }));
    });

    expect(onConfirm).toHaveBeenCalledWith(
      expect.stringContaining("BR.GOV.BCB.PIX"),
      expect.objectContaining({
        paymentMethod: "Pix",
        pixPayload: expect.stringContaining("BR.GOV.BCB.PIX"),
      })
    );
  });

  it("valida cartão antes de finalizar", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderPayment({
      address: { paymentMethod: "Cartão", changeFor: "" },
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /crédito/i }));
      await user.type(screen.getByLabelText(/nome no cartão/i), "Cliente Teste");
      await user.type(
        screen.getByLabelText(/número do cartão/i),
        "4242424242424242"
      );
      await user.type(screen.getByLabelText(/validade do cartão/i), "1299");
      await user.type(screen.getByLabelText(/cvv/i), "123");
    });

    const confirmButton = screen.getByRole("button", {
      name: /finalizar pedido/i,
    });
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
    await act(async () => {
      await user.click(confirmButton);
    });

    expect(onConfirm).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        paymentMethod: "Cartão",
        card: expect.objectContaining({
          cardLast4: "4242",
          type: "Crédito",
        }),
      })
    );
  });
});
