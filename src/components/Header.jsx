import React, { useEffect, useRef, useState } from "react";
import {
  Menu as MenuIcon,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from "lucide-react";

export default function Header({
  storeName = "FastDish",
  onOpenCart,
  cartButtonRef,
  cartQuantity = 0,
  cartBump = false,
  onCartBumpEnd,
}) {
  const [mobileActive, setMobileActive] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileBtnRef = useRef(null);
  const CLOSE_ANIM_DURATION = 280;

  useEffect(() => {
    if (mobileActive) {
      document.body.style.overflow = "hidden";
      const firstLink = mobileMenuRef.current?.querySelector("a");
      firstLink?.focus();
    } else {
      document.body.style.overflow = "";
      if (isClosing) mobileBtnRef.current?.focus();
    }

    function onKey(e) {
      if (e.key === "Escape") closeMenu();
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileActive, isClosing]);

  function closeMenu(afterClose) {
    if (!mobileActive || isClosing) {
      setMobileActive(false);
      setIsClosing(false);
      if (afterClose) afterClose();
      return;
    }

    setIsClosing(true);
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
        setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 40);
      } else {
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
      <nav id="nav-bar" aria-label="Navegação principal">
        <a
          id="nav-logo"
          className="logo-link"
          href="#home"
          onClick={(e) => handleMobileLinkClick(e, "#home")}
        >
          <span className="logo-mark" aria-hidden="true">
            <UtensilsCrossed size={21} />
          </span>
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
            <a href="#hambugueres">Hambúrgueres</a>
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
          <ShoppingBag size={18} aria-hidden="true" />
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
          {mobileActive ? (
            <X size={25} aria-hidden="true" />
          ) : (
            <MenuIcon size={25} aria-hidden="true" />
          )}
        </button>
      </nav>

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
          <X size={28} aria-hidden="true" />
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
              Hambúrgueres
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
          <ShoppingBag size={18} aria-hidden="true" />
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
