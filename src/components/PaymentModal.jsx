import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  QrCode,
  WalletCards,
} from "lucide-react";
import QRCode from "qrcode";
import { formatCurrency, storeConfig } from "../config/store";
import { validateCardAll, detectBrand } from "../utils/cardValidation";
import { buildPixPayload, buildPixQrUrlFromPayload } from "../utils/pix";
import visaSrc from "../assets/brands/visa.svg";
import mcSrc from "../assets/brands/mastercard.svg";
import amexSrc from "../assets/brands/amex.svg";
import discSrc from "../assets/brands/discover.svg";

export default function PaymentModal({
  address,
  setAddress,
  onReturn,
  onConfirm,
  returnFocusRef,
  cart = [],
  total = 0,
  deliveryFee = 0,
  orderTotal = total,
}) {
  const containerRef = useRef(null);
  const [localDigits, setLocalDigits] = useState(() => {
    if (!address.changeFor) return "";
    if (address.changeFor === "Já trocado") return "";
    const d = String(address.changeFor).replace(/\D/g, "");
    return d;
  });
  const [localExactChange, setLocalExactChange] = useState(
    address.changeFor === "Já trocado"
  );
  // card fields (local state to avoid parent re-renders while typing)
  const [cardName, setCardName] = useState(address.card?.cardHolder || "");
  const [cardNumber, setCardNumber] = useState(address.card?.cardNumber || ""); // digits only
  const [cardExpiry, setCardExpiry] = useState(address.card?.cardExpiry || ""); // MM/YY
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState(address.card?.type || ""); // 'Crédito' | 'Débito'
  const [cardErrors, setCardErrors] = useState({});
  const [cardBrand, setCardBrand] = useState(() => detectBrand(cardNumber));
  const [payloadCopied, setPayloadCopied] = useState(false);
  const [pixDataUrl, setPixDataUrl] = useState(null);

  function createPixPayload() {
    return buildPixPayload({
      key: storeConfig.pix.key,
      amount: orderTotal,
      merchantName: storeConfig.pix.merchantName,
      merchantCity: storeConfig.pix.merchantCity,
    });
  }

  // Generate QR locally using qrcode lib; fallback to external service
  useEffect(() => {
    if (address.paymentMethod !== "Pix") return;
    const payload = createPixPayload();
    let active = true;

    QRCode.toDataURL(payload, { margin: 1, width: 300 })
      .then((url) => {
        if (active) setPixDataUrl(url);
      })
      .catch(() => {
        if (active) setPixDataUrl(buildPixQrUrlFromPayload(payload));
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.paymentMethod, orderTotal]);

  useEffect(() => {
    const prevActive = document.activeElement;
    if (containerRef.current) {
      const first = containerRef.current.querySelector("input,button");
      if (first) first.focus();
    }

    function onKey(e) {
      if (e.key === "Escape") onReturn();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef, onReturn]);

  useEffect(() => {
    if (address.changeFor === "Já trocado") {
      setLocalExactChange(true);
      setLocalDigits("");
    } else {
      setLocalExactChange(false);
      const d = address.changeFor
        ? String(address.changeFor).replace(/\D/g, "")
        : "";
      setLocalDigits(d);
    }
  }, [address.changeFor]);

  function formatBRL(digits) {
    const d = String(digits || "").replace(/\D/g, "");
    if (!d) return "R$ 0,00";
    const num = parseInt(d, 10) || 0;
    const cents = String(num % 100).padStart(2, "0");
    const units = Math.floor(num / 100);
    return `R$ ${units.toLocaleString("pt-BR")},${cents}`;
  }

  function formatCardDisplay(digits) {
    if (!digits) return "";
    return String(digits).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiryDisplay(digits) {
    const d = String(digits).replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  }

  function handleConfirm() {
    const changeForValue = localExactChange
      ? "Já trocado"
      : localDigits
      ? formatBRL(localDigits)
      : "";
    // validate before saving
    if (address.paymentMethod === "Cartão") {
      const errs = validateCardAllLocal();
      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        return;
      }
    }

    // build card summary if cartão selected
    const cardSummary =
      address.paymentMethod === "Cartão"
        ? {
            cardHolder: cardName || "",
            cardLast4: cardNumber ? String(cardNumber).slice(-4) : "",
            cardExpiry: cardExpiry || "",
            type: cardType || "",
          }
        : undefined;

    const paymentUpdate = {
      paymentMethod: address.paymentMethod,
      changeFor: changeForValue,
      card: cardSummary,
    };

    // if Pix, build payload and include in address before confirming
    if (address.paymentMethod === "Pix") {
      const payload = createPixPayload();
      const pixUpdate = { ...paymentUpdate, pixPayload: payload };
      setAddress((a) => ({ ...a, ...pixUpdate }));
      onConfirm(payload, pixUpdate);
      return;
    }

    setAddress((a) => ({ ...a, ...paymentUpdate }));
    onConfirm(undefined, paymentUpdate);
  }

  // validation will use shared helpers from utils/cardValidation
  function validateCardAllLocal() {
    return validateCardAll({
      name: cardName,
      number: cardNumber,
      expiry: cardExpiry,
      cvv: cardCvv,
      type: cardType,
    });
  }

  // realtime validation + brand detection
  useEffect(() => {
    const brand = detectBrand(cardNumber);
    setCardBrand(brand);

    // only validate realtime when cartão is selected
    if (address.paymentMethod === "Cartão") {
      const errs = validateCardAllLocal();
      setCardErrors(errs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cardName,
    cardNumber,
    cardExpiry,
    cardCvv,
    cardType,
    address.paymentMethod,
  ]);

  return (
    <section id="payment" aria-label="Forma de pagamento">
      <div
        className="address-background"
        id="payment-modal"
        style={{ display: "flex" }}
      >
        <div
          className="address-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-title"
          ref={containerRef}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <span className="modal-kicker">
                <WalletCards size={16} aria-hidden="true" />
                Finalização segura
              </span>
              <h2 className="address-title" id="payment-title">
                Forma de pagamento
              </h2>
            </div>
          </div>

          <div
            className="payment-summary"
            style={{
              marginTop: 12,
              borderTop: "1px solid #eee",
              paddingTop: 12,
            }}
          >
            <p className="address-label">Resumo do pedido</p>
            <div style={{ maxHeight: 140, overflowY: "auto", marginTop: 8 }}>
              {cart.length === 0 ? (
                <p>Nenhum item no carrinho.</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px solid #fafafa",
                    }}
                  >
                    <div style={{ fontSize: 14 }}>
                      {item.name}{" "}
                      <small style={{ color: "#64748b" }}>
                        x{item.quantity}
                      </small>
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="payment-total-lines">
              <p>Subtotal: {formatCurrency(total)}</p>
              {deliveryFee > 0 && <p>Entrega: {formatCurrency(deliveryFee)}</p>}
              <p className="payment-total-final">
                Total: {formatCurrency(orderTotal)}
              </p>
            </div>
          </div>
          <p className="address-label" style={{ marginTop: 12 }}>
            Escolha uma opção
          </p>
          <div
            className="payment-methods"
            role="radiogroup"
            aria-label="Formas de pagamento"
          >
            {[
              { id: "Dinheiro", label: "Dinheiro", icon: Banknote },
              { id: "Cartão", label: "Cartão", icon: CreditCard },
              { id: "Pix", label: "Pix", icon: QrCode },
            ].map((m) => {
              const selected = address.paymentMethod === m.id;
              const Icon = m.icon;
              return (
                <button
                  type="button"
                  key={m.id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() =>
                    setAddress((a) => ({
                      ...a,
                      paymentMethod: m.id,
                    }))
                  }
                  className={"payment-pill" + (selected ? " selected" : "")}
                  style={{ marginRight: 8 }}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {address.paymentMethod === "Cartão" && (
            <div style={{ marginTop: 12 }}>
              <p className="address-label">Dados do cartão</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  className={
                    "payment-pill" + (cardType === "Crédito" ? " selected" : "")
                  }
                  onClick={() => setCardType("Crédito")}
                >
                  Crédito
                </button>
                <button
                  type="button"
                  className={
                    "payment-pill" + (cardType === "Débito" ? " selected" : "")
                  }
                  onClick={() => setCardType("Débito")}
                >
                  Débito
                </button>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Nome no cartão"
                  className="address-input"
                  value={cardName}
                  aria-label="Nome no cartão"
                  onChange={(e) => setCardName(e.target.value)}
                />
                {cardErrors.cardName && (
                  <p className="warning-text" style={{ color: "#ef4444" }}>
                    {cardErrors.cardName}
                  </p>
                )}
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Número do cartão"
                    className="address-input"
                    value={formatCardDisplay(cardNumber)}
                    aria-label="Número do cartão"
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16);
                      setCardNumber(digits);
                    }}
                    style={{ paddingRight: 44 }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 16,
                      color: "#64748b",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    aria-label={
                      cardBrand
                        ? `Bandeira do cartão: ${cardBrand}`
                        : "Bandeira do cartão desconhecida"
                    }
                  >
                    {cardBrand === "visa" && (
                      <img
                        src={visaSrc}
                        alt="Visa"
                        title="Visa"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "mastercard" && (
                      <img
                        src={mcSrc}
                        alt="MasterCard"
                        title="MasterCard"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "amex" && (
                      <img
                        src={amexSrc}
                        alt="American Express"
                        title="American Express"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "discover" && (
                      <img
                        src={discSrc}
                        alt="Discover"
                        title="Discover"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "unknown" && (
                      <CreditCard size={18} aria-hidden="true" />
                    )}
                  </span>
                </div>
                {cardErrors.cardNumber && (
                  <p className="warning-text" style={{ color: "#ef4444" }}>
                    {cardErrors.cardNumber}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="address-input"
                    value={formatExpiryDisplay(cardExpiry)}
                    aria-label="Validade do cartão"
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setCardExpiry(digits);
                    }}
                  />
                  {cardErrors.cardExpiry && (
                    <p className="warning-text" style={{ color: "#ef4444" }}>
                      {cardErrors.cardExpiry}
                    </p>
                  )}
                  {/* CVV input: max length depends on card brand (Amex=4, others=3) */}
                  {(() => {
                    const cvvMax = cardBrand === "amex" ? 4 : 3;
                    return (
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={
                          cardBrand === "amex" ? "CVV (4)" : "CVV (3)"
                        }
                        className="address-input"
                        value={cardCvv}
                        maxLength={cvvMax}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, cvvMax);
                          setCardCvv(digits);
                        }}
                        aria-label={`CVV, use ${cvvMax} digits`}
                      />
                    );
                  })()}
                  {cardErrors.cardCvv && (
                    <p className="warning-text" style={{ color: "#ef4444" }}>
                      {cardErrors.cardCvv}
                    </p>
                  )}
                </div>
                {cardErrors.cardType && (
                  <p className="warning-text" style={{ color: "#ef4444" }}>
                    {cardErrors.cardType}
                  </p>
                )}
              </div>
            </div>
          )}

          {address.paymentMethod === "Pix" && (
            <div style={{ marginTop: 12 }}>
              <p className="address-label">Pagamento via Pix</p>
              <div className="pix-box" style={{ display: "flex", gap: 12 }}>
                <div>
                  <img
                    src={
                      pixDataUrl ||
                      buildPixQrUrlFromPayload(createPixPayload())
                    }
                    alt="QR code do Pix"
                    width={120}
                    height={120}
                    style={{ borderRadius: 6, border: "1px solid #e2e8f0" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, marginBottom: 6 }}>
                    Pix — Copia & Cola (BR Code)
                  </p>
                  <div style={{ marginTop: 6 }}>
                    <textarea
                      readOnly
                      value={createPixPayload()}
                      style={{
                        width: "100%",
                        minHeight: 92,
                        padding: 8,
                        fontFamily: "monospace",
                      }}
                      aria-label="Payload Pix Copia e Cola"
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        className="already-changed-btn"
                        onClick={() => {
                          const payload = createPixPayload();
                          if (
                            navigator.clipboard &&
                            navigator.clipboard.writeText
                          ) {
                            navigator.clipboard.writeText(payload).then(() => {
                              setPayloadCopied(true);
                              setTimeout(() => setPayloadCopied(false), 1800);
                            });
                          }
                        }}
                      >
                        {payloadCopied ? (
                          <>
                            <CheckCircle2 size={16} aria-hidden="true" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy size={16} aria-hidden="true" />
                            Copiar
                          </>
                        )}
                      </button>
                      <p
                        style={{ color: "#64748b", marginTop: 6, fontSize: 13 }}
                      >
                        Após o pagamento, envie o comprovante pelo WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {address.paymentMethod === "Dinheiro" && (
            <div style={{ marginTop: 12 }}>
              <label className="address-label" htmlFor="change-for">
                Troco para:
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <input
                  id="change-for"
                  className="address-input"
                  placeholder="R$ 0,00"
                  value={
                    localExactChange
                      ? "Já trocado"
                      : localDigits
                      ? formatBRL(localDigits)
                      : ""
                  }
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const trimmed = digits.slice(0, 12);
                    setLocalDigits(trimmed);
                    if (localExactChange) setLocalExactChange(false);
                  }}
                  disabled={localExactChange}
                />
                <button
                  type="button"
                  className={
                    "already-changed-btn" + (localExactChange ? " active" : "")
                  }
                  onClick={() => {
                    setLocalExactChange((s) => !s);
                    if (!localExactChange) setLocalDigits("");
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      textAlign: "center",
                      minWidth: 100,
                    }}
                  >
                    Dinheiro já trocado
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="address-buttons" style={{ marginTop: 18 }}>
            <button id="return-payment-btn" type="button" onClick={onReturn}>
              <ArrowLeft size={17} aria-hidden="true" />
              Voltar
            </button>
            <button
              id="confirm-payment-btn"
              type="button"
              onClick={handleConfirm}
              disabled={
                !address.paymentMethod ||
                (address.paymentMethod === "Cartão" &&
                  Object.keys(validateCardAllLocal()).length > 0)
              }
            >
              <CheckCircle2 size={17} aria-hidden="true" />
              Finalizar pedido
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
