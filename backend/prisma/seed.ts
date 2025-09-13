import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nigerian cities and states data
const nigerianLocations = [
  { city: 'Lagos', state: 'Lagos' },
  { city: 'Abuja', state: 'FCT' },
  { city: 'Port Harcourt', state: 'Rivers' },
  { city: 'Kano', state: 'Kano' },
  { city: 'Ibadan', state: 'Oyo' },
  { city: 'Kaduna', state: 'Kaduna' },
  { city: 'Benin City', state: 'Edo' },
  { city: 'Jos', state: 'Plateau' },
  { city: 'Ilorin', state: 'Kwara' },
  { city: 'Aba', state: 'Abia' },
  { city: 'Enugu', state: 'Enugu' },
  { city: 'Warri', state: 'Delta' },
  { city: 'Calabar', state: 'Cross River' },
  { city: 'Akure', state: 'Ondo' },
  { city: 'Abeokuta', state: 'Ogun' },
];

// Nigerian names data
const nigerianNames = [
  { firstName: 'Adebayo', lastName: 'Ogundimu' },
  { firstName: 'Chioma', lastName: 'Nwosu' },
  { firstName: 'Kemi', lastName: 'Adeyemi' },
  { firstName: 'Emeka', lastName: 'Okafor' },
  { firstName: 'Fatima', lastName: 'Ibrahim' },
  { firstName: 'Tunde', lastName: 'Bakare' },
  { firstName: 'Ngozi', lastName: 'Okoro' },
  { firstName: 'Bashir', lastName: 'Abdullahi' },
  { firstName: 'Folake', lastName: 'Ogundipe' },
  { firstName: 'Chinedu', lastName: 'Eze' },
  { firstName: 'Aisha', lastName: 'Garba' },
  { firstName: 'Segun', lastName: 'Adeleke' },
  { firstName: 'Blessing', lastName: 'Etim' },
  { firstName: 'Ibrahim', lastName: 'Musa' },
  { firstName: 'Funmi', lastName: 'Akinola' },
  { firstName: 'Victor', lastName: 'Udoh' },
  { firstName: 'Amina', lastName: 'Bello' },
  { firstName: 'Olumide', lastName: 'Fashola' },
  { firstName: 'Grace', lastName: 'Okpara' },
  { firstName: 'Ahmed', lastName: 'Tijani' },
];

// Sample listing data for Nigerian context
const listingsData = [
  {
    title: 'iPhone 13 Pro Max 256GB',
    description: 'Barely used iPhone 13 Pro Max in excellent condition. No scratches, comes with original charger and box.',
    category: 'ELECTRONICS',
    subcategory: 'Smartphones',
    condition: 'LIKE_NEW',
    priceInKobo: 85000000, // 850,000 Naira
    swapPreferences: ['Electronics', 'Laptops'],
  },
  {
    title: 'MacBook Air M2 2022',
    description: 'Brand new MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Still under warranty.',
    category: 'ELECTRONICS',
    subcategory: 'Laptops',
    condition: 'NEW',
    priceInKobo: 120000000, // 1,200,000 Naira
    swapPreferences: ['Electronics', 'Smartphones'],
  },
  {
    title: 'Toyota Camry 2015',
    description: 'Clean Toyota Camry 2015 model, leather seats, AC working perfectly, new tires.',
    category: 'VEHICLES',
    subcategory: 'Cars',
    condition: 'GOOD',
    priceInKobo: 650000000, // 6,500,000 Naira
    swapPreferences: ['Vehicles', 'Land'],
  },
  {
    title: 'Nike Air Jordan Retro 11',
    description: 'Authentic Nike Air Jordan Retro 11 sneakers, size 42, worn only twice.',
    category: 'FASHION',
    subcategory: 'Shoes',
    condition: 'LIKE_NEW',
    priceInKobo: 8500000, // 85,000 Naira
    swapPreferences: ['Fashion', 'Electronics'],
  },
  {
    title: 'Samsung 55-inch Smart TV',
    description: '55-inch Samsung QLED Smart TV with 4K resolution, Netflix, YouTube built-in.',
    category: 'ELECTRONICS',
    subcategory: 'TVs',
    condition: 'GOOD',
    priceInKobo: 45000000, // 450,000 Naira
    swapPreferences: ['Electronics', 'Furniture'],
  },
  {
    title: 'Generator 10KVA Perkins',
    description: 'Perkins 10KVA generator, very reliable, low fuel consumption, serviced recently.',
    category: 'APPLIANCES',
    subcategory: 'Generators',
    condition: 'GOOD',
    priceInKobo: 280000000, // 2,800,000 Naira
    swapPreferences: ['Appliances', 'Electronics'],
  },
  {
    title: 'Office Desk and Chair Set',
    description: 'Executive office desk with matching swivel chair, solid wood construction.',
    category: 'FURNITURE',
    subcategory: 'Office Furniture',
    condition: 'GOOD',
    priceInKobo: 15000000, // 150,000 Naira
    swapPreferences: ['Furniture', 'Electronics'],
  },
  {
    title: 'PlayStation 5 Console',
    description: 'Brand new PS5 console with extra controller and FIFA 24 game included.',
    category: 'ELECTRONICS',
    subcategory: 'Gaming',
    condition: 'NEW',
    priceInKobo: 75000000, // 750,000 Naira
    swapPreferences: ['Electronics', 'Gaming'],
  },
  {
    title: 'Honda Accord 2018',
    description: 'Honda Accord 2018, clean papers, AC chilling, automatic transmission.',
    category: 'VEHICLES',
    subcategory: 'Cars',
    condition: 'GOOD',
    priceInKobo: 800000000, // 8,000,000 Naira
    swapPreferences: ['Vehicles', 'Land'],
  },
  {
    title: 'Refrigerator Double Door LG',
    description: 'LG double door refrigerator, 350 liters, energy efficient, 2 years old.',
    category: 'APPLIANCES',
    subcategory: 'Refrigerators',
    condition: 'GOOD',
    priceInKobo: 25000000, // 250,000 Naira
    swapPreferences: ['Appliances', 'Electronics'],
  },
];

// Additional listings to reach 50 total
const additionalListings = [
  {
    title: 'Ankara Fabric Collection',
    description: 'Beautiful collection of authentic Ankara fabrics, various patterns and colors.',
    category: 'FASHION',
    subcategory: 'Fabrics',
    condition: 'NEW',
    priceInKobo: 1200000, // 12,000 Naira
    isSwapOnly: true,
    acceptsCash: false,
    swapPreferences: ['Fashion', 'Beauty'],
  },
  {
    title: 'Canon EOS 80D Camera',
    description: 'Professional DSLR camera with 18-55mm lens, perfect for photography business.',
    category: 'ELECTRONICS',
    subcategory: 'Cameras',
    condition: 'LIKE_NEW',
    priceInKobo: 55000000, // 550,000 Naira
    swapPreferences: ['Electronics', 'Appliances'],
  },
  {
    title: 'Dining Table Set for 6',
    description: 'Solid wood dining table with 6 chairs, perfect for family dinners.',
    category: 'FURNITURE',
    subcategory: 'Dining Sets',
    condition: 'GOOD',
    priceInKobo: 18000000, // 180,000 Naira
    swapPreferences: ['Furniture', 'Appliances'],
  },
  {
    title: 'Yamaha Keyboard PSR-E373',
    description: 'Yamaha electronic keyboard, 61 keys, perfect for learning music.',
    category: 'ELECTRONICS',
    subcategory: 'Musical Instruments',
    condition: 'LIKE_NEW',
    priceInKobo: 8000000, // 80,000 Naira
    swapPreferences: ['Electronics', 'Books'],
  },
  {
    title: 'HP LaserJet Printer',
    description: 'HP LaserJet Pro printer, wireless, perfect for office or home use.',
    category: 'ELECTRONICS',
    subcategory: 'Printers',
    condition: 'GOOD',
    priceInKobo: 12000000, // 120,000 Naira
    swapPreferences: ['Electronics', 'Furniture'],
  },
];

async function main() {
  console.log('Starting database seed...');

  // Create users
  console.log('Creating users...');
  const users: any[] = [];
  for (let i = 0; i < 20; i++) {
    const name = nigerianNames[i];
    const location = nigerianLocations[i % nigerianLocations.length];
    
    const user = await prisma.user.create({
      data: {
        email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@example.com`,
        phoneNumber: `+234${Math.floor(Math.random() * 900000000) + 800000000}`,
        password: '$argon2id$v=19$m=65536,t=3,p=4$ZXhhbXBsZXNhbHQ$J2mY+0eO4L5+Hq5I7J3vI1YqL5J8vI1YqL5J8vI1YqL', // Default password hash for "TempPassword123!"
        firstName: name.firstName,
        lastName: name.lastName,
        displayName: `${name.firstName} ${name.lastName}`,
        city: location.city,
        state: location.state,
        address: `${Math.floor(Math.random() * 100) + 1} ${['Allen Avenue', 'Victoria Island', 'Ikeja GRA', 'Garki', 'Wuse 2'][Math.floor(Math.random() * 5)]}`,
        isPhoneVerified: Math.random() > 0.3,
        isEmailVerified: Math.random() > 0.2,
        wallet: {
          create: {
            balanceInKobo: Math.floor(Math.random() * 10000000), // Random balance up to 100,000 Naira
            totalEarnedInKobo: Math.floor(Math.random() * 50000000),
            totalSpentInKobo: Math.floor(Math.random() * 30000000),
          },
        },
      },
    });
    users.push(user);
  }

  // Create listings
  console.log('Creating listings...');
  const listings: any[] = [];
  const allListings = [...listingsData, ...additionalListings];
  
  for (let i = 0; i < Math.min(50, allListings.length); i++) {
    const listingData = allListings[i % allListings.length];
    const user = users[Math.floor(Math.random() * users.length)];
    const location = nigerianLocations[Math.floor(Math.random() * nigerianLocations.length)];
    
    const listing = await prisma.listing.create({
      data: {
        title: listingData.title,
        description: listingData.description,
        category: listingData.category as any,
        subcategory: listingData.subcategory,
        condition: listingData.condition as any,
        priceInKobo: listingData.priceInKobo,
        isSwapOnly: (listingData as any).isSwapOnly || false,
        acceptsCash: (listingData as any).acceptsCash !== false,
        acceptsSwap: true,
        swapPreferences: listingData.swapPreferences,
        city: location.city,
        state: location.state,
        specificLocation: `Near ${['Market', 'Mall', 'School', 'Hospital', 'Bus Stop'][Math.floor(Math.random() * 5)]}`,
        viewCount: Math.floor(Math.random() * 1000),
        favoriteCount: Math.floor(Math.random() * 50),
        userId: user.id,
      },
    });
    listings.push(listing);
  }

  // Create offers
  console.log('Creating offers...');
  for (let i = 0; i < 30; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const listing = listings[Math.floor(Math.random() * listings.length)];
    const receiver = await prisma.user.findUnique({ where: { id: listing.userId } });
    
    if (sender.id !== receiver?.id) {
      const offerTypes = ['CASH', 'SWAP', 'HYBRID'];
      const offerType = offerTypes[Math.floor(Math.random() * offerTypes.length)];
      
      const offerData: any = {
        offerType: offerType as any,
        cashAmountInKobo: offerType !== 'SWAP' ? Math.floor(listing.priceInKobo! * (0.8 + Math.random() * 0.4)) : null,
        message: 'I am interested in this item. Can we discuss?',
        status: ['PENDING', 'ACCEPTED', 'REJECTED'][Math.floor(Math.random() * 3)] as any,
        senderId: sender.id,
        receiverId: receiver!.id,
        listingId: listing.id,
      };

      const offer = await prisma.offer.create({
        data: offerData,
      });

      // If it's a swap or hybrid offer, add some offered listings
      if (offerType !== 'CASH') {
        const senderListings = await prisma.listing.findMany({
          where: {
            userId: sender.id,
            isActive: true,
            id: { not: listing.id },
          },
          take: Math.floor(Math.random() * 2) + 1, // 1-2 listings
        });

        if (senderListings.length > 0) {
          await prisma.offerListing.createMany({
            data: senderListings.map(senderListing => ({
              offerId: offer.id,
              listingId: senderListing.id,
            })),
          });
        }
      }
    }
  }

  // Create transactions
  console.log('Creating transactions...');
  for (let i = 0; i < 20; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users[Math.floor(Math.random() * users.length)];
    
    if (sender.id !== receiver.id) {
      await prisma.transaction.create({
        data: {
          type: ['PURCHASE', 'SALE', 'ESCROW_DEPOSIT'][Math.floor(Math.random() * 3)] as any,
          amountInKobo: Math.floor(Math.random() * 50000000) + 1000000,
          status: ['COMPLETED', 'PENDING', 'FAILED'][Math.floor(Math.random() * 3)] as any,
          paymentMethod: ['BANK_TRANSFER', 'CARD', 'WALLET'][Math.floor(Math.random() * 3)] as any,
          paymentProvider: ['PAYSTACK', 'FLUTTERWAVE'][Math.floor(Math.random() * 2)] as any,
          paymentReference: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          senderId: sender.id,
          receiverId: receiver.id,
        },
      });
    }
  }

  // Create chats and messages
  console.log('Creating chats and messages...');
  for (let i = 0; i < 15; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users[Math.floor(Math.random() * users.length)];
    
    if (sender.id !== receiver.id) {
      const chat = await prisma.chat.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
        },
      });

      // Add some messages to the chat
      const messages = [
        'Hello, I am interested in your item',
        'Is it still available?',
        'Can we meet to discuss?',
        'What is your best price?',
        'Thank you for your time',
      ];

      for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
        await prisma.message.create({
          data: {
            content: messages[j % messages.length],
            messageType: 'TEXT',
            isRead: Math.random() > 0.5,
            senderId: j % 2 === 0 ? sender.id : receiver.id,
            chatId: chat.id,
          },
        });
      }
    }
  }

  // Create reviews
  console.log('Creating reviews...');
  for (let i = 0; i < 25; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users[Math.floor(Math.random() * users.length)];
    const listing = listings[Math.floor(Math.random() * listings.length)];
    
    if (sender.id !== receiver.id) {
      const comments = [
        'Great seller, very honest and reliable',
        'Item was exactly as described',
        'Fast delivery and good communication',
        'Highly recommended seller',
        'Professional and trustworthy',
        'Item in perfect condition',
        'Would buy from again',
      ];

      await prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
          comment: comments[Math.floor(Math.random() * comments.length)],
          reviewType: 'BUYER_TO_SELLER',
          senderId: sender.id,
          receiverId: receiver.id,
          listingId: listing.id,
        },
      });
    }
  }

  // Create verifications
  console.log('Creating verifications...');
  for (let i = 0; i < 15; i++) {
    const user = users[i];
    const verificationTypes = ['PHONE', 'EMAIL', 'BVN', 'NIN'];
    
    await prisma.verification.create({
      data: {
        type: verificationTypes[Math.floor(Math.random() * verificationTypes.length)] as any,
        status: ['VERIFIED', 'PENDING', 'REJECTED'][Math.floor(Math.random() * 3)] as any,
        documentNumber: Math.random().toString(36).substring(2, 15),
        verifiedAt: Math.random() > 0.5 ? new Date() : null,
        userId: user.id,
      },
    });
  }

  // Create notifications
  console.log('Creating notifications...');
  for (let i = 0; i < 40; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const notificationTypes = ['OFFER_RECEIVED', 'MESSAGE_RECEIVED', 'PAYMENT_RECEIVED', 'REVIEW_RECEIVED'];
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    const titles = {
      OFFER_RECEIVED: 'New Offer Received',
      MESSAGE_RECEIVED: 'New Message',
      PAYMENT_RECEIVED: 'Payment Received',
      REVIEW_RECEIVED: 'New Review',
    };

    const messages = {
      OFFER_RECEIVED: 'You have received a new offer on your listing',
      MESSAGE_RECEIVED: 'You have a new message from a buyer',
      PAYMENT_RECEIVED: 'Payment has been received for your item',
      REVIEW_RECEIVED: 'Someone left a review for you',
    };

    await prisma.notification.create({
      data: {
        type: type as any,
        title: titles[type as keyof typeof titles],
        message: messages[type as keyof typeof messages],
        isRead: Math.random() > 0.6,
        readAt: Math.random() > 0.6 ? new Date() : null,
        userId: user.id,
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log(`Created:`);
  console.log(`- ${users.length} users`);
  console.log(`- ${listings.length} listings`);
  console.log(`- 30 offers`);
  console.log(`- 20 transactions`);
  console.log(`- 15 chats with messages`);
  console.log(`- 25 reviews`);
  console.log(`- 15 verifications`);
  console.log(`- 40 notifications`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });