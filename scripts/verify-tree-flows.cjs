const { chromium } = require("playwright");
const path = require("node:path");

const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5173";
const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000/api";
const gedcomPath = path.resolve("backend/sample-data/mokrani-family.ged");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertNoOverlay(page, label) {
  const count = await page
    .locator(".vite-error-overlay, #webpack-dev-server-client-overlay, [data-nextjs-dialog]")
    .count();
  assert(count === 0, `${label}: framework error overlay is visible`);
}

async function waitForVisibleText(page, pattern, timeout = 15000) {
  await page.getByText(pattern).first().waitFor({ state: "visible", timeout });
}

async function waitForTreeSvg(page, label) {
  await page.waitForFunction(() => document.querySelectorAll("svg text").length > 0, null, {
    timeout: 20000,
  });
  const count = await page.locator("svg text").count();
  assert(count > 0, `${label}: no SVG person labels rendered`);
  return count;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  try {
    const galleryResponse = await page.goto(`${frontendUrl}/gallery/trees`, {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    assert(galleryResponse && galleryResponse.status() < 400, `/gallery/trees returned ${galleryResponse?.status()}`);
    await assertNoOverlay(page, "gallery");
    await waitForVisibleText(page, /family trees/i);
    await page.getByRole("button", { name: /^view$/i }).first().click();
    await waitForVisibleText(page, /al-masry family tree|mohamed|ahmed|fatima/i);
    const galleryLabels = await waitForTreeSvg(page, "gallery view tree");
    console.log(`[ok] Website gallery View renders a tree (${galleryLabels} SVG text labels)`);

    const login = await page.request.post(`${backendUrl}/auth/login`, {
      data: { email: "karimadmin@rootsegypt.org", password: "admin2025$" },
    });
    assert(login.ok(), `admin login failed with ${login.status()}`);
    const loginJson = await login.json();
    const token = loginJson?.data?.token || loginJson?.token;
    assert(token, "admin login did not return a token");

    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const adminPage = await adminContext.newPage();
    await adminPage.goto(frontendUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await adminPage.evaluate((value) => {
      localStorage.setItem("token", value);
      localStorage.setItem("mockupDataActive", "true");
    }, token);

    const adminResponse = await adminPage.goto(`${frontendUrl}/admin/trees`, {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    assert(adminResponse && adminResponse.status() < 400, `/admin/trees returned ${adminResponse?.status()}`);
    await assertNoOverlay(adminPage, "admin trees");
    await waitForVisibleText(adminPage, /new tree|tree details|nouvel arbre|détails de l'arbre/i);
    await adminPage
      .getByRole("button")
      .filter({ hasText: /view tree|voir arbre|voir l'arbre/i })
      .first()
      .click();
    await waitForVisibleText(adminPage, /david|miriam|noah/i);
    const adminLabels = await waitForTreeSvg(adminPage, "admin view tree");
    console.log(`[ok] Admin View Tree renders a tree (${adminLabels} SVG text labels)`);

    await adminPage
      .getByRole("button")
      .filter({ hasText: /clear|effacer|vider/i })
      .first()
      .click();
    await waitForVisibleText(adminPage, /start building your family tree|import a file|importez un fichier|commencez/i);
    await adminPage.locator('input[type="file"][accept=".ged,.gedcom"]').setInputFiles(gedcomPath);
    await waitForVisibleText(adminPage, /gedcom imported/i, 20000);
    await waitForVisibleText(adminPage, /mohamed el-mokrani|ahmed el-mokrani|boumezrag el-mokrani/i, 20000);
    const importedLabels = await waitForTreeSvg(adminPage, "GEDCOM import");
    console.log(`[ok] GEDCOM import shows the imported tree (${importedLabels} SVG text labels)`);

    await adminContext.close();
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
