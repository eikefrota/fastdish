import { chromium } from "playwright";
import axe from "axe-core";
import fs from "node:fs/promises";
import path from "node:path";

const url = process.env.CHECK_URL || "http://127.0.0.1:5173";
const outputDir = path.resolve("output/playwright");
const violations = [];

async function prepareOutput() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function injectAxe(page) {
  await page.addScriptTag({ content: axe.source });
}

async function checkA11y(page, label) {
  await injectAxe(page);
  const result = await page.evaluate(async () => {
    return window.axe.run(document, {
      resultTypes: ["violations"],
    });
  });

  if (result.violations.length > 0) {
    violations.push({ label, violations: result.violations });
  }
}

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: true,
  });
}

async function mockCep(page) {
  await page.route("https://viacep.com.br/ws/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        cep: "60123-456",
        logradouro: "Rua Teste",
        bairro: "Centro",
        localidade: "Fortaleza",
        uf: "CE",
      }),
    });
  });
}

function printViolations() {
  for (const group of violations) {
    console.error(`\n${group.label}`);
    for (const violation of group.violations) {
      const nodes = violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(", "))
        .join(" | ");
      console.error(
        `- ${violation.id} (${violation.impact || "unknown"}): ${violation.help}`
      );
      console.error(`  ${nodes}`);
    }
  }
}

async function run() {
  await prepareOutput();

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });

  try {
    await mockCep(page);
    await page.goto(url, { waitUntil: "networkidle" });

    await checkA11y(page, "home desktop");
    await screenshot(page, "home-desktop");

    await page.setViewportSize({ width: 390, height: 844 });
    await checkA11y(page, "home mobile");
    await screenshot(page, "home-mobile");

    await page.click("#mobile-btn");
    await page.waitForTimeout(350);
    await checkA11y(page, "mobile menu");
    await screenshot(page, "mobile-menu");
    await page.click("#mobile-close");

    await page.setViewportSize({ width: 1366, height: 900 });
    await page
      .getByRole("button", {
        name: /adicionar pizza calabresa ao carrinho/i,
      })
      .first()
      .click();
    await page.click("#btn-cart");
    await page.waitForSelector("#cart-modal");
    await checkA11y(page, "cart modal");
    await screenshot(page, "cart-modal");

    await page.click("#confirm-cart-btn");
    await page.waitForSelector("#address-modal");
    await checkA11y(page, "address modal empty");
    await screenshot(page, "address-modal");

    await page.fill("#input-cep", "60123456");
    await page.locator("#input-cep").blur();
    await page.waitForFunction(
      () => document.querySelector("#input-street")?.value === "Rua Teste"
    );
    await page.fill("#input-number", "123");
    await page.fill("#input-notes", "Sem cebola");
    await page.click("#checkout-btn");
    await page.waitForSelector("#payment-modal");
    await checkA11y(page, "payment modal chooser");
    await screenshot(page, "payment-modal");

    await page.getByRole("radio", { name: /pix/i }).click();
    await page.waitForTimeout(150);
    await checkA11y(page, "payment pix");
    await screenshot(page, "payment-pix");

    await page.getByRole("radio", { name: /cart/i }).click();
    await page.waitForTimeout(150);
    await checkA11y(page, "payment card");
    await screenshot(page, "payment-card");
  } finally {
    await browser.close();
  }

  if (violations.length > 0) {
    printViolations();
    process.exitCode = 1;
  } else {
    console.log(`Axe passed. Screenshots saved in ${outputDir}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
