function envValue(name, fallback = "") {
  return import.meta.env[name] || fallback;
}

function envNumber(name, fallback = 0) {
  const value = Number(envValue(name, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const whatsappPhone = onlyDigits(
  envValue("VITE_WHATSAPP_PHONE", "5585999062339")
);

export const storeConfig = {
  name: envValue("VITE_STORE_NAME", "FastDish"),
  description:
    "O melhor sabor da cidade. Pizzas, hamburgueres e bebidas geladas entregues rapido.",
  phoneDisplay: envValue("VITE_STORE_PHONE_DISPLAY", "(85) 99906-2339"),
  whatsappPhone,
  address: {
    street: envValue("VITE_STORE_STREET", "Rua Exemplo"),
    number: envValue("VITE_STORE_NUMBER", "123"),
    city: envValue("VITE_STORE_CITY", "Cidade"),
    state: envValue("VITE_STORE_STATE", "Estado"),
  },
  socialLinks: {
    instagram: envValue("VITE_INSTAGRAM_URL"),
    facebook: envValue("VITE_FACEBOOK_URL"),
    whatsapp: `https://wa.me/${whatsappPhone}`,
  },
  pix: {
    key: envValue("VITE_PIX_KEY", "85999062338"),
    merchantName: envValue("VITE_PIX_MERCHANT_NAME", "FastDish"),
    merchantCity: envValue("VITE_PIX_MERCHANT_CITY", "FORTALEZA"),
  },
  order: {
    deliveryFee: envNumber("VITE_DELIVERY_FEE", 0),
    minimumOrder: envNumber("VITE_MINIMUM_ORDER", 0),
  },
};

export function getOrderTotals(subtotal) {
  const deliveryFee = storeConfig.order.deliveryFee;
  const orderTotal = Number(subtotal || 0) + deliveryFee;

  return {
    subtotal: Number(subtotal || 0),
    deliveryFee,
    orderTotal,
  };
}

export function buildWhatsAppUrl(message) {
  return `https://wa.me/${storeConfig.whatsappPhone}?text=${encodeURIComponent(
    message
  )}`;
}
