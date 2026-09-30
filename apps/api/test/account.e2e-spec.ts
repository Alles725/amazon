import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  ACCOUNT_ROUTES,
  AUTH_ROUTES,
  CHECKOUT_ROUTES,
  DEFAULT_LIST_NAME,
  ErrorCode,
  LIST_ROUTES,
} from '@amazon-mvp/api-contract';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';

/**
 * Account area: addresses management, access & security, lists.
 *   make migrate && pnpm --filter @amazon-mvp/api test:integration
 */
const address = {
  recipient: 'Pessoa de Teste',
  postalCode: '90020060',
  street: 'Rua de Teste',
  number: '123',
  neighborhood: 'Centro',
  city: 'Porto Alegre',
  state: 'RS',
};
const password = 'account integration password';

describe('account area (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookieName: string;
  const users: string[] = [];
  const products: string[] = [];

  const http = () => request(app.getHttpServer());
  const cookieOf = (response: request.Response) => {
    const raw = response.headers['set-cookie'] as unknown as string[];
    return raw.find((entry) => entry.startsWith(`${cookieName}=`))!.split(';')[0];
  };
  const register = async () => {
    const email = `account-${randomUUID()}@example.com`;
    const response = await http()
      .post(AUTH_ROUTES.register)
      .send({ email, password, displayName: 'Conta Teste' })
      .expect(201);
    users.push(response.body.user.id);
    return { email, cookie: cookieOf(response), id: response.body.user.id as string };
  };
  const login = async (email: string, secret = password) =>
    cookieOf(await http().post(AUTH_ROUTES.login).send({ email, password: secret }).expect(200));

  beforeAll(async () => {
    const created = await createApp();
    app = created.app;
    cookieName = created.config.session.cookieName;
    await app.init();
    prisma = app.get(PrismaService);
    for (let i = 0; i < 2; i++) {
      const id = randomUUID();
      await prisma.product.create({
        data: {
          id,
          slug: id,
          sku: id,
          name: `List product ${i}`,
          priceMinor: 4990 + i,
          inventory: { create: { quantity: 3 } },
        },
      });
      products.push(id);
    }
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { id: { in: users } } });
      await prisma.product.deleteMany({ where: { id: { in: products } } });
    }
    await app?.close();
  });

  it('requires a session for every account endpoint', async () => {
    await http().get(LIST_ROUTES.lists).expect(401);
    await http().post(LIST_ROUTES.lists).send({ name: 'x' }).expect(401);
    await http().patch(ACCOUNT_ROUTES.profile).send({ displayName: 'Xx' }).expect(401);
    await http()
      .post(ACCOUNT_ROUTES.password)
      .send({ currentPassword: password, newPassword: 'another long passphrase' })
      .expect(401);
    await http().post(ACCOUNT_ROUTES.email).send({ email: 'a@example.com', currentPassword: password }).expect(401);
    await http().delete(`${CHECKOUT_ROUTES.addresses}/${randomUUID()}`).expect(401);
    await http().post(`${CHECKOUT_ROUTES.addresses}/${randomUUID()}/default`).expect(401);
  });

  describe('addresses', () => {
    it('makes the first address the default, lists it first and promotes on delete', async () => {
      const { cookie } = await register();
      const save = (street: string) =>
        http()
          .post(CHECKOUT_ROUTES.addresses)
          .set('Cookie', cookie)
          .send({ ...address, street })
          .expect(201);
      const first = (await save('Rua Um')).body;
      const second = (await save('Rua Dois')).body;
      const third = (await save('Rua Tres')).body;
      expect(first.isDefault).toBe(true);
      expect(second.isDefault).toBe(false);

      const promoted = await http()
        .post(`${CHECKOUT_ROUTES.addresses}/${third.id}/default`)
        .set('Cookie', cookie)
        .expect(200);
      expect(promoted.body.map((a: { id: string }) => a.id)).toEqual([third.id, first.id, second.id]);
      expect(promoted.body.filter((a: { isDefault: boolean }) => a.isDefault)).toHaveLength(1);

      const afterDelete = await http()
        .delete(`${CHECKOUT_ROUTES.addresses}/${third.id}`)
        .set('Cookie', cookie)
        .expect(200);
      // The oldest remaining address becomes the default.
      expect(afterDelete.body.map((a: { id: string; isDefault: boolean }) => [a.id, a.isDefault])).toEqual([
        [first.id, true],
        [second.id, false],
      ]);
      const listed = await http().get(CHECKOUT_ROUTES.addresses).set('Cookie', cookie).expect(200);
      expect(listed.body).toEqual(afterDelete.body);
    });

    it("never lets one user delete or default another user's address", async () => {
      const owner = await register();
      const intruder = await register();
      const saved = await http()
        .post(CHECKOUT_ROUTES.addresses)
        .set('Cookie', owner.cookie)
        .send(address)
        .expect(201);
      const target = `${CHECKOUT_ROUTES.addresses}/${saved.body.id}`;
      const deleted = await http().delete(target).set('Cookie', intruder.cookie).expect(404);
      expect(deleted.body.error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      await http().post(`${target}/default`).set('Cookie', intruder.cookie).expect(404);
      await http().put(target).set('Cookie', intruder.cookie).send(address).expect(404);
      const listed = await http().get(CHECKOUT_ROUTES.addresses).set('Cookie', owner.cookie).expect(200);
      expect(listed.body).toHaveLength(1);
      await http().delete(`${CHECKOUT_ROUTES.addresses}/not-a-uuid`).set('Cookie', owner.cookie).expect(400);
    });
  });

  describe('access and security', () => {
    it('changes the display name with the same rules as registration', async () => {
      const { cookie } = await register();
      await http().patch(ACCOUNT_ROUTES.profile).set('Cookie', cookie).send({ displayName: ' A ' }).expect(400);
      const updated = await http()
        .patch(ACCOUNT_ROUTES.profile)
        .set('Cookie', cookie)
        .send({ displayName: '  Nome Novo  ' })
        .expect(200);
      expect(updated.body.displayName).toBe('Nome Novo');
      expect(updated.body).not.toHaveProperty('passwordHash');
      const me = await http().get(AUTH_ROUTES.me).set('Cookie', cookie).expect(200);
      expect(me.body.user.displayName).toBe('Nome Novo');
    });

    it('changes the password, keeps this session and signs out every other one', async () => {
      const { email, cookie } = await register();
      const otherDevice = await login(email);
      const newPassword = 'a brand new passphrase';

      const short = await http()
        .post(ACCOUNT_ROUTES.password)
        .set('Cookie', cookie)
        .send({ currentPassword: password, newPassword: 'short' })
        .expect(400);
      expect(short.body.error.code).toBe(ErrorCode.VALIDATION_FAILED);

      const wrong = await http()
        .post(ACCOUNT_ROUTES.password)
        .set('Cookie', cookie)
        .send({ currentPassword: 'not the password at all', newPassword })
        .expect(403);
      expect(wrong.body.error).toMatchObject({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
      await http().get(AUTH_ROUTES.me).set('Cookie', otherDevice).expect(200);

      const changed = await http()
        .post(ACCOUNT_ROUTES.password)
        .set('Cookie', cookie)
        .send({ currentPassword: password, newPassword })
        .expect(200);
      expect(changed.body).toEqual({ success: true, revokedSessions: 1 });

      await http().get(AUTH_ROUTES.me).set('Cookie', cookie).expect(200);
      await http().get(AUTH_ROUTES.me).set('Cookie', otherDevice).expect(401);
      await http().post(AUTH_ROUTES.login).send({ email, password }).expect(401);
      await login(email, newPassword);
    });

    it('changes the e-mail only with the current password and to a free address', async () => {
      const first = await register();
      const second = await register();
      const otherDevice = await login(first.email);
      const target = `account-new-${randomUUID()}@example.com`;

      await http()
        .post(ACCOUNT_ROUTES.email)
        .set('Cookie', first.cookie)
        .send({ email: target, currentPassword: 'not the password at all' })
        .expect(403);
      const taken = await http()
        .post(ACCOUNT_ROUTES.email)
        .set('Cookie', first.cookie)
        .send({ email: second.email.toUpperCase(), currentPassword: password })
        .expect(409);
      expect(taken.body.error.code).toBe(ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED);

      const changed = await http()
        .post(ACCOUNT_ROUTES.email)
        .set('Cookie', first.cookie)
        .send({ email: `  ${target.toUpperCase()} `, currentPassword: password })
        .expect(200);
      expect(changed.body.email).toBe(target);
      await http().get(AUTH_ROUTES.me).set('Cookie', otherDevice).expect(401);
      await http().post(AUTH_ROUTES.login).send({ email: first.email, password }).expect(401);
      await login(target);
    });
  });

  describe('lists', () => {
    it('creates the default wish list lazily, exactly once', async () => {
      const { cookie } = await register();
      const [a, b] = await Promise.all([
        http().get(LIST_ROUTES.lists).set('Cookie', cookie).expect(200),
        http().get(LIST_ROUTES.lists).set('Cookie', cookie).expect(200),
      ]);
      expect(a.body).toHaveLength(1);
      expect(b.body).toEqual(a.body);
      expect(a.body[0]).toMatchObject({ name: DEFAULT_LIST_NAME, isDefault: true, itemCount: 0 });
    });

    it('creates, renames and deletes lists and manages items with live catalog data', async () => {
      const { cookie } = await register();
      const created = await http()
        .post(LIST_ROUTES.lists)
        .set('Cookie', cookie)
        .send({ name: '  Presentes  ' })
        .expect(201);
      expect(created.body).toMatchObject({ name: 'Presentes', isDefault: false, itemCount: 0 });
      const listUrl = `${LIST_ROUTES.lists}/${created.body.id}`;

      const lists = await http().get(LIST_ROUTES.lists).set('Cookie', cookie).expect(200);
      expect(lists.body.map((l: { name: string }) => l.name)).toEqual([DEFAULT_LIST_NAME, 'Presentes']);

      await http().patch(listUrl).set('Cookie', cookie).send({ name: '   ' }).expect(400);
      const renamed = await http().patch(listUrl).set('Cookie', cookie).send({ name: 'Natal' }).expect(200);
      expect(renamed.body.name).toBe('Natal');

      await http().post(`${listUrl}/items`).set('Cookie', cookie).send({ productId: products[0] }).expect(200);
      await http().post(`${listUrl}/items`).set('Cookie', cookie).send({ productId: products[0] }).expect(200);
      const withItems = await http()
        .post(`${listUrl}/items`)
        .set('Cookie', cookie)
        .send({ productId: products[1] })
        .expect(200);
      expect(withItems.body.items.map((i: { productId: string }) => i.productId)).toEqual([
        products[1],
        products[0],
      ]);
      expect(withItems.body.items[1].product).toMatchObject({
        id: products[0],
        priceMinor: 4990,
        availableQuantity: 3,
        inStock: true,
      });
      await http()
        .post(`${listUrl}/items`)
        .set('Cookie', cookie)
        .send({ productId: randomUUID() })
        .expect(404);

      const removed = await http()
        .delete(`${listUrl}/items/${products[1]}`)
        .set('Cookie', cookie)
        .expect(200);
      expect(removed.body.itemCount).toBe(1);

      await http().delete(listUrl).set('Cookie', cookie).expect(204);
      await http().get(listUrl).set('Cookie', cookie).expect(404);

      const defaultId = lists.body[0].id;
      const protectedDefault = await http()
        .delete(`${LIST_ROUTES.lists}/${defaultId}`)
        .set('Cookie', cookie)
        .expect(409);
      expect(protectedDefault.body.error.code).toBe(ErrorCode.LIST_DEFAULT_PROTECTED);
    });

    it("never exposes or changes another user's lists", async () => {
      const owner = await register();
      const intruder = await register();
      const [ownerList] = (await http().get(LIST_ROUTES.lists).set('Cookie', owner.cookie).expect(200)).body;
      const url = `${LIST_ROUTES.lists}/${ownerList.id}`;
      await http().post(`${url}/items`).set('Cookie', owner.cookie).send({ productId: products[0] }).expect(200);

      await http().get(url).set('Cookie', intruder.cookie).expect(404);
      await http().patch(url).set('Cookie', intruder.cookie).send({ name: 'Hacked' }).expect(404);
      await http().delete(url).set('Cookie', intruder.cookie).expect(404);
      await http().post(`${url}/items`).set('Cookie', intruder.cookie).send({ productId: products[1] }).expect(404);
      await http().delete(`${url}/items/${products[0]}`).set('Cookie', intruder.cookie).expect(404);

      const intact = await http().get(url).set('Cookie', owner.cookie).expect(200);
      expect(intact.body).toMatchObject({ name: DEFAULT_LIST_NAME, itemCount: 1 });
      const intruderLists = await http().get(LIST_ROUTES.lists).set('Cookie', intruder.cookie).expect(200);
      expect(intruderLists.body.map((l: { id: string }) => l.id)).not.toContain(ownerList.id);
    });
  });
});
