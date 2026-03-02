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

test('register', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('new user');
  await page.getByRole('textbox', { name: 'Email address' }).fill('n@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('n');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'nu' })).toBeVisible();
});

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('logout', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();

  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');
});

test('diner dashboard', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'KC' }).click();
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
});

test('franchise dashboard - diner', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
});

test('franchise dashboard - franchisee', async ({ page }) => {
  await basicInit(page, Role.Franchisee);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

  await expect(page.getByRole('main')).toContainText('Everything you need to run an JWT Pizza franchise.');
  await expect(page.getByText('LotaPizza')).toBeVisible();
});

test('create store', async ({ page }) => {
  await basicInit(page, Role.Franchisee);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading')).toContainText('Create store');
});

test('admin dashboard', async ({ page }) => {
  await basicInit(page, Role.Admin);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Global').getByRole('link', { name: 'Admin' }).click();

  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Filter names' }).click();
  await page.getByRole('textbox', { name: 'Filter names' }).fill('a');
  await page.getByRole('button', { name: 'Submit' }).nth(1).click();
  await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Delete' })).toBeVisible();
});

test('create franchise', async ({ page }) => {
  await basicInit(page, Role.Admin);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Global').getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await expect(page.getByRole('heading')).toContainText('Create franchise');
});

test('close franchise/store', async ({ page }) => {
  await basicInit(page, Role.Admin);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByLabel('Global').getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('row', { name: 'LotaPizza' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('row', { name: 'Lehi' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('about', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('main')).toContainText('The secret sauce');
});

test('history', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
});

test('not found', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/abou');
  await expect(page.getByRole('heading')).toContainText('Oops');
});

test('docs', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/docs');
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
});
