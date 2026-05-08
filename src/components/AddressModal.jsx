import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, MapPin, WalletCards } from "lucide-react";

export default function AddressModal({
  address,
  setAddress,
  onReturn,
  onCheckout,
  onCepBlur,
  returnFocusRef,
  showErrors,
}) {
  const cepRef = useRef(null);
  const numberRef = useRef(null);
  const [touched, setTouched] = useState({ cep: false, number: false });
  const [focused, setFocused] = useState({ cep: false, number: false });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  function formatCepForDisplay(cepDigits) {
    const d = (cepDigits || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
  }

  // keep previous street to detect when CEP lookup populated the street
  const prevStreet = useRef(address.street);

  useEffect(() => {
    // if previously empty and now filled, and number empty -> focus number
    if (
      (!prevStreet.current || prevStreet.current.trim() === "") &&
      address.street &&
      address.street.trim() !== "" &&
      numberRef.current &&
      !focused.number &&
      (!address.number || address.number.trim() === "")
    ) {
      numberRef.current.focus();
    }
    prevStreet.current = address.street;
  }, [address.street, address.number, focused.number]);

  useEffect(() => {
    const prevActive = document.activeElement;
    if (cepRef.current) cepRef.current.focus();

    return () => {
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef]);

  async function handleCepBlur(cep) {
    // cep argument is digits-only
    setCepLoading(true);
    setCepError("");
    try {
      const res = onCepBlur ? onCepBlur(cep) : null;
      if (res && typeof res.then === "function") await res;
    } catch (err) {
      setCepError(err?.message || "Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  const cepDigits = address.cep.replace(/\D/g, "");
  const showCepWarning =
    (showErrors || touched.cep) && !focused.cep && cepDigits.length !== 8;
  const showNumberWarning =
    (showErrors || touched.number) &&
    !focused.number &&
    address.number.trim() === "";

  return (
    <section id="address" aria-label="Endereço de Entrega">
      <div
        className="address-background"
        id="address-modal"
        style={{ display: "flex" }}
      >
        <div
          className="address-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-title"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <span className="modal-kicker">
                <MapPin size={16} aria-hidden="true" />
                Entrega guiada
              </span>
              <h2 className="address-title" id="address-title">
                Endereço
              </h2>
            </div>
          </div>

          <label className="address-label" htmlFor="input-cep">
            CEP
          </label>
          <input
            type="text"
            id="input-cep"
            className="address-input"
            value={formatCepForDisplay(address.cep)}
            ref={cepRef}
            inputMode="numeric"
            autoComplete="postal-code"
            aria-invalid={showCepWarning}
            aria-describedby="cep-warn"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
              setAddress((a) => ({ ...a, cep: digits }));
            }}
            onFocus={() => setFocused((f) => ({ ...f, cep: true }))}
            onBlur={(e) => {
              setFocused((f) => ({ ...f, cep: false }));
              setTouched((t) => ({ ...t, cep: true }));
              const cep = e.target.value.replace(/\D/g, "");
              if (cep.length === 8) handleCepBlur(cep);
            }}
          />

          <p
            className="warning-text"
            id="cep-warn"
            style={{
              display: showCepWarning ? "block" : "none",
            }}
          >
            {cepDigits.length === 0
              ? "Campo obrigatório!"
              : "CEP deve ter 8 dígitos."}
          </p>

          <p
            className="warning-text"
            style={{ display: cepLoading ? "block" : "none" }}
          >
            Buscando endereço...
          </p>
          <p
            className="warning-text"
            style={{ display: cepError ? "block" : "none" }}
          >
            {cepError}
          </p>

          <label className="address-label" htmlFor="input-street">
            Rua
          </label>
          <input
            type="text"
            id="input-street"
            className="address-input"
            readOnly
            value={address.street}
          />

          <label className="address-label" htmlFor="input-number">
            Número
          </label>
          <input
            type="text"
            id="input-number"
            className="address-input"
            ref={numberRef}
            value={address.number}
            autoComplete="address-line2"
            aria-invalid={showNumberWarning}
            aria-describedby="number-warn"
            onChange={(e) =>
              setAddress((a) => ({ ...a, number: e.target.value }))
            }
            onFocus={() => setFocused((f) => ({ ...f, number: true }))}
            onBlur={() => {
              setFocused((f) => ({ ...f, number: false }));
              setTouched((t) => ({ ...t, number: true }));
            }}
          />
          <p
            className="warning-text"
            id="number-warn"
            style={{
              display: showNumberWarning ? "block" : "none",
            }}
          >
            Campo obrigatório!
          </p>

          <label className="address-label" htmlFor="input-complement">
            Complemento
          </label>
          <input
            type="text"
            id="input-complement"
            className="address-input"
            autoComplete="address-line3"
            value={address.complement}
            onChange={(e) =>
              setAddress((a) => ({ ...a, complement: e.target.value }))
            }
          />

          <label className="address-label" htmlFor="input-notes">
            Observações do pedido
          </label>
          <textarea
            id="input-notes"
            className="address-input"
            rows={3}
            placeholder="Ex.: sem cebola, interfone quebrado"
            value={address.notes || ""}
            onChange={(e) =>
              setAddress((a) => ({ ...a, notes: e.target.value }))
            }
          />

          <label className="address-label" htmlFor="input-neighborhood">
            Bairro
          </label>
          <input
            type="text"
            id="input-neighborhood"
            className="address-input"
            readOnly
            value={address.neighborhood}
          />

          <label className="address-label" htmlFor="input-city">
            Cidade
          </label>
          <input
            type="text"
            id="input-city"
            className="address-input"
            readOnly
            value={address.city}
          />

          <label className="address-label" htmlFor="input-state">
            Estado
          </label>
          <input
            type="text"
            id="input-state"
            className="address-input"
            readOnly
            value={address.state}
          />

          <div className="address-buttons">
            <button id="return-address-btn" type="button" onClick={onReturn}>
              <ArrowLeft size={17} aria-hidden="true" />
              Voltar
            </button>
            <button
              id="checkout-btn"
              type="button"
              onClick={onCheckout}
              disabled={cepLoading}
            >
              <WalletCards size={17} aria-hidden="true" />
              {cepLoading ? "Aguardando CEP..." : "Pagamento"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
