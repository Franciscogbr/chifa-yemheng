import { expect, type Page } from '@playwright/test';

const credentialEnvByProfile = {
  admin: { username: 'TEST_USER_ADMIN', password: 'TEST_USER_ADMIN_PASS' },
  cajero1: { username: 'TEST_USER_CAJERO', password: 'TEST_USER_CAJERO_PASS' },
  mozo1: { username: 'TEST_USER_MESERO', password: 'TEST_USER_MESERO_PASS' },
  // Inventory smoke tests only check page access; .env.e2e has no warehouse account.
  almacen1: { username: 'TEST_USER_ADMIN', password: 'TEST_USER_ADMIN_PASS' },
} as const;

type LoginProfile = keyof typeof credentialEnvByProfile;

function getEmployeeCredentials(profile: LoginProfile) {
  const envNames = credentialEnvByProfile[profile];
  const username = process.env[envNames.username];
  const password = process.env[envNames.password];
  if (!username || !password) {
    throw new Error(
      `Configura ${envNames.username} y ${envNames.password} en frontend/.env.e2e.`
    );
  }

  return { username, password };
}

export async function login(page: Page, profile: LoginProfile) {
  const { username, password } = getEmployeeCredentials(profile);
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#logeo').fill(username);
  await page.locator('#clave').fill(password);

  const loginResponse = page
    .waitForResponse(
      (response) =>
        response.request().method() === 'POST'
        && new URL(response.url()).pathname.endsWith('/auth/login'),
      { timeout: 12_000 },
    )
    .catch(() => null);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  const response = await loginResponse;
  if (!response) {
    const alert = await page.getByRole('alert').textContent().catch(() => null);
    throw new Error(
      `POST /auth/login no respondió en 12 segundos.${alert ? ` Mensaje: ${alert.trim()}` : ''}`,
    );
  }
  if (!response.ok()) {
    throw new Error(
      `POST /auth/login respondió HTTP ${response.status()}: ${await response.text()}`,
    );
  }

  await expect(page).toHaveURL(/\/admin(?:\/|$)/, { timeout: 12_000 });
}

export async function logout(page: Page) {
  await page.click('button[id="logout"]');
  await expect(page).toHaveURL(/\/auth\/login\/?$/);
}

export async function esperarMensajeExito(page: Page, mensaje: string) {
  await page.waitForSelector('.mensaje-exito');
  const texto = await page.textContent('.mensaje-exito');
  if (!texto?.includes(mensaje)) {
    throw new Error(`Se esperaba "${mensaje}" pero se obtuvo "${texto}"`);
  }
}

export async function tomarCapturaError(page: Page, nombre: string) {
  const nombreArchivo = `error-${nombre}-${Date.now()}.png`;
  await page.screenshot({ path: `reports/screenshots/${nombreArchivo}`, fullPage: true });
  return nombreArchivo;
}
