import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";

describe("Header", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fecha o menu mobile antes de abrir o carrinho", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onOpenCart = vi.fn();

    render(<Header storeName="FastDish" onOpenCart={onOpenCart} />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /abrir menu/i }));
    });
    const menu = screen.getByRole("dialog", { name: /menu principal/i });

    await act(async () => {
      await user.click(within(menu).getByRole("button", { name: /carrinho/i }));
    });
    expect(onOpenCart).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onOpenCart).toHaveBeenCalledTimes(1);
    expect(document.querySelector("#mobile-menu")).not.toHaveClass("active");
  });

  it("renderiza nome da loja e quantidade do carrinho", () => {
    render(
      <Header storeName="Minha Loja" cartQuantity={3} onOpenCart={vi.fn()} />
    );

    expect(screen.getByText("Minha Loja")).toBeInTheDocument();
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });
});
