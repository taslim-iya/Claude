import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/company_data_platform';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@companydataplatform.com' },
    update: {},
    create: {
      email: 'admin@companydataplatform.com',
      name: 'Platform Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Create client user
  const clientHash = await bcrypt.hash('client123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Demo Client',
      passwordHash: clientHash,
      role: 'CLIENT',
    },
  });

  // Create client criteria
  await prisma.clientCriteria.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      criteria: {
        verifiedOnly: false,
        revenueMin: 0,
      },
      canEdit: true,
    },
  });

  // Create API key for client
  const apiKeyValue = `cdp_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(apiKeyValue).digest('hex');
  await prisma.apiKey.upsert({
    where: { keyHash },
    update: {},
    create: {
      userId: client.id,
      keyHash,
      keyPrefix: apiKeyValue.slice(0, 12),
      name: 'Demo API Key',
      rateLimit: 1000,
    },
  });
  console.log(`Client user: ${client.email}`);
  console.log(`Client API key: ${apiKeyValue}`);

  // Create sample companies
  const sampleCompanies = [
    { companyName: 'TechCorp Solutions Ltd', sicCode: '62020', industry: 'Technology', description: 'Software development and IT consulting', revenue: 5200000, profitBeforeTax: 850000, totalAssets: 8500000, netAssets: 4200000, website: 'https://techcorp.example.com' },
    { companyName: 'GreenEnergy Holdings PLC', sicCode: '35110', industry: 'Energy', description: 'Renewable energy generation and distribution', revenue: 45000000, profitBeforeTax: 7200000, totalAssets: 120000000, netAssets: 65000000, website: 'https://greenenergy.example.com' },
    { companyName: 'FinanceFirst Capital', sicCode: '64110', industry: 'Finance', description: 'Investment banking and financial advisory', revenue: 28000000, profitBeforeTax: 12000000, totalAssets: 250000000, netAssets: 85000000, website: 'https://financefirst.example.com' },
    { companyName: 'MediHealth Group', sicCode: '86101', industry: 'Healthcare', description: 'Private healthcare services and hospitals', revenue: 92000000, profitBeforeTax: 15000000, totalAssets: 180000000, netAssets: 95000000, website: 'https://medihealth.example.com' },
    { companyName: 'BuildRight Construction', sicCode: '41201', industry: 'Construction', description: 'Commercial and residential construction', revenue: 38000000, profitBeforeTax: 4800000, totalAssets: 52000000, netAssets: 28000000, website: 'https://buildright.example.com' },
    { companyName: 'RetailMax Holdings', sicCode: '47110', industry: 'Retail', description: 'Multi-channel retail operations', revenue: 156000000, profitBeforeTax: 8900000, totalAssets: 95000000, netAssets: 42000000, website: 'https://retailmax.example.com' },
    { companyName: 'DataStream Analytics', sicCode: '62090', industry: 'Technology', description: 'Big data analytics and AI solutions', revenue: 12000000, profitBeforeTax: 3500000, totalAssets: 18000000, netAssets: 11000000, website: 'https://datastream.example.com' },
    { companyName: 'LogiTrans Freight', sicCode: '49410', industry: 'Logistics', description: 'Freight transportation and warehousing', revenue: 67000000, profitBeforeTax: 5200000, totalAssets: 85000000, netAssets: 35000000, website: 'https://logitrans.example.com' },
    { companyName: 'EduLearn International', sicCode: '85422', industry: 'Education', description: 'Online education platform and courses', revenue: 8500000, profitBeforeTax: 2100000, totalAssets: 15000000, netAssets: 9500000, website: 'https://edulearn.example.com' },
    { companyName: 'AgroFresh Farms', sicCode: '01110', industry: 'Agriculture', description: 'Organic farming and food production', revenue: 22000000, profitBeforeTax: 3200000, totalAssets: 45000000, netAssets: 28000000, website: 'https://agrofresh.example.com' },
  ];

  for (const company of sampleCompanies) {
    await prisma.company.create({
      data: {
        ...company,
        sourceType: 'MANUAL_ENTRY',
        verificationStatus: 'UNREVIEWED',
      },
    });
  }

  console.log(`Created ${sampleCompanies.length} sample companies`);
  console.log('\nSeed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@companydataplatform.com / admin123');
  console.log('  Client: client@example.com / client123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
