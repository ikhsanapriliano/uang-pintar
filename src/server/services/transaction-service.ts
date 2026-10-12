import { randomInt } from "crypto";
import { db } from "@/server/db";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const toFloat = (value: string | number) =>
  typeof value === "number"
    ? value
    : Number(String(value).replace(/[^\d.]/g, "")) || 0;

export const generateTrxId = () => {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHANUMERIC[randomInt(ALPHANUMERIC.length)];
  }
  return `TRX-${code}`;
};

export const mapDetails = (
  details: { name: string; amount: string | number }[],
) => details.map((d) => ({ name: d.name, amount: toFloat(d.amount) }));

export const sumDetails = (details: { amount: number }[]) =>
  details.reduce((sum, d) => sum + d.amount, 0);

export type TransactionInput = {
  category: "INCOME" | "EXPENSE";
  purpose: string;
  details: { name: string; amount: string | number }[];
  trx_date?: Date | null;
};

export const createTransaction = async (
  userId: string,
  input: TransactionInput,
) => {
  const details = mapDetails(input.details);
  const totalAmount = sumDetails(details);
  const balanceDelta = input.category === "INCOME" ? totalAmount : -totalAmount;
  await db.$transaction([
    db.transaction.create({
      data: {
        userId,
        trxId: generateTrxId(),
        trxDate: input.trx_date ?? new Date(),
        category: input.category,
        purpose: input.purpose,
        totalAmount,
        details: { create: details },
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { balance: { increment: balanceDelta } },
    }),
  ]);
};

export const updateTransaction = async (
  userId: string,
  id: string,
  input: TransactionInput,
) => {
  const existing = await db.transaction.findFirst({ where: { id, userId } });
  if (!existing) return false;
  const oldDelta =
    existing.category === "INCOME"
      ? existing.totalAmount
      : -existing.totalAmount;
  const details = mapDetails(input.details);
  const newAmount = sumDetails(details);
  const newDelta = input.category === "INCOME" ? newAmount : -newAmount;
  await db.$transaction([
    db.transaction.update({
      where: { id },
      data: {
        trxDate: input.trx_date ?? undefined,
        category: input.category,
        purpose: input.purpose,
        totalAmount: newAmount,
        details: { deleteMany: {}, create: details },
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { balance: { increment: newDelta - oldDelta } },
    }),
  ]);
  return true;
};

export const deleteTransaction = async (userId: string, id: string) => {
  const existing = await db.transaction.findFirst({ where: { id, userId } });
  if (!existing) return false;
  const balanceDelta =
    existing.category === "INCOME"
      ? -existing.totalAmount
      : existing.totalAmount;
  await db.$transaction([
    db.transaction.deleteMany({ where: { id, userId } }),
    db.user.update({
      where: { id: userId },
      data: { balance: { increment: balanceDelta } },
    }),
  ]);
  return true;
};
