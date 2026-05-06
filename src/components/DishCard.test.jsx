import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import DishCard from "./DishCard";

const item = {
  name: "Pizza Calabresa",
  desc: "Molho artesanal",
  price: 32,
  img: "/pizza.webp",
};

describe("DishCard", () => {
  it("expõe o botão de adicionar com nome acessível e preço formatado", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<DishCard item={item} onAdd={onAdd} />);

    expect(screen.getByText(/R\$\s*32,00/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /adicionar pizza calabresa ao carrinho/i,
      })
    );

    expect(onAdd).toHaveBeenCalledWith(item);
  });

  it("remove clones do carrossel da ordem de tabulação", () => {
    render(<DishCard item={item} onAdd={vi.fn()} interactive={false} />);

    expect(
      screen.getByRole("button", {
        name: /adicionar pizza calabresa ao carrinho/i,
      })
    ).toHaveAttribute("tabindex", "-1");
  });
});
