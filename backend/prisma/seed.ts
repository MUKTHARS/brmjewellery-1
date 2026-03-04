import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@brmjewellery.co.uk';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@BRM2024!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.SUPERADMIN,
        firstName: 'BRM',
        lastName: 'Admin',
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // Seed categories with attribute templates
  const categories = [
    {
      name: 'Rings',
      slug: 'rings',
      description: 'Handcrafted rings in gold, silver and platinum',
      sortOrder: 1,
      attributes: [
        { name: 'ring_size', label: 'UK Ring Size', fieldType: 'SELECT', options: ['A', 'A½', 'B', 'B½', 'C', 'C½', 'D', 'D½', 'E', 'E½', 'F', 'F½', 'G', 'G½', 'H', 'H½', 'I', 'I½', 'J', 'J½', 'K', 'K½', 'L', 'L½', 'M', 'M½', 'N', 'N½', 'O', 'O½', 'P', 'P½', 'Q', 'Q½', 'R', 'R½', 'S', 'S½', 'T', 'T½', 'U', 'U½', 'V', 'V½', 'W', 'W½', 'X', 'X½', 'Y', 'Y½', 'Z', 'Z½', 'Z+1', 'Z+2'], isRequired: true, isFilterable: true, sortOrder: 1 },
        { name: 'metal_type', label: 'Metal Type', fieldType: 'SELECT', options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'], isRequired: true, isFilterable: true, sortOrder: 2 },
        { name: 'carat', label: 'Carat', fieldType: 'SELECT', options: ['9k', '14k', '18k', '22k', '24k', '925', '950'], isRequired: true, isFilterable: true, sortOrder: 3 },
        { name: 'band_width_mm', label: 'Band Width (mm)', fieldType: 'NUMBER', options: [], isRequired: false, isFilterable: false, sortOrder: 4 },
        { name: 'weight_grams', label: 'Weight (grams)', fieldType: 'DECIMAL', options: [], isRequired: false, isFilterable: false, sortOrder: 5 },
        { name: 'stone_type', label: 'Stone Type', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: true, sortOrder: 6 },
        { name: 'stone_setting', label: 'Stone Setting', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: false, sortOrder: 7 },
        { name: 'hallmark', label: 'Hallmark', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: false, sortOrder: 8 },
        { name: 'finish', label: 'Finish', fieldType: 'SELECT', options: ['Polished', 'Matte', 'Brushed', 'Hammered'], isRequired: false, isFilterable: true, sortOrder: 9 },
      ],
    },
    {
      name: 'Chains & Necklaces',
      slug: 'chains-necklaces',
      description: 'Elegant chains and necklaces in precious metals',
      sortOrder: 2,
      attributes: [
        { name: 'length', label: 'Length', fieldType: 'SELECT', options: ['14"', '16"', '18"', '20"', '22"', '24"', 'Custom'], isRequired: true, isFilterable: true, sortOrder: 1 },
        { name: 'chain_style', label: 'Chain Style', fieldType: 'SELECT', options: ['Belcher', 'Figaro', 'Curb', 'Rope', 'Box', 'Snake', 'Trace'], isRequired: false, isFilterable: true, sortOrder: 2 },
        { name: 'metal_type', label: 'Metal Type', fieldType: 'SELECT', options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'], isRequired: true, isFilterable: true, sortOrder: 3 },
        { name: 'carat', label: 'Carat', fieldType: 'SELECT', options: ['9k', '14k', '18k', '22k', '24k', '925', '950'], isRequired: true, isFilterable: true, sortOrder: 4 },
        { name: 'width_mm', label: 'Width (mm)', fieldType: 'NUMBER', options: [], isRequired: false, isFilterable: false, sortOrder: 5 },
        { name: 'weight_grams', label: 'Weight (grams)', fieldType: 'DECIMAL', options: [], isRequired: false, isFilterable: false, sortOrder: 6 },
        { name: 'clasp_type', label: 'Clasp Type', fieldType: 'SELECT', options: ['Lobster', 'Spring Ring', 'Toggle', 'Box'], isRequired: false, isFilterable: false, sortOrder: 7 },
        { name: 'hallmark', label: 'Hallmark', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: false, sortOrder: 8 },
      ],
    },
    {
      name: 'Bracelets',
      slug: 'bracelets',
      description: 'Stunning bracelets for every occasion',
      sortOrder: 3,
      attributes: [
        { name: 'length_mm', label: 'Length (mm)', fieldType: 'NUMBER', options: [], isRequired: false, isFilterable: false, sortOrder: 1 },
        { name: 'style', label: 'Style', fieldType: 'SELECT', options: ['Bangle', 'Tennis', 'Chain', 'Charm', 'Cuff'], isRequired: false, isFilterable: true, sortOrder: 2 },
        { name: 'metal_type', label: 'Metal Type', fieldType: 'SELECT', options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'], isRequired: true, isFilterable: true, sortOrder: 3 },
        { name: 'carat', label: 'Carat', fieldType: 'SELECT', options: ['9k', '14k', '18k', '22k', '24k', '925', '950'], isRequired: true, isFilterable: true, sortOrder: 4 },
        { name: 'width_mm', label: 'Width (mm)', fieldType: 'NUMBER', options: [], isRequired: false, isFilterable: false, sortOrder: 5 },
        { name: 'weight_grams', label: 'Weight (grams)', fieldType: 'DECIMAL', options: [], isRequired: false, isFilterable: false, sortOrder: 6 },
        { name: 'clasp_type', label: 'Clasp Type', fieldType: 'SELECT', options: ['Lobster', 'Spring Ring', 'Toggle', 'Box', 'Hook'], isRequired: false, isFilterable: false, sortOrder: 7 },
        { name: 'stone_type', label: 'Stone Type', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: true, sortOrder: 8 },
        { name: 'hallmark', label: 'Hallmark', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: false, sortOrder: 9 },
      ],
    },
    {
      name: 'Earrings',
      slug: 'earrings',
      description: 'Exquisite earrings from studs to drops',
      sortOrder: 4,
      attributes: [
        { name: 'style', label: 'Style', fieldType: 'SELECT', options: ['Stud', 'Drop', 'Hoop', 'Huggie', 'Chandelier', 'Cluster'], isRequired: true, isFilterable: true, sortOrder: 1 },
        { name: 'fitting', label: 'Fitting', fieldType: 'SELECT', options: ['Butterfly Back', 'Screw Back', 'Hook', 'Lever Back', 'Clip-On'], isRequired: false, isFilterable: false, sortOrder: 2 },
        { name: 'metal_type', label: 'Metal Type', fieldType: 'SELECT', options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'], isRequired: true, isFilterable: true, sortOrder: 3 },
        { name: 'carat', label: 'Carat', fieldType: 'SELECT', options: ['9k', '14k', '18k', '22k', '24k', '925', '950'], isRequired: true, isFilterable: true, sortOrder: 4 },
        { name: 'stone_type', label: 'Stone Type', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: true, sortOrder: 5 },
        { name: 'weight_per_pair', label: 'Weight per pair (grams)', fieldType: 'DECIMAL', options: [], isRequired: false, isFilterable: false, sortOrder: 6 },
        { name: 'hoop_diameter_mm', label: 'Hoop Diameter (mm)', fieldType: 'NUMBER', options: [], isRequired: false, isFilterable: false, sortOrder: 7 },
        { name: 'hallmark', label: 'Hallmark', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: false, sortOrder: 8 },
      ],
    },
    {
      name: 'Pendants',
      slug: 'pendants',
      description: 'Beautiful pendants in precious metals',
      sortOrder: 5,
      attributes: [
        { name: 'height_mm', label: 'Height (mm)', fieldType: 'NUMBER', options: [], isRequired: false, isFilterable: false, sortOrder: 1 },
        { name: 'width_mm', label: 'Width (mm)', fieldType: 'NUMBER', options: [], isRequired: false, isFilterable: false, sortOrder: 2 },
        { name: 'metal_type', label: 'Metal Type', fieldType: 'SELECT', options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'], isRequired: true, isFilterable: true, sortOrder: 3 },
        { name: 'carat', label: 'Carat', fieldType: 'SELECT', options: ['9k', '14k', '18k', '22k', '24k', '925', '950'], isRequired: true, isFilterable: true, sortOrder: 4 },
        { name: 'stone_type', label: 'Stone Type', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: true, sortOrder: 5 },
        { name: 'weight_grams', label: 'Weight (grams)', fieldType: 'DECIMAL', options: [], isRequired: false, isFilterable: false, sortOrder: 6 },
        { name: 'chain_included', label: 'Chain Included', fieldType: 'BOOLEAN', options: [], isRequired: false, isFilterable: true, sortOrder: 7 },
        { name: 'hallmark', label: 'Hallmark', fieldType: 'TEXT', options: [], isRequired: false, isFilterable: false, sortOrder: 8 },
      ],
    },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sortOrder: cat.sortOrder,
        },
      });

      const template = await prisma.categoryAttributeTemplate.create({
        data: { categoryId: created.id },
      });

      await prisma.attributeField.createMany({
        data: cat.attributes.map((attr) => ({
          templateId: template.id,
          name: attr.name,
          label: attr.label,
          fieldType: attr.fieldType as any,
          options: attr.options,
          isRequired: attr.isRequired,
          isFilterable: attr.isFilterable,
          sortOrder: attr.sortOrder,
        })),
      });

      console.log(`✅ Category created: ${cat.name}`);
    } else {
      console.log(`ℹ️  Category already exists: ${cat.name}`);
    }
  }

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
