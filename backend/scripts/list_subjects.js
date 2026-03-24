const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teacherId = 'e8055052-6025-4bb5-a715-ae2f566d577b';
  const subjects = await prisma.subject.findMany({
    where: { class: { teacherId } },
    include: { class: true }
  });
  console.log(JSON.stringify(subjects, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
