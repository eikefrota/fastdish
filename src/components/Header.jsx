import React, { useState, useRef, useEffect } from "react";

export default function Header({
  storeName = "FastDish",
  onOpenCart,
  cartButtonRef,
  cartQuantity = 0,
  cartBump = false,
  onCartBumpEnd,
}) {
  const [mobileActive, setMobileActive] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileBtnRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const CLOSE_ANIM_DURATION = 280; // ms, keep in sync with CSS

  useEffect(() => {
    // prevent background scrolling when menu is open
    if (mobileActive) {
      document.body.style.overflow = "hidden";
      // focus first link in the mobile menu for accessibility
      const firstLink = mobileMenuRef.current?.querySelector("a");
      firstLink?.focus();
    } else {
      document.body.style.overflow = "";
      // restore focus to mobile button when closing
      mobileBtnRef.current?.focus();
    }

    function onKey(e) {
      if (e.key === "Escape") setMobileActive(false);
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileActive]);

  function closeMenu(afterClose) {
    if (!mobileActive || isClosing) {
      // if already closed or closing, just ensure state
      setMobileActive(false);
      setIsClosing(false);
      if (afterClose) afterClose();
      return;
    }

    setIsClosing(true);
    // wait the duration of the closing animation, then hide
    setTimeout(() => {
      setIsClosing(false);
      setMobileActive(false);
      if (afterClose) afterClose();
    }, CLOSE_ANIM_DURATION);
  }

  function handleMobileLinkClick(e, hash) {
    e.preventDefault();
    const target = document.querySelector(hash);
    closeMenu(() => {
      if (hash === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (target) {
        // small delay to allow menu to settle before smooth scrolling
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
        }, 40);
      } else {
        // fallback: update location
        window.location.hash = hash;
      }
    });
  }

  function handleCartClick() {
    if (mobileActive || isClosing) {
      closeMenu(onOpenCart);
      return;
    }

    onOpenCart();
  }

  return (
    <header>
      <nav id="nav-bar">
        <a
          id="nav-logo"
          className="logo-link"
          href="#home"
          onClick={(e) => handleMobileLinkClick(e, "#home")}
        >
          <i className="fa-solid fa-burger" aria-hidden="true"></i>
          {storeName}
        </a>

        <ul id="nav-list">
          <li className="nav-item">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileActive(false);
              }}
            >
              Início
            </a>
          </li>
          <li className="nav-item">
            <a href="#pizzas">Pizzas</a>
          </li>
          <li className="nav-item">
            <a href="#hambugueres">Hambúgueres</a>
          </li>
          <li className="nav-item">
            <a href="#bebidas">Bebidas</a>
          </li>
        </ul>

        <button
          id="btn-cart"
          onClick={handleCartClick}
          ref={cartButtonRef}
          aria-haspopup="dialog"
          className={cartBump ? "cart-bump" : ""}
          onAnimationEnd={onCartBumpEnd}
        >
          <i className="fa-solid fa-bag-shopping" aria-hidden="true"></i>
          Carrinho
          <span
            className="cart-badge"
            aria-label={`${cartQuantity} itens no carrinho`}
          >
            {cartQuantity}
          </span>
        </button>

        <button
          id="mobile-btn"
          ref={mobileBtnRef}
          aria-label={mobileActive ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileActive}
          onClick={() => (mobileActive ? closeMenu() : setMobileActive(true))}
        >
          <i
            className={mobileActive ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
            aria-hidden="true"
          ></i>
        </button>
      </nav>

      {/* backdrop to dim page and capture clicks to close menu */}
      <div
        id="mobile-backdrop"
        className={
          mobileActive ? (isClosing ? "active closing" : "active") : ""
        }
        onClick={() => closeMenu()}
        aria-hidden={!(mobileActive || isClosing)}
      />

      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={`${mobileActive ? "active" : ""} ${
          isClosing ? "closing" : ""
        }`}
        aria-hidden={!(mobileActive || isClosing)}
        role="dialog"
        aria-label="Menu principal"
      >
        <button
          id="mobile-close"
          aria-label="Fechar menu"
          onClick={() => closeMenu()}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
        <ul id="mobile-nav-list">
          <li className="nav-item">
            <a href="#home" onClick={(e) => handleMobileLinkClick(e, "#home")}>
              Início
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#pizzas"
              onClick={(e) => handleMobileLinkClick(e, "#pizzas")}
            >
              Pizzas
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#hambugueres"
              onClick={(e) => handleMobileLinkClick(e, "#hambugueres")}
            >
              Hambúgueres
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#bebidas"
              onClick={(e) => handleMobileLinkClick(e, "#bebidas")}
            >
              Bebidas
            </a>
          </li>
        </ul>

        <button
          id="btn-cart-mobile"
          onClick={handleCartClick}
          aria-haspopup="dialog"
        >
          <i className="fa-solid fa-bag-shopping" aria-hidden="true"></i>
          Carrinho
          <span
            className="cart-badge"
            aria-label={`${cartQuantity} itens no carrinho`}
          >
            {cartQuantity}
          </span>
        </button>
      </div>
    </header>
  );
}
