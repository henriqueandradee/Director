import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database to apply schema...');
  
  const sqlContent = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf-8');
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await prisma.$executeRawUnsafe(statement);
    } catch (err: any) {
      // Ignore if table/enum already exists
      if (err.message.includes('already exists')) {
        console.log('-> Already exists, skipping.');
      } else {
        console.error('-> Error:', err.message);
      }
    }
  }
  
  console.log('✅ Schema applied successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
