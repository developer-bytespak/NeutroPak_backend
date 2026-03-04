import { prisma } from '../src/lib/prisma';

async function seedProducts() {
  try {
    const products = [
      {
        name: 'Cinnamon Infused Honey (500g)',
        description: 'Premium cinnamon infused honey, 500g jar. Rich in antioxidants and natural warmth.',
        price: 1450.0,
        category: 'Infused Honey',
        stock: 50,
        imageUrl: null,
      },
      {
        name: 'Chilli Infused Honey (500g)',
        description: 'Spicy chilli infused honey, 500g jar. Perfect for adding heat to your dishes.',
        price: 1450.0,
        category: 'Infused Honey',
        stock: 50,
        imageUrl: null,
      },
      {
        name: 'Acacia Honey (500g)',
        description: 'Pure acacia honey, 500g jar. Light and floral with natural sweetness.',
        price: 1380.0,
        category: 'Pure Honey',
        stock: 50,
        imageUrl: null,
      },
      {
        name: 'Acacia Honey (250g)',
        description: 'Pure acacia honey, 250g jar. Light and floral with natural sweetness.',
        price: 850.0,
        category: 'Pure Honey',
        stock: 50,
        imageUrl: null,
      },
      {
        name: 'Chilli Infused Honey (250g)',
        description: 'Spicy chilli infused honey, 250g jar. Perfect for adding heat to your dishes.',
        price: 930.0,
        category: 'Infused Honey',
        stock: 50,
        imageUrl: null,
      },
      {
        name: 'Cinnamon Infused Honey (250g)',
        description: 'Premium cinnamon infused honey, 250g jar. Rich in antioxidants and natural warmth.',
        price: 930.0,
        category: 'Infused Honey',
        stock: 50,
        imageUrl: null,
      },
      {
        name: 'Gift Box (250g)',
        description: 'Premium honey gift box (250g). Perfect for special occasions and gifts.',
        price: 2450.0,
        category: 'Gift Sets',
        stock: 50,
        imageUrl: null,
      },
    ];

    // Delete existing products first (optional - comment out if you want to keep existing products)
    await prisma.product.deleteMany({});

    // Create new products
    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
      console.log(`✅ Created: ${product.name}`);
    }

    console.log('\n✅ All 7 products seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
