import coca from "../assets/bebidas/coca.webp";
import guarana from "../assets/bebidas/guarana.webp";
import milkshakeChocolate from "../assets/bebidas/milkshake-chocolate.webp";
import milkshakeMorango from "../assets/bebidas/milkshake-morango.webp";
import sucoLaranja from "../assets/bebidas/suco-laranja.webp";
import sucoMorango from "../assets/bebidas/suco-morango.webp";
import hamb1 from "../assets/burguers/hambuguer-1.webp";
import hamb2 from "../assets/burguers/hambuguer-2.webp";
import hamb4 from "../assets/burguers/hambuguer-4.webp";
import hamb3 from "../assets/burguers/hamburguer-3.webp";
import hambChicken from "../assets/burguers/hamburguer-chicken.webp";
import sanduicheBife from "../assets/burguers/sanduiche-bife.webp";
import sanduicheIntegral from "../assets/burguers/sanduiche-integral.webp";
import pizzaBacon from "../assets/pizzas/pizza-bacon.webp";
import pizzaCalabresa from "../assets/pizzas/pizza-calabresa.webp";
import pizzaCalabresa2 from "../assets/pizzas/pizza-calabresa2.webp";
import pizzaCogCalabresa from "../assets/pizzas/pizza-cogumelo-e-calabresa.webp";
import pizzaCogumelo from "../assets/pizzas/pizza-cogumelo.webp";
import pizzaMussarela from "../assets/pizzas/pizza-mussarela.webp";
import pizzaPepperoni from "../assets/pizzas/pizza-pepperoni.webp";
import pizzaPresunto from "../assets/pizzas/pizza-presunto-e-queijo.webp";

export const heroImage = pizzaCalabresa;

export const dishesData = [
  {
    category: "Pizzas",
    items: [
      {
        name: "Pizza Calabresa",
        desc: "Molho artesanal, fatias de calabresa, cebola, orégano e massa crocante",
        price: 32,
        img: pizzaCalabresa2,
      },
      {
        name: "Pizza Bacon",
        desc: "Molho artesanal, pedaços crocantes de bacon, queijo derretido e toque de orégano",
        price: 30,
        img: pizzaBacon,
      },
      {
        name: "Pizza Mussarela",
        desc: "Molho artesanal, queijo derretido e um toque de orégano",
        price: 28,
        img: pizzaMussarela,
      },
      {
        name: "Pizza Pepperoni",
        desc: "Molho artesanal, fatias de pepperoni levemente picantes, queijo derretido e orégano",
        price: 30,
        img: pizzaPepperoni,
      },
      {
        name: "Pizza Presunto e Queijo",
        desc: "Fatias generosas de presunto com queijo derretido e massa macia",
        price: 31,
        img: pizzaPresunto,
      },
      {
        name: "Pizza Cogumelo",
        desc: "Cogumelos salteados com queijo cremoso e um toque de ervas",
        price: 33,
        img: pizzaCogumelo,
      },
      {
        name: "Pizza Calabresa com Cogumelo",
        desc: "Combinação de calabresa e cogumelos sobre molho especial",
        price: 34,
        img: pizzaCogCalabresa,
      },
    ],
  },
  {
    category: "Hambúrgueres",
    items: [
      {
        name: "Burguer Salad",
        desc: "Pão brioche, hambúrguer, queijo cheddar, alface, tomate e cebola roxa",
        price: 27,
        img: hamb1,
      },
      {
        name: "Double Bacon",
        desc: "Pão brioche, dois hambúrgueres, queijo cheddar, alface, tomate e bacon",
        price: 30,
        img: hamb2,
      },
      {
        name: "Double Chicken",
        desc: "Pão brioche, duas fatias de frango, queijo cheddar, alface, tomate e cebola",
        price: 25,
        img: hamb3,
      },
      {
        name: "Picles Burguer",
        desc: "Pão brioche, hambúrguer, dois queijos cheddar, alface e muito picles",
        price: 29,
        img: hamb4,
      },
      {
        name: "Chicken Crocante",
        desc: "Peito de frango empanado, alface crocante e molho especial no pão brioche",
        price: 26,
        img: hambChicken,
      },
      {
        name: "Sub de Bife",
        desc: "Pão baguete recheado com tiras de bife, queijo e pimentões grelhados",
        price: 34,
        img: sanduicheBife,
      },
      {
        name: "Sanduíche Integral",
        desc: "Pão integral com presunto, queijo, alface e tomate, uma opção mais leve",
        price: 24,
        img: sanduicheIntegral,
      },
    ],
  },
  {
    category: "Bebidas",
    items: [
      {
        name: "Coca-Cola",
        desc: "Lata 350ml",
        price: 5,
        img: coca,
      },
      {
        name: "Guaraná Antarctica",
        desc: "Lata 350ml",
        price: 5,
        img: guarana,
      },
      {
        name: "Suco de Laranja",
        desc: "Copo 350ml",
        price: 8,
        img: sucoLaranja,
      },
      {
        name: "Suco de Morango",
        desc: "Copo 350ml",
        price: 8,
        img: sucoMorango,
      },
      {
        name: "Milkshake Chocolate",
        desc: "Copo 500ml",
        price: 12,
        img: milkshakeChocolate,
      },
      {
        name: "Milkshake Morango",
        desc: "Copo 500ml",
        price: 12,
        img: milkshakeMorango,
      },
    ],
  },
];
