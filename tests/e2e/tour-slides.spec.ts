import { expect, test, type Page } from '@playwright/test'

const tourDialog = (page: Page) => page.getByRole('dialog', { name: /tour/i })

test.beforeEach(async ({ page }) => {
  // Skip the first-open gesture hint so the clock starts right away.
  await page.addInitScript(() => localStorage.setItem('tour:hint-seen', '1'))
})

async function openGroup(page: Page, name: string) {
  await page.goto('/')
  await page.getByRole('button', { name: new RegExp(`^${name} story`) }).click()
  const dialog = tourDialog(page)
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.tour-grp')).toContainText(`${name} · 1 of`)
  return dialog
}

async function pause(page: Page) {
  const dialog = tourDialog(page)
  await dialog.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(dialog).toHaveAttribute('data-paused', 'true')
}

/** Presses ArrowRight until the position text reads `name · n of`. */
async function goToSlide(page: Page, name: string, n: number) {
  const position = tourDialog(page).locator('.tour-grp')
  for (let i = 0; i < 40; i++) {
    if ((await position.textContent())?.startsWith(`${name} · ${n} of`)) return
    await page.keyboard.press('ArrowRight')
  }
  await expect(position).toContainText(`${name} · ${n} of`)
}

async function noHorizontalOverflow(page: Page) {
  const m = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(m.scroll).toBeLessThanOrEqual(m.client)
}

test('scratch: bar waits, Enter on the card reveals +150%, then the bar runs', async ({ page }) => {
  const dialog = await openGroup(page, 'Proud of')
  await expect(dialog.locator('.tour-run')).toHaveCount(0)
  await expect(dialog.locator('.tour-scr')).toHaveAttribute('data-revealed', 'false')
  const cover = dialog.getByRole('button', { name: 'Scratch card: press to reveal' })
  await cover.focus()
  await page.keyboard.press('Enter')
  await expect(dialog.locator('.tour-scr')).toHaveAttribute('data-revealed', 'true')
  await expect(dialog.locator('.tour-scr-prize .tour-big')).toHaveText('+150%')
  await expect(dialog.locator('.tour-scr-prize .tour-big')).toBeVisible()
  await expect(dialog.locator('.tour-run')).toHaveCount(1)
  await expect(dialog.locator('.tour-grp')).toContainText('Proud of · 1 of')
})

test('slider: ArrowRight moves the range value, not the slide', async ({ page }) => {
  const dialog = await openGroup(page, 'Now')
  await pause(page)
  await goToSlide(page, 'Now', 3)
  const position = await dialog.locator('.tour-grp').textContent()
  const range = dialog.getByRole('slider')
  await expect(range).toHaveValue('0')
  await range.focus()
  await page.keyboard.press('ArrowRight')
  await expect(range).toHaveValue('1')
  await page.keyboard.press('ArrowRight')
  await expect(range).toHaveValue('2')
  await expect(dialog.locator('.tour-grp')).toHaveText(position ?? '')
  await expect(dialog.locator('.tour-reveal')).toBeVisible()
})

test('reel: right-third taps step images on the same slide until the last', async ({ page }) => {
  const dialog = await openGroup(page, 'Built')
  await pause(page)
  const label = dialog.locator('.tour-reel-k')
  const position = dialog.locator('.tour-grp')
  const before = await position.textContent()
  const total = Number((await label.textContent())?.match(/\/(\d+)/)?.[1])
  expect(total).toBeGreaterThan(1)
  const box = (await dialog.boundingBox())!
  const tap = () => page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.45)
  for (let i = 2; i <= total; i++) {
    await tap()
    await expect(label).toContainText(`${i}/${total}`)
    await expect(position).toHaveText(before ?? '')
  }
  await tap()
  await expect(position).toContainText('Built · 2 of')
})

test('flip: Enter toggles aria-pressed', async ({ page }) => {
  const dialog = await openGroup(page, 'Career')
  await pause(page)
  const total = Number((await dialog.locator('.tour-grp').textContent())?.match(/of (\d+)/)?.[1])
  await goToSlide(page, 'Career', total)
  const card = dialog.locator('button.tour-flip')
  await expect(card).toHaveAttribute('aria-pressed', 'false')
  await card.focus()
  await page.keyboard.press('Enter')
  await expect(card).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Enter')
  await expect(card).toHaveAttribute('aria-pressed', 'false')
})

test.describe('reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('scratch shows a Reveal button and no self-demo', async ({ page }) => {
    const dialog = await openGroup(page, 'Proud of')
    const reveal = dialog.getByRole('button', { name: 'Reveal', exact: true })
    await expect(reveal).toBeVisible()
    await page.waitForTimeout(4000)
    await expect(dialog.locator('.tour-scr')).toHaveAttribute('data-revealed', 'false')
    await reveal.click()
    await expect(dialog.locator('.tour-scr')).toHaveAttribute('data-revealed', 'true')
    await expect(dialog.locator('.tour-scr-prize .tour-big')).toHaveText('+150%')
    await expect(dialog.locator('.tour-run')).toHaveCount(0)
  })

  test('terminal shows every line immediately', async ({ page }) => {
    const dialog = await openGroup(page, 'Now')
    await goToSlide(page, 'Now', 4)
    const outputs = dialog.locator('.tour-term-out')
    await expect(outputs).toHaveCount(4)
    await expect(outputs.last()).toBeVisible()
    await expect(outputs.last()).toHaveText('up since 2020, still maintained')
  })

  test('flip card does not flip itself', async ({ page }) => {
    const dialog = await openGroup(page, 'Career')
    const total = Number((await dialog.locator('.tour-grp').textContent())?.match(/of (\d+)/)?.[1])
    await goToSlide(page, 'Career', total)
    const card = dialog.locator('button.tour-flip')
    await expect(card).toHaveAttribute('aria-pressed', 'false')
    await page.waitForTimeout(3500)
    await expect(card).toHaveAttribute('aria-pressed', 'false')
  })
})

test.describe('tour on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('swipe: Skip/Interested walk the deck and the CTA prefills the contact subject', async ({ page }) => {
    const dialog = await openGroup(page, 'Built')
    await pause(page)
    const total = Number((await dialog.locator('.tour-grp').textContent())?.match(/of (\d+)/)?.[1])
    await goToSlide(page, 'Built', total)
    const live = dialog.locator('.tour-swp p[aria-live]')
    const count = Number((await live.textContent())?.match(/of (\d+)/)?.[1])
    expect(count).toBeGreaterThanOrEqual(2)
    const liked: string[] = []
    for (let i = 1; i <= count; i++) {
      await expect(live).toContainText(`Project ${i} of ${count}`)
      const title = (await dialog.locator('.tour-swp-card[data-tour-ui] h4').textContent()) ?? ''
      if (i % 2 === 0) {
        liked.push(title)
        await dialog.getByRole('button', { name: 'Interested' }).click()
      } else {
        await dialog.getByRole('button', { name: 'Skip' }).click()
      }
    }
    await expect(dialog.getByRole('status').filter({ hasText: /^You liked/ })).toHaveText(`You liked ${liked.length}`)
    await expect(dialog.locator('.tour-grp')).toContainText(`Built · ${total} of`)
    await dialog.getByRole('button', { name: 'Ask me about these →' }).click()
    await expect(dialog).toBeHidden()
    const subject = page.locator('input[name="subject"]')
    await expect(subject).toHaveValue(/^Re: /)
    await expect(subject).toHaveValue(new RegExp(liked[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  })

  test('no horizontal overflow at 375px on the reel and swipe slides', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    const dialog = await openGroup(page, 'Built')
    await pause(page)
    await expect(dialog.locator('.tour-reel')).toBeVisible()
    await noHorizontalOverflow(page)
    const total = Number((await dialog.locator('.tour-grp').textContent())?.match(/of (\d+)/)?.[1])
    await goToSlide(page, 'Built', total)
    await expect(dialog.locator('.tour-swp-deck')).toBeVisible()
    await noHorizontalOverflow(page)
  })

  test('no horizontal overflow at 375px on the terminal slide', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const dialog = await openGroup(page, 'Now')
    await goToSlide(page, 'Now', 4)
    await expect(dialog.locator('.tour-term')).toBeVisible()
    await noHorizontalOverflow(page)
  })
})
