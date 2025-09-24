import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco...");

  await prisma.user.create({
    data: {
      name: "Jessica",
      email: "jessica@example.com",
    },
  });

  console.log("Banco de dados propagado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
