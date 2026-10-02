import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CARD_BRANDS,
  CardBrand,
  ErrorCode,
  MAX_SAVED_CARDS,
  PaymentCardInput,
  SavedPaymentCard,
  isCardExpired,
} from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
import { ApiError } from '../../common/api-error';
import { PrismaService } from '../../common/prisma.service';
import { UserPaymentCardsApi } from './users.api';

@Injectable()
export class PaymentCardsRepository implements UserPaymentCardsApi {
  constructor(private readonly prisma: PrismaService) {}

  async listCards(userId: string): Promise<SavedPaymentCard[]> {
    const cards = await this.prisma.paymentCard.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return cards.map(publicCard);
  }
  async addCard(userId: string, input: PaymentCardInput): Promise<SavedPaymentCard> {
    if (isCardExpired(input))
      throw new ApiError(ErrorCode.PAYMENT_INVALID, 'Cartão vencido.', HttpStatus.BAD_REQUEST);
    // Per-user advisory lock so two concurrent adds cannot both pass the limit check.
    const key = `payment-cards:${userId}`;
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text`;
      if ((await tx.paymentCard.count({ where: { userId } })) >= MAX_SAVED_CARDS)
        throw new ApiError(
          ErrorCode.CARD_LIMIT_EXCEEDED,
          `Você pode salvar no máximo ${MAX_SAVED_CARDS} cartões.`,
          HttpStatus.CONFLICT,
        );
      return publicCard(await tx.paymentCard.create({ data: { ...input, userId } }));
    });
  }
  async deleteCard(userId: string, id: string): Promise<SavedPaymentCard[]> {
    const deleted = await this.prisma.paymentCard.deleteMany({ where: { id, userId } });
    if (!deleted.count) throw ApiError.notFound('Payment card');
    return this.listCards(userId);
  }
  async findCard(
    userId: string,
    id: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<SavedPaymentCard | null> {
    const card = await tx.paymentCard.findFirst({ where: { id, userId } });
    return card ? publicCard(card) : null;
  }
}

function publicCard(card: {
  id: string;
  brand: string;
  last4: string;
  holderName: string;
  expMonth: number;
  expYear: number;
}): SavedPaymentCard {
  const { id, brand, last4, holderName, expMonth, expYear } = card;
  if (!(CARD_BRANDS as readonly string[]).includes(brand))
    throw new Error(`Unknown card brand stored: ${brand}`);
  return { id, brand: brand as CardBrand, last4, holderName, expMonth, expYear };
}
