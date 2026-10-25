import { test, expect } from "@playwright/test";

const localRoutes = ["/", "/projetos/", "/projetos/pastemax/", "/sobre/", "/contato/", "/privacidade/"];
const englishRoutes = ["/en/", "/en/projects/", "/en/projects/pastemax/", "/en/about/", "/en/contact/", "/en/privacy/"];

for (const [locale, routes] of [["pt-BR", localRoutes], ["en-US", englishRoutes]]) {
  test("real pages render without horizontal overflow (" + locale + ")", async ({ page }, info) => {
    await page.addInitScript(() => localStorage.setItem("ailton:site-language:v1", location.pathname.startsWith("/en/") ? "en" : "pt"));
    const failures = [];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("lang", locale === "pt-BR" ? "pt-BR" : "en");
      await expect(page.locator("main h1").first()).toBeVisible();
      const measure = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      if (measure.scroll > measure.viewport + 2) failures.push(route + ": scrollWidth=" + measure.scroll + " > viewport=" + measure.viewport);
      if (["/", "/en/", "/projetos/", "/en/projects/", "/sobre/", "/en/about/"].includes(route)) {
        const shot = await page.screenshot({ fullPage: true, animations: "disabled" });
        await info.attach("visual-" + (route.replace(/\//g, "_") || "root") + ".png", { body: shot, contentType: "image/png" });
      }
    }
    expect(failures, "Horizontal overflow in real browser: " + failures.join("; ")).toEqual([]);
  });
}

test("manual locale persists and respects explicit localized pages", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/$/);
  await page.goto("/projetos/pastemax/");
  await expect(page).toHaveURL(/\/projetos\/pastemax\/$/);
  await page.getByRole("navigation", { name: /Idioma do site/ }).getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/en\/projects\/pastemax\/$/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("navigation", { name: /Website language/ }).getByRole("link", { name: "PT" }).click();
  await expect(page).toHaveURL(/\/projetos\/pastemax\/$/);
  await context.close();
});

test("mobile navigation and actual project filters work", async ({ page, isMobile }) => {
  await page.addInitScript(() => localStorage.setItem("ailton:site-language:v1", "pt"));
  await page.goto("/projetos/");
  await expect(page.getByRole("button", { name: /Automação/ })).toBeVisible();
  await page.getByRole("button", { name: /Automação/ }).click();
  await expect(page.locator(".catalog-row:visible")).toHaveCount(1);
  await expect(page.locator(".catalog-row:visible").first()).toContainText("Crypbot");
  await page.getByRole("button", { name: /Todos/ }).click();
  await expect(page.locator(".catalog-row:visible")).toHaveCount(6);
  if (isMobile) {
    await page.locator(".mobile-navigation summary").click();
    await page.locator(".mobile-navigation").getByRole("link", { name: "Sobre" }).click();
  } else {
    await page.locator(".desktop-navigation").getByRole("link", { name: "Sobre" }).click();
  }
  await expect(page).toHaveURL(/\/sobre\/$/);
  await expect(page.getByText(/Estácio/).first()).toBeVisible();
});

test("accessible keyboard skip link and valid Open Graph images", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /\/og\.png$/);
  const image = await page.request.get("/og.png");
  expect(image.ok()).toBeTruthy();
  expect(image.headers()["content-type"]).toContain("image/png");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
});
