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
        imageUrl: 'https://res.cloudinary.com/dsm9mtete/image/upload/v1772667655/cinamin_500g_ddj7hh.jpg',
      },
      {
        name: 'Chilli Infused Honey (500g)',
        description: 'Spicy chilli infused honey, 500g jar. Perfect for adding heat to your dishes.',
        price: 1450.0,
        category: 'Infused Honey',
        stock: 50,
        imageUrl: 'https://res.cloudinary.com/dsm9mtete/image/upload/v1772667656/chilli_500g_lheqpz.jpg',
      },
      {
        name: 'Acacia Honey (500g)',
        description: 'Pure acacia honey, 500g jar. Light and floral with natural sweetness.',
        price: 1380.0,
        category: 'Pure Honey',
        stock: 50,
        imageUrl: 'https://res.cloudinary.com/dsm9mtete/image/upload/v1772667656/acacia_500g_raeazc.jpg',
      },
      {
        name: 'Acacia Honey (250g)',
        description: 'Pure acacia honey, 250g jar. Light and floral with natural sweetness.',
        price: 850.0,
        category: 'Pure Honey',
        stock: 50,
        imageUrl: 'https://res.cloudinary.com/dsm9mtete/image/upload/v1772667659/acaciaa_250g_grsch6.png',
      },
      {
        name: 'Chilli Infused Honey (250g)',
        description: 'Spicy chilli infused honey, 250g jar. Perfect for adding heat to your dishes.',
        price: 930.0,
        category: 'Infused Honey',
        stock: 50,
        imageUrl: 'https://res.cloudinary.com/dsm9mtete/image/upload/v1772667656/chilli_infused_250g_placeholder.jpg',
      },
      {
        name: 'Cinnamon Infused Honey (250g)',
        description: 'Premium cinnamon infused honey, 250g jar. Rich in antioxidants and natural warmth.',
        price: 930.0,
        category: 'Infused Honey',
        stock: 50,
        imageUrl: 'https://res.cloudinary.com/dsm9mtete/image/upload/v1772667656/cinamin_infused_250g_lfq2ns.png',
      },
      {
        name: 'Gift Box (250g)',
        description: 'Premium honey gift box containing three carefully selected honey varieties: Cinnamon infused honey (250g), Chilli infused honey (250g), and Acacia honey (250g). Perfect for honey enthusiasts and special occasions.',
        price: 2450.0,
        category: 'Gift Sets',
        stock: 50,
        imageUrl: 'https://res.cloudinary.com/dsm9mtete/image/upload/v1772667655/giftbox_k1t9wx.jpg',
      },
    ];

    // Update or create products
    for (const product of products) {
      await prisma.product.upsert({
        where: { name: product.name },
        update: product,
        create: product,
      });
      console.log(`✅ Updated/Created: ${product.name}`);
    }

    console.log('\n✅ All 7 products synced successfully!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
