import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import CartModal from "./CartModal";

const cart = [{ name: "Pizza Calabresa", price: 32, quantity: 2 }];

function renderCart(props = {}) {
  return render(
    <CartModal
      cart={cart}
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      onRemove={vi.fn()}
      onAdd={vi.fn()}
      removeAll={vi.fn()}
      {...props}
    />
  );
}

describe("CartModal", () => {
  it("mostra subtotal, entrega e total final", () => {
    renderCart({ deliveryFee: 5, orderTotal: 69 });

    expect(screen.getByText(/subtotal: r\$/i)).toHaveTextContent(/R\$\s*64,00/);
    expect(screen.getByText(/entrega: r\$/i)).toHaveTextContent(/R\$\s*5,00/);
    expect(document.querySelector("#cart-total")).toHaveTextContent(
      /R\$\s*69,00/
    );
  });

  it("bloqueia confirmação abaixo do pedido mínimo", () => {
    renderCart({ minimumOrder: 100 });

    expect(screen.getByText(/pedido minimo/i)).toHaveTextContent(
      /R\$\s*100,00/
    );
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
  });
});
