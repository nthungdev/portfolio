import { expect, test } from '@playwright/test'

test('home renders h1 Hung Nguyen', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveAccessibleName('Hung Nguyen')
  await expect(page.locator('h1')).toBeVisible()
})

test('hero slider via keyboard updates readout and aria-valuetext', async ({ page }) => {
  await page.goto('/')
  const slider = page.locator('#hero-year')
  await slider.focus()
  await slider.press('Home')
  const before = await slider.getAttribute('aria-valuetext')
  for (let i = 0; i < 50; i++) await slider.press('ArrowRight')
  const after = await slider.getAttribute('aria-valuetext')
  expect(after).not.toBe(before)
  expect(after).toMatch(/^\d{4}/)
  const readout = page.getByRole('button', { name: /Readout/ })
  await expect(readout).toContainText(/\d{4}/)
  await expect(readout).toContainText('Open in the log')
})

test('clicking readout expands that log row', async ({ page }) => {
  await page.goto('/')
  const slider = page.locator('#hero-year')
  await slider.focus()
  for (let i = 0; i < 40; i++) await slider.press('ArrowRight')
  const readout = page.getByRole('button', { name: /Readout/ })
  await expect(readout).toBeVisible()
  const openIds = () =>
    page.locator('li[data-open="true"]').evaluateAll((els) => els.map((e) => e.id))
  const before = await openIds()
  await readout.click()
  await expect.poll(async () => (await openIds()).length).toBeGreaterThan(before.length)
  const added = (await openIds()).filter((id) => !before.includes(id))
  expect(added).toHaveLength(1)
  const row = page.locator(`#${added[0]}`)
  await expect(row.locator('button[data-row]')).toHaveAttribute('aria-expanded', 'true')
})

test('OPEN AN ISSUE focuses the name input', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Open an issue' }).click()
  await expect(page.locator('#contact-name')).toBeFocused()
})

test('PULL REQUESTS anchor reaches #pull-requests', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Pull requests', exact: true }).first().click()
  await expect(page).toHaveURL(/#pull-requests$/)
  await expect(page.locator('#pull-requests')).toBeInViewport()
})

test('/#plain shows plain view', async ({ page }) => {
  await page.goto('/#plain')
  await expect(page.getByRole('button', { name: 'Plain view' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#log')).toBeInViewport()
  await expect(page.locator('li[data-open]').first()).toBeHidden()
})

test('lane chip toggles aria-pressed', async ({ page }) => {
  await page.goto('/')
  const chip = page.getByRole('group', { name: 'Show lanes' }).getByRole('button').first()
  await expect(chip).toHaveAttribute('aria-pressed', 'true')
  await chip.click()
  await expect(chip).toHaveAttribute('aria-pressed', 'false')
  await chip.click()
  await expect(chip).toHaveAttribute('aria-pressed', 'true')
})

test('contact form shows field errors on empty submit', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Submit new issue' }).click()
  await expect(page.locator('#name-error')).toBeVisible()
  await expect(page.locator('#email-error')).toBeVisible()
  await expect(page.locator('#subject-error')).toBeVisible()
  await expect(page.locator('#message-error')).toBeVisible()
  await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText(/^Sent\./)).toHaveCount(0)
})

test('command palette opens with Ctrl/Cmd+K and Escape restores focus', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Open command menu' })
  await trigger.focus()
  await page.keyboard.press('ControlOrMeta+k')
  const dialog = page.getByRole('dialog', { name: 'Command palette' })
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Search commands' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('/pr/vnb renders and /pr/nope is 404', async ({ page }) => {
  const ok = await page.goto('/pr/vnb')
  expect(ok?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
  const bad = await page.goto('/pr/nope')
  expect(bad?.status()).toBe(404)
})

test('/resume renders without a phone number', async ({ page }) => {
  const res = await page.goto('/resume')
  expect(res?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
  const text = await page.locator('body').innerText()
  expect(text).not.toMatch(/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)
  expect(text).not.toMatch(/\+\d[\d\s().-]{8,}/)
})

test('no horizontal overflow at 375px on /', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const m = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(m.scroll).toBeLessThanOrEqual(m.client)
})

test('reduced motion: h1 visible, no outline animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
  const info = await page.evaluate(() => {
    const word = document.querySelector('.plot-word') as SVGElement
    const h1 = document.querySelector('h1') as HTMLElement
    const w = getComputedStyle(word)
    return {
      wordAnim: w.animationName,
      stroke: w.stroke,
      h1Anim: getComputedStyle(h1).animationName,
      h1Opacity: getComputedStyle(h1).opacity,
    }
  })
  expect(info.wordAnim).toBe('none')
  expect(info.h1Anim).toBe('none')
  expect(info.h1Opacity).toBe('1')
  expect(info.stroke).toMatch(/none|transparent|rgba\(0, 0, 0, 0\)/)
})
