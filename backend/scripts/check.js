const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const complaints = await prisma.complaint.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      departmentId: true
    }
  });
  console.log('Total complaints:', complaints.length);
  complaints.forEach(c => {
    console.log('---');
    console.log('Title:', c.title);
    console.log('Category:', c.category);
    console.log('DepartmentId:', c.departmentId);
  });
  await prisma.$disconnect();
}
check().catch(console.error);
