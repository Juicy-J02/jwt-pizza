import { test, expect } from 'playwright-test-coverage';

test('updateUser', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('new user');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('n@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('new');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'nu' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().click();
    await page.getByRole('textbox').first().fill('pizza user');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('n@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('new');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'pu' }).click();
    await expect(page.getByRole('main')).toContainText('pizza user');
});
