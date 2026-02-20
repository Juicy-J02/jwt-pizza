import { test, expect } from 'playwright-test-coverage';
import { User, Role } from "../src/service/pizzaService";
import { Page } from '@playwright/test';

async function basicInit(page: Page, role: Role = Role.Diner) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: role }] } };

    await page.route('*/**/api/auth', async (route) => {
        const method = route.request().method();

        if (method === 'POST') {
            const regReq = route.request().postDataJSON();

            const newUser = {
                id: '4',
                name: regReq.name,
                email: regReq.email,
                roles: [{ role: role }]
            };

            validUsers[regReq.email] = { ...newUser, password: regReq.password };
            loggedInUser = newUser;

            expect(route.request().method()).toBe('POST');
            await route.fulfill({ json: { user: newUser, token: 'new-token' } });
        }

        if (method === 'PUT') {
            const loginReq = route.request().postDataJSON();
            const user = validUsers[loginReq.email];
            if (!user || user.password !== loginReq.password) {
                await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
                return;
            }
            loggedInUser = validUsers[loginReq.email];
            const loginRes = {
                user: loggedInUser,
                token: 'abcdef',
            };
            expect(route.request().method()).toBe('PUT');
            await route.fulfill({ json: loginRes });
        }

        if (method === 'DELETE') {
            loggedInUser = undefined;
            await route.fulfill({ json: { message: 'logout successful' } });
        }
    });

    // Return the currently logged in user
    await page.route('*/**/api/user/me', async (route) => {
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: loggedInUser });
    });


    await page.route(/\/api\/user\/\d+$/, async (route) => {
        const updateData = route.request().postDataJSON();
        if (loggedInUser) {
            loggedInUser = { ...loggedInUser, ...updateData };
        }
        expect(route.request().method()).toBe('PUT');
        await route.fulfill({ json: loggedInUser });
    });

    await page.route(/\/api\/franchise\/\d+$/, async (route) => {
        const userFranchiseRes = [
            {
                id: 2,
                name: 'LotaPizza',
                admins: [{ id: '4', name: 'Kai Chen', email: 'd@jwt.com' }],
                stores: [
                    { id: 4, name: 'Lehi', totalRevenue: 1200.50 },
                    { id: 5, name: 'Springville', totalRevenue: 850.00 },
                ],
            },
        ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: userFranchiseRes });
    });

    // A standard menu
    await page.route('*/**/api/order/menu', async (route) => {
        const menuRes = [
            {
                id: 1,
                title: 'Veggie',
                image: 'pizza1.png',
                price: 0.0038,
                description: 'A garden of delight',
            },
            {
                id: 2,
                title: 'Pepperoni',
                image: 'pizza2.png',
                price: 0.0042,
                description: 'Spicy treat',
            },
        ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: menuRes });
    });

    await page.route(/\/api\/franchise\/\d+$/, async (route) => {
        const userFranchiseRes = role === Role.Franchisee
            ? [{ id: 2, name: 'LotaPizza', admins: [{ id: '4', name: 'Kai Chen' }], stores: [{ id: 4, name: 'Lehi', totalRevenue: 1200 }] }]
            : [];
        await route.fulfill({ json: userFranchiseRes });
    });

    await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
        const franchiseRes = {
            franchises: [
                { id: 2, name: 'LotaPizza', stores: [{ id: 4, name: 'Lehi' }] },
            ],
        };
        await route.fulfill({ json: franchiseRes });
    });

    // Order a pizza.
    await page.route('*/**/api/order', async (route) => {
        const method = route.request().method();
        if (method === 'POST') {
            const orderReq = route.request().postDataJSON();
            const orderRes = {
                order: { ...orderReq, id: 23 },
                jwt: 'eyJpYXQ',
            };
            expect(route.request().method()).toBe('POST');
            await route.fulfill({ json: orderRes });
        }

        if (method === 'GET') {
            const getOrdersRes = {
                dinerId: '4',
                orders: [
                    { id: 23, franchiseId: 1, storeId: 1, date: '2024-06-01', items: [{ menuId: 1, description: 'Veggie', price: 0.05 }] }
                ],
                page: 1,
            };
            await route.fulfill({ json: getOrdersRes });
        }
    });

    await page.goto('/');
}

test('updateUser', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'KC' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().click();
    await page.getByRole('textbox').first().fill('pizza user');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByRole('link', { name: 'pu' }).click();
    await expect(page.getByRole('main')).toContainText('pizza user');
});
