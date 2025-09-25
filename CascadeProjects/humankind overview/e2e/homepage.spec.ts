import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the main page correctly', async ({ page }) => {
    await page.goto('/')

    // Check main heading
    await expect(page.getByRole('heading', { name: 'Course Tracker' })).toBeVisible()

    // Check description
    await expect(page.getByText('Collaborative Training Program Management Platform')).toBeVisible()

    // Check feature cards
    await expect(page.getByText('Training Programmes')).toBeVisible()
    await expect(page.getByText('Client Collaboration')).toBeVisible()
    await expect(page.getByText('Multi-Language')).toBeVisible()

    // Check success message
    await expect(page.getByText('Next.js 14 application successfully initialized!')).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Course Tracker' })).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: 'Course Tracker' })).toBeVisible()
  })

  test('should have proper page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Course Tracker/)
  })
})

