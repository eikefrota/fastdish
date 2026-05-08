import React from "react";
import { Plus, Sparkles } from "lucide-react";

export default function DishCard({ item, onAdd, interactive = true }) {
  const placeholder =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%" height="100%" fill="%23111111"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23f3f3f3" font-size="14">Imagem indisponível</text></svg>';
  const price = item.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <article className="dish">
      <div className="dish-topline">
        <span>
          <Sparkles size={13} aria-hidden="true" />
          Popular
        </span>
      </div>
      <div className="dish-image-wrap">
        <img
          src={item.img}
          className="dish-image"
          alt={item.name}
          loading="lazy"
          draggable="false"
          onError={(e) => {
            if (e && e.currentTarget) e.currentTarget.src = placeholder;
          }}
        />
      </div>
      <div className="dish-content">
        <h3 className="dish-title">{item.name}</h3>
        <span className="dish-description">{item.desc}</span>
      </div>
      <div className="dish-price">
        <div>
          <span>A partir de</span>
          <h4>{price}</h4>
        </div>
        <button
          type="button"
          className="btn-dish"
          onClick={() => onAdd(item)}
          aria-label={`Adicionar ${item.name} ao carrinho`}
          tabIndex={interactive ? 0 : -1}
        >
          <Plus size={19} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
