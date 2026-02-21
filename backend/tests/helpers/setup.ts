import { vi } from "vitest";

// Mock PrismaClient
export const mockPrisma = {
  card: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
  scrapeLog: {
    create: vi.fn(),
  },
  insightCache: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock Azure OpenAI
export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

vi.mock("openai", () => ({
  AzureOpenAI: vi.fn(() => mockOpenAI),
}));
