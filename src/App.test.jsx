import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function mockCepSuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            logradouro: "Rua Teste",
            bairro: "Centro",
            localidade: "Fortaleza",
            uf: "CE",
          }),
      })
    )
  );
}

async function addFirstProduct(user) {
  await act(async () => {
    await user.click(
      screen.getByRole("button", {
        name: /adicionar pizza calabresa ao carrinho/i,
      })
    );
  });
}

async function openAddressStep(user) {
  const cartButtons = screen.getAllByRole("button", { name: /carrinho/i });
  await act(async () => {
    await user.click(cartButtons[0]);
  });
  await act(async () => {
    await user.click(await screen.findByRole("button", { name: /confirmar/i }));
  });
}

async function completeAddress(user) {
  await act(async () => {
    await user.type(screen.getByLabelText(/cep/i), "60123456");
    await user.tab();
  });

  await waitFor(() => {
    expect(screen.getByLabelText(/rua/i)).toHaveValue("Rua Teste");
  });

  await act(async () => {
    await user.type(screen.getByLabelText(/número/i), "123");
  });
}

async function openPaymentStep(user) {
  await act(async () => {
    await user.click(screen.getByRole("button", { name: /pagamento/i }));
  });

  await screen.findByRole("dialog", { name: /forma de pagamento/i });
}

describe("Fluxo de compra", () => {
  beforeEach(() => {
    mockCepSuccess();
    vi.spyOn(window, "open").mockImplementation(() => null);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("mantem o usuario no endereco quando os campos obrigatorios estao vazios", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addFirstProduct(user);
    await openAddressStep(user);
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /pagamento/i }));
    });

    expect(screen.getByRole("dialog", { name: /endere/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: /forma de pagamento/i })
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(/campo obrigat/i).length).toBeGreaterThan(0);
  });

  it("finaliza um pedido com endereco valido e abre a mensagem no WhatsApp", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addFirstProduct(user);
    await openAddressStep(user);
    await completeAddress(user);
    await openPaymentStep(user);

    await act(async () => {
      await user.click(screen.getByRole("radio", { name: /dinheiro/i }));
    });
    await act(async () => {
      await user.click(
        screen.getByRole("button", { name: /finalizar pedido/i })
      );
    });

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/5585999062339?text="),
      "_blank"
    );
    expect(
      screen.queryByRole("dialog", { name: /forma de pagamento/i })
    ).not.toBeInTheDocument();
  });
});
