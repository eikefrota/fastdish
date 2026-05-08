import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChefHat } from "lucide-react";
import DishCard from "./DishCard";

const idMap = {
  Pizzas: "pizzas",
  "Hambúrgueres": "hambugueres",
  Bebidas: "bebidas",
};

export default function Menu({ groups, onAdd }) {
  return (
    <section id="menu" aria-label="Cardápio">
      <div className="menu-shell">
        <div className="menu-intro">
          <span className="section-eyebrow">
            <ChefHat size={16} aria-hidden="true" />
            Cardápio FastDish
          </span>
          <h2>Escolha, arraste e peça.</h2>
          <p>Um cardápio direto, visual e feito para comprar rápido.</p>
        </div>

        {groups.map((group) => (
          <MenuGroup
            key={group.category}
            id={idMap[group.category] || group.category.toLowerCase()}
            title={group.category}
            items={group.items}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  );
}

function MenuGroup({ id, title, items, onAdd }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    function updateControls() {
      const maxScroll = track.scrollWidth - track.clientWidth;
      setCanPrev(track.scrollLeft > 8);
      setCanNext(track.scrollLeft < maxScroll - 8);
    }

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, []);

  function scrollByCard(direction) {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector(".dish");
    const cardWidth = card ? card.getBoundingClientRect().width : 320;
    track.scrollBy({
      left: direction * (cardWidth + 18) * 2,
      behavior: "smooth",
    });
  }

  function handlePointerDown(e) {
    const track = trackRef.current;
    if (!track || e.pointerType === "touch") return;
    if (e.target.closest("button, a, input, textarea")) return;

    dragState.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: track.scrollLeft,
    };
    setIsDragging(true);
    track.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e) {
    const track = trackRef.current;
    if (!track || !dragState.current.active) return;

    const delta = e.clientX - dragState.current.startX;
    track.scrollLeft = dragState.current.scrollLeft - delta;
  }

  function endDrag(e) {
    const track = trackRef.current;
    dragState.current.active = false;
    setIsDragging(false);
    track?.releasePointerCapture?.(e.pointerId);
  }

  return (
    <section className="menu-group" id={id}>
      <div className="menu-group-heading">
        <div>
          <span className="section-eyebrow">Categoria</span>
          <h2 className="section-subtitle">{title}</h2>
        </div>

        <div className="carousel-controls" aria-label={`Controles de ${title}`}>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label={`Ver produtos anteriores em ${title}`}
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label={`Ver mais produtos em ${title}`}
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className={`dishes carousel-track${isDragging ? " is-dragging" : ""}`}
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (dragState.current.active) endDrag(e);
        }}
      >
        {items.map((item) => (
          <DishCard key={item.name} item={item} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
