const prisma = require("@/lib/prisma");

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: () => Promise.resolve(body),
      status: init?.status || 200,
    })),
  },
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    ...init,
    json: () => Promise.resolve(init.body ? JSON.parse(init.body) : {}),
  })),
}));

beforeAll(async () => {
  console.log(prisma.$disconnect);
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  const models = Reflect.ownKeys(prisma).filter(
    (key) => typeof prisma[key].deleteMany === "function"
  );

  await prisma.$transaction(
    models.map((modelKey) => prisma[modelKey].deleteMany())
  );
});
