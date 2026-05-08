import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Clock3,
  Flame,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TimerReset,
  UtensilsCrossed,
} from "lucide-react";
import { Toaster, toast } from "sonner";
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
  const cartButtonRef = useRef(null);
  const modalOpen = cartVisible || paymentVisible || addressVisible;

  useEffect(() => {
    const hasMatchMedia =
      typeof window !== "undefined" && typeof window.matchMedia === "function";
    const reduceMotion =
      hasMatchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !hasMatchMedia) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            immediateRender: false,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              once: true,
            },
          },
        );
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    if (import.meta.env.MODE === "test") return undefined;

    if (!modalOpen) return undefined;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previousBodyStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    const previousHtmlOverflow = html.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;
      try {
        window.scrollTo(0, scrollY);
      } catch {
        // Some non-browser environments expose scrollTo without implementing it.
      }
    };
  }, [modalOpen]);

  function showToast(text, success = true) {
    if (import.meta.env.MODE === "test") {
      if (success) console.log(text);
      else console.warn(text);
      return;
    }

    if (success) toast.success(text);
    else toast.error(text);
  }

  function addToCart(item) {
    add(item);
    showToast(`${item.name} entrou no carrinho.`, true);
    setCartBump(true);
  }

  function removeFromCart(name) {
    remove(name);
  }

  function openCart() {
    if (import.meta.env.MODE !== "test") toast.dismiss();
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
        `Pedido mínimo de ${formatCurrency(storeConfig.order.minimumOrder)}.`,
        false,
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
      showToast("Preencha o CEP e o número antes de continuar.", false);
      return;
    }

    setShowAddressErrors(false);
    setAddressVisible(false);
    setPaymentVisible(true);
  }

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
      showToast("Preencha o CEP e o número antes de finalizar.", false);
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
      : "*Pagamento:* Não especificado";

    const plainMessage = `*Novo pedido - ${storeConfig.name}* ${orderId}
${datetime}

*Itens:*
${cartLines}

*Subtotal:* ${subtotalMsg}${deliveryLine}
*Total:* ${totalMsg}

*Entrega:*
${addressLines}

${paymentInfo}

${orderAddress.notes ? `*Observações:* ${orderAddress.notes}\n` : ""}

Obrigado!
`;

    window.open(buildWhatsAppUrl(plainMessage), "_blank");
    clear();
    setAddressVisible(false);
    setPaymentVisible(false);
    setShowAddressErrors(false);
  }

  return (
    <div className="app-shell">
      <Toaster
        position="top-center"
        closeButton
        toastOptions={{
          style: {
            background: "#111214",
            color: "#fff7ea",
            border: "1px solid rgba(255, 255, 255, 0.16)",
          },
        }}
      />
      <Header
        storeName={storeConfig.name}
        onOpenCart={openCart}
        cartButtonRef={cartButtonRef}
        cartQuantity={totalQuantity}
        cartBump={cartBump}
        onCartBumpEnd={() => setCartBump(false)}
      />

      <main id="content" aria-hidden={modalOpen ? "true" : undefined}>
        <Hero heroImage={heroImage} totalQuantity={totalQuantity} />
        <ProofStrip />

        <Menu groups={dishesData} onAdd={addToCart} />

        <section className="experience-section" data-reveal>
          <div className="section-eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Experiência premium
          </div>
          <div className="experience-grid">
            <div className="experience-copy">
              <h2>Pedido guiado, sem atrito.</h2>
              <p>
                Cardápio visual, carrinho claro e envio direto pelo WhatsApp.
              </p>
            </div>
            <div className="experience-steps" aria-label="Etapas do pedido">
              <article>
                <span>01</span>
                <h3>Escolha</h3>
                <p>Fotos grandes, preço claro e ação sempre próxima.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Entrega</h3>
                <p>CEP inteligente e observações sem complicação.</p>
              </article>
              <article>
                <span>03</span>
                <h3>WhatsApp</h3>
                <p>Resumo formatado com itens, entrega e pagamento.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="final-cta" data-reveal>
          <div>
            <span className="section-eyebrow">
              <TimerReset size={16} aria-hidden="true" />
              Peça agora
            </span>
            <h2>Seu favorito, mais rápido.</h2>
            <p>Pizzas, burgers e bebidas com compra direta e sem ruído.</p>
          </div>
          <a className="cta-primary cta-final" href="#menu">
            Escolher agora
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

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

      <footer aria-hidden={modalOpen ? "true" : undefined}>
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
                <UtensilsCrossed size={24} aria-hidden="true" />
                {storeConfig.name}
              </a>
              <p className="footer-desc">{storeConfig.description}</p>
              <div className="footer-socials">
                <a
                  href={storeConfig.socialLinks.whatsapp}
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={18} aria-hidden="true" />
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
                  <a href="#hambugueres">Hambúrgueres</a>
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
              <h3>Clube FastDish</h3>
              <p>Receba promoções, combos e novidades pelo WhatsApp.</p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="newsletter-form"
              >
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  aria-label="Seu e-mail"
                />
                <button type="submit">Entrar</button>
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

      {totalQuantity > 0 && (
        <button className="mobile-cart-bar" type="button" onClick={openCart}>
          <span>
            <ShoppingBag size={18} aria-hidden="true" />
            {totalQuantity} {totalQuantity === 1 ? "item" : "itens"}
          </span>
          <strong>{formatCurrency(orderTotal)}</strong>
        </button>
      )}
    </div>
  );
}

function Hero({ heroImage, totalQuantity }) {
  return (
    <section id="home" className="hero-section">
      <div className="hero-light hero-light-a" aria-hidden="true" />
      <div className="hero-light hero-light-b" aria-hidden="true" />

      <div id="cta" className="hero-copy">
        <span className="hero-kicker hero-animate-1">
          <Flame size={16} aria-hidden="true" />
          Aberto agora
        </span>

        <h1 className="title hero-animate-2">
          FastDish
          <span>
            Sabor quente.
            <br />
            Pedido veloz.
          </span>
        </h1>

        <div id="cta-area" className="hero-actions hero-animate-4">
          <a id="cta-btn" className="cta-primary" href="#menu">
            Pedir agora
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>

        <div className="hero-metrics hero-animate-5">
          <span>
            <Clock3 size={16} aria-hidden="true" />
            18-32 min
          </span>
          <span>
            <Star size={16} aria-hidden="true" />
            4.9 avaliação
          </span>
          <span>
            <ShoppingBag size={16} aria-hidden="true" />
            {totalQuantity} no carrinho
          </span>
        </div>
      </div>

      <div id="banner" className="hero-product hero-product-enter">
        <div className="orbit-ring orbit-ring-one" aria-hidden="true" />
        <div className="orbit-ring orbit-ring-two" aria-hidden="true" />
        <div className="banner-image-container">
          <img src={heroImage} alt="Pizza Calabresa" fetchpriority="high" />
        </div>
        <div className="floating-ticket ticket-top">
          <ShieldCheck size={17} aria-hidden="true" />
          Pedido fácil
        </div>
        <div className="floating-ticket ticket-bottom">
          <MapPin size={17} aria-hidden="true" />
          Entrega rápida
        </div>
      </div>
    </section>
  );
}

function ProofStrip() {
  return (
    <section className="proof-strip" aria-label="Diferenciais FastDish">
      <div>
        <UtensilsCrossed size={19} aria-hidden="true" />
        <span>Quente e crocante</span>
      </div>
      <div>
        <Clock3 size={19} aria-hidden="true" />
        <span>Compra em poucos toques</span>
      </div>
      <div>
        <ShieldCheck size={19} aria-hidden="true" />
        <span>Direto no WhatsApp</span>
      </div>
    </section>
  );
}

export default App;
