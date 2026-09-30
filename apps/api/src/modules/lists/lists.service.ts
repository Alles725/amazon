import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  DEFAULT_LIST_NAME,
  ErrorCode,
  ListDetails,
  ListSummary,
  MAX_ITEMS_PER_LIST,
  MAX_LISTS_PER_USER,
} from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
import { ApiError } from '../../common/api-error';
import { PrismaService } from '../../common/prisma.service';
import { CATALOG_API, CatalogApi } from '../catalog/catalog.api';
import { ListsApi } from './lists.api';

type StoredList = Prisma.ListGetPayload<{ include: { _count: { select: { items: true } } } }>;
const withCount = { _count: { select: { items: true } } } as const;

@Injectable()
export class ListsService implements ListsApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_API) private readonly catalog: CatalogApi,
  ) {}

  async getLists(userId: string): Promise<ListSummary[]> {
    const read = () =>
      this.prisma.list.findMany({
        where: { userId },
        include: withCount,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
      });
    let lists = await read();
    if (!lists.some((list) => list.isDefault)) {
      await this.withLock(userId, (tx) => this.ensureDefault(userId, tx));
      lists = await read();
    }
    return lists.map(summary);
  }

  async createList(userId: string, name: string): Promise<ListSummary> {
    return this.withLock(userId, async (tx) => {
      await this.ensureDefault(userId, tx);
      if ((await tx.list.count({ where: { userId } })) >= MAX_LISTS_PER_USER)
        throw limitExceeded(`Você pode ter no máximo ${MAX_LISTS_PER_USER} listas.`);
      return summary(await tx.list.create({ data: { userId, name }, include: withCount }));
    });
  }

  async getList(userId: string, listId: string): Promise<ListDetails> {
    const list = await this.prisma.list.findFirst({
      where: { id: listId, userId },
      include: { items: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] } },
    });
    if (!list) throw ApiError.notFound('List');
    const products = await this.catalog.findByIds(list.items.map((item) => item.productId));
    const byId = new Map(products.map((product) => [product.id, product]));
    const items = list.items.flatMap((item) => {
      const product = byId.get(item.productId);
      return product
        ? [{ productId: item.productId, addedAt: item.createdAt.toISOString(), product }]
        : [];
    });
    return {
      id: list.id,
      name: list.name,
      isDefault: list.isDefault,
      itemCount: items.length,
      createdAt: list.createdAt.toISOString(),
      items,
    };
  }

  async renameList(userId: string, listId: string, name: string): Promise<ListSummary> {
    const renamed = await this.prisma.list.updateMany({
      where: { id: listId, userId },
      data: { name },
    });
    if (!renamed.count) throw ApiError.notFound('List');
    return summary(
      await this.prisma.list.findFirstOrThrow({ where: { id: listId }, include: withCount }),
    );
  }

  async deleteList(userId: string, listId: string): Promise<void> {
    await this.withLock(userId, async (tx) => {
      const list = await tx.list.findFirst({ where: { id: listId, userId } });
      if (!list) throw ApiError.notFound('List');
      if (list.isDefault)
        throw new ApiError(
          ErrorCode.LIST_DEFAULT_PROTECTED,
          'A lista padrão não pode ser excluída.',
          HttpStatus.CONFLICT,
        );
      await tx.list.delete({ where: { id: listId } });
    });
  }

  async addItem(userId: string, listId: string, productId: string): Promise<ListDetails> {
    // Catalog lookup stays outside the lock/transaction (same reason as the cart).
    const [product] = await this.catalog.findByIds([productId]);
    if (!product) throw ApiError.notFound('Product');
    await this.withLock(userId, async (tx) => {
      const list = await tx.list.findFirst({ where: { id: listId, userId }, include: withCount });
      if (!list) throw ApiError.notFound('List');
      const existing = await tx.listItem.findUnique({
        where: { listId_productId: { listId, productId } },
      });
      if (existing) return;
      if (list._count.items >= MAX_ITEMS_PER_LIST)
        throw limitExceeded(`Uma lista pode ter no máximo ${MAX_ITEMS_PER_LIST} itens.`);
      await tx.listItem.create({ data: { listId, productId } });
    });
    return this.getList(userId, listId);
  }

  async removeItem(userId: string, listId: string, productId: string): Promise<ListDetails> {
    const list = await this.prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) throw ApiError.notFound('List');
    await this.prisma.listItem.deleteMany({ where: { listId, productId } });
    return this.getList(userId, listId);
  }

  private async ensureDefault(userId: string, tx: Prisma.TransactionClient) {
    if (await tx.list.count({ where: { userId, isDefault: true } })) return;
    await tx.list.create({ data: { userId, name: DEFAULT_LIST_NAME, isDefault: true } });
  }

  /** One writer per account: keeps "exactly one default list" and the limits true
   * under concurrent requests without a partial unique index. */
  private withLock<T>(
    userId: string,
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const key = `lists:${userId}`;
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text`;
      return work(tx);
    });
  }
}

function summary(list: StoredList): ListSummary {
  return {
    id: list.id,
    name: list.name,
    isDefault: list.isDefault,
    itemCount: list._count.items,
    createdAt: list.createdAt.toISOString(),
  };
}

function limitExceeded(message: string) {
  return new ApiError(ErrorCode.LIST_LIMIT_EXCEEDED, message, HttpStatus.CONFLICT);
}
