import React, { useEffect, useRef } from "react";
import { formatCurrency } from "../config/store";

export default function CartModal({
  cart,
  onClose,
  onConfirm,
  onRemove,
  onAdd,
  removeAll,
  returnFocusRef,
  deliveryFee = 0,
  orderTotal,
  minimumOrder = 0,
}) {
  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const finalTotal = orderTotal ?? total + deliveryFee;
  const belowMinimum = minimumOrder > 0 && total < minimumOrder;
  const firstButtonRef = useRef(null);

  useEffect(() => {
    const prevActive = document.activeElement;
    // focus first actionable button inside modal
    if (firstButtonRef.current) firstButtonRef.current.focus();

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef, onClose]);

  return (
    <section id="cart" aria-label="Carrinho de Compras">
      <div
        className="cart-background"
        id="cart-modal"
        style={{ display: "flex" }}
      >
        <div
          className="cart-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
        >
          <h2 className="cart-title" id="cart-title">
            CARRINHO
          </h2>

          <div id="cart-items">
            {cart.length === 0 ? (
              <p aria-live="polite">Seu carrinho está vazio.</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.name}>
                  <div className="cart-item-details">
                    <p className="font-bold">
                      {item.name}{" "}
                      <span className="cart-item-quantity">
                        x{item.quantity}
                      </span>
                    </p>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <div className="cart-item-controls">
                      <button
                        type="button"
                        aria-label={`Remover uma unidade de ${item.name}`}
                        onClick={() => onRemove(item.name)}
                      >
                        -
                      </button>
                      <span aria-hidden="true">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Adicionar unidade de ${item.name}`}
                        onClick={() => onAdd && onAdd(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeAll && removeAll(item.name)}
                    >
                      Remover tudo
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-total" aria-live="polite">
            <p>Subtotal: {formatCurrency(total)}</p>
            {deliveryFee > 0 && <p>Entrega: {formatCurrency(deliveryFee)}</p>}
            <p>
              Total: <span id="cart-total">{formatCurrency(finalTotal)}</span>
            </p>
          </div>
          {belowMinimum && (
            <p className="cart-minimum-warning">
              Pedido minimo: {formatCurrency(minimumOrder)}
            </p>
          )}

          <div className="cart-buttons">
            <button
              id="close-cart-btn"
              type="button"
              onClick={onClose}
              ref={firstButtonRef}
            >
              Fechar
            </button>
            <button
              id="confirm-cart-btn"
              type="button"
              onClick={onConfirm}
              disabled={cart.length === 0 || belowMinimum}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
