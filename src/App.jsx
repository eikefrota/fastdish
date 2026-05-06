import React, { useState } from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import CartModal from "./components/CartModal";
import AddressModal from "./components/AddressModal";
import PaymentModal from "./components/PaymentModal";
import useCart from "./hooks/useCart";
import {
  buildWhatsAppUrl,
  formatCurrency,
  getOrderTotals,
  storeConfig,
} from "./config/store";
import { dishesData, heroImage } from "./data/dishes";
import { fetchAddressByCep } from "./utils/viacep";

import "./styles/style.css";

function App() {
  const { cart, add, remove, removeAll, clear, total, totalQuantity } =
    useCart();
  const [cartBump, setCartBump] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [addressVisible, setAddressVisible] = useState(false);
  const [showAddressErrors, setShowAddressErrors] = useState(false);
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    paymentMethod: "",
    changeFor: "",
    notes: "",
  });
  const { deliveryFee, orderTotal } = getOrderTotals(total);

  function showToast(text, success = true) {
    const globalToast =
      typeof window !== "undefined" && window.Toastify ? window.Toastify : null;
    if (globalToast) {
      globalToast({
        text,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        style: { background: success ? "green" : "#EF4444" },
      }).showToast();
    } else {
      // non-blocking fallback
      if (success) console.log(text);
      else console.warn(text);
    }
  }
  // persistence moved to useCart

  function addToCart(item) {
    add(item);
    showToast("Produto adicionado com sucesso!", true);
    setCartBump(true);
  }
  function removeFromCart(name) {
    remove(name);
  }

  const cartButtonRef = React.useRef(null);
  function openCart() {
    setCartVisible(true);
  }
  function closeCart() {
    setCartVisible(false);
  }

  function confirmCart() {
    if (cart.length === 0) {
      showToast("Carrinho vazio!", false);
      return;
    }
    if (
      storeConfig.order.minimumOrder > 0 &&
      total < storeConfig.order.minimumOrder
    ) {
      showToast(
        `Pedido minimo de ${formatCurrency(storeConfig.order.minimumOrder)}.`,
        false
      );
      return;
    }
    setCartVisible(false);
    setShowAddressErrors(false);
    setAddressVisible(true);
  }

  function returnAddress() {
    setAddressVisible(false);
    setCartVisible(true);
  }

  function openAddressFromPayment() {
    setPaymentVisible(false);
    setAddressVisible(true);
  }

  function returnPayment() {
    setPaymentVisible(false);
    setCartVisible(true);
  }

  function openPaymentFromAddress() {
    if (!validateAddress()) {
      setShowAddressErrors(true);
      showToast("Preencha o CEP e o numero antes de continuar.", false);
      return;
    }

    setShowAddressErrors(false);
    setAddressVisible(false);
    setPaymentVisible(true);
  }

  // Accept cep as parameter to avoid race conditions when input changes
  function handleCepBlur(cepParam) {
    const cep = (cepParam || address.cep || "").replace(/\D/g, "");
    if (cep.length !== 8) return Promise.resolve();
    return fetchAddressByCep(cep)
      .then((data) => setAddress((a) => ({ ...a, ...data })))
      .catch((err) => {
        showToast(err.message, false);
        throw err;
      });
  }

  function validateAddress(targetAddress = address) {
    let valid = true;
    if (targetAddress.cep.replace(/\D/g, "").length !== 8) valid = false;
    if (targetAddress.number.trim() === "") valid = false;
    return valid;
  }

  function checkout(pixPayload, paymentUpdate = {}) {
    const orderAddress = { ...address, ...paymentUpdate };

    if (!validateAddress(orderAddress)) {
      setShowAddressErrors(true);
      setPaymentVisible(false);
      setAddressVisible(true);
      showToast("Preencha o CEP e o numero antes de finalizar.", false);
      return;
    }
    const now = new Date();
    const datetime = now.toLocaleString("pt-BR");
    const orderId = `#${String(now.getTime()).slice(-6)}`;

    const cartLines = cart
      .map((item, idx) => {
        const unit = formatCurrency(item.price);
        const lineTotal = formatCurrency(item.price * item.quantity);
        return `${idx + 1}. ${item.name} - ${
          item.quantity
        } x ${unit} = ${lineTotal}`;
      })
      .join("\n");

    const subtotalMsg = formatCurrency(total);
    const deliveryLine =
      deliveryFee > 0 ? `\n*Entrega:* ${formatCurrency(deliveryFee)}` : "";
    const totalMsg = formatCurrency(orderTotal);

    const addressLines = `${orderAddress.street}, ${orderAddress.number}${
      orderAddress.complement ? ` - ${orderAddress.complement}` : ""
    }\n${orderAddress.neighborhood} - ${orderAddress.city}-${
      orderAddress.state
    }\nCEP: ${orderAddress.cep}`;

    const paymentInfo = orderAddress.paymentMethod
      ? `*Pagamento:* ${orderAddress.paymentMethod}${
          orderAddress.paymentMethod === "Dinheiro" && orderAddress.changeFor
            ? ` - Troco para: ${orderAddress.changeFor}`
            : orderAddress.paymentMethod === "Pix" && pixPayload
            ? ` - Pix Copia e Cola: ${pixPayload}`
            : (orderAddress.paymentMethod === "Cartao" ||
                orderAddress.paymentMethod === "Cartão") &&
              orderAddress.card
            ? ` - ${orderAddress.card.type} final ${orderAddress.card.cardLast4}`
            : ""
        }`
      : "*Pagamento:* Nao especificado";

    const plainMessage = `*Novo pedido - ${storeConfig.name}* ${orderId}
${datetime}

*Itens:*
${cartLines}

*Subtotal:* ${subtotalMsg}${deliveryLine}
*Total:* ${totalMsg}

*Entrega:*
${addressLines}

${paymentInfo}

${orderAddress.notes ? `*Observacoes:* ${orderAddress.notes}\n` : ""}

Obrigado!
`;

    window.open(buildWhatsAppUrl(plainMessage), "_blank");
    clear();
    setAddressVisible(false);
    setPaymentVisible(false);
    setShowAddressErrors(false);
  }

  return (
    <div>
      <Header
        storeName={storeConfig.name}
        onOpenCart={openCart}
        cartButtonRef={cartButtonRef}
        cartQuantity={totalQuantity}
        cartBump={cartBump}
        onCartBumpEnd={() => setCartBump(false)}
      />

      <main id="content">
        <section id="home">
          <div id="cta">
            <h1 className="title">
              ENCONTRE O <span>MELHOR</span> SABOR PARA VOCÊ
            </h1>
            <p className="description">
              Da pizza ao hambúguer, temos a comida perfeita para você. Somos o
              melhor da cidade!
            </p>

            <div id="cta-area">
              <a id="cta-btn" href="#menu">
                Ver cardápio
              </a>
            </div>
          </div>

          <div id="banner">
            <div className="banner-image-container">
              <img src={heroImage} alt="Pizza Calabresa" />
            </div>
          </div>
        </section>

        <Menu groups={dishesData} onAdd={addToCart} />

        {cartVisible && (
          <CartModal
            cart={cart}
            onClose={closeCart}
            onConfirm={confirmCart}
            onRemove={removeFromCart}
            onAdd={add}
            removeAll={removeAll}
            returnFocusRef={cartButtonRef}
            deliveryFee={deliveryFee}
            orderTotal={orderTotal}
            minimumOrder={storeConfig.order.minimumOrder}
          />
        )}
        {paymentVisible && (
          <PaymentModal
            address={address}
            setAddress={setAddress}
            onReturn={openAddressFromPayment}
            onConfirm={checkout}
            returnFocusRef={cartButtonRef}
            cart={cart}
            total={total}
            deliveryFee={deliveryFee}
            orderTotal={orderTotal}
          />
        )}
        {addressVisible && (
          <AddressModal
            address={address}
            setAddress={setAddress}
            onReturn={returnAddress}
            onCheckout={openPaymentFromAddress}
            onCepBlur={handleCepBlur}
            returnFocusRef={cartButtonRef}
            showErrors={showAddressErrors}
          />
        )}
      </main>

      <footer>
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a
                href="#home"
                id="footer-logo"
                className="footer-logo-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <i className="fa-solid fa-burger" aria-hidden="true"></i>
                {storeConfig.name}
              </a>
              <p className="footer-desc">{storeConfig.description}</p>
              <div className="footer-socials">
                {storeConfig.socialLinks.instagram && (
                  <a
                    href={storeConfig.socialLinks.instagram}
                    aria-label="Instagram"
                  >
                    <i className="fa-brands fa-instagram" aria-hidden="true"></i>
                  </a>
                )}
                {storeConfig.socialLinks.facebook && (
                  <a
                    href={storeConfig.socialLinks.facebook}
                    aria-label="Facebook"
                  >
                    <i className="fa-brands fa-facebook" aria-hidden="true"></i>
                  </a>
                )}
                <a href={storeConfig.socialLinks.whatsapp} aria-label="WhatsApp">
                  <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h3>Links rápidos</h3>
              <ul>
                <li>
                  <a href="#home">Início</a>
                </li>
                <li>
                  <a href="#pizzas">Pizzas</a>
                </li>
                <li>
                  <a href="#hambugueres">Hambúgueres</a>
                </li>
                <li>
                  <a href="#bebidas">Bebidas</a>
                </li>
              </ul>
            </div>

            <div className="footer-contact">
              <h3>Contato</h3>
              <address>
                {storeConfig.address.street}, {storeConfig.address.number}
                <br />
                {storeConfig.address.city} - {storeConfig.address.state}
                <br />
                <a href={`tel:+${storeConfig.whatsappPhone}`}>
                  {storeConfig.phoneDisplay}
                </a>
              </address>
            </div>

            <div className="footer-newsletter">
              <h3>Newsletter</h3>
              <p>Receba promoções e novidades por e-mail.</p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="newsletter-form"
              >
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  aria-label="Seu e-mail"
                />
                <button type="submit">Inscrever</button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">
              &copy; 2026 {storeConfig.name}. Todos os direitos reservados.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
