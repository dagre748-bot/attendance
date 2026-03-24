const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'yadnesh@gmail.com';
  const hashedPassword = await bcrypt.hash('password', 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  
  console.log(`Password for ${email} reset to 'password'`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
