const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const map = {
  ELECTRICITY: 'Electricity Board',
  WATER: 'Water Authority',
  ROADS: 'Roads & PWD',
  GARBAGE: 'Municipal Sanitation',
  STREET_LIGHTS: 'Street Lighting',
  EDUCATION: 'Education Department',
  PUBLIC_SAFETY: 'Public Safety',
  OTHER: 'Municipal Sanitation'
};
async function fix() {
  const depts = await prisma.department.findMany();
  const complaints = await prisma.complaint.findMany({ 
    where: { departmentId: null } 
  });
  console.log('Fixing', complaints.length, 'complaints');
  for (const c of complaints) {
    const d = depts.find(x => x.name === map[c.category]);
    if (d) {
      await prisma.complaint.update({ 
        where: { id: c.id }, 
        data: { departmentId: d.id } 
      });
      console.log('Fixed:', c.title, '->', d.name);
    }
  }
  console.log('Done!');
  await prisma.$disconnect();
}
fix().catch(console.error);
