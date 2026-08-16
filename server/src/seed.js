import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Product from './models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/silverhands';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed]: Connected to MongoDB at', MONGODB_URI);

    // Clear existing services, products, and seeded test users
    await Service.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({ email: /@silverhands\.demo/ });

    console.log('[Seed]: Cleaned up old demo listings and seeded accounts.');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 15 Realistic Fictional Senior & Homemaker Skill Providers
    const providerProfiles = [
      {
        name: 'Lakshmi Ammal',
        email: 'lakshmi@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 62,
        phone: '+919840123451',
        bio: 'Homemaker with 30 years of expertise in traditional South Indian tailoring, custom blouse stitching, and embroidery.',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Tailoring', experienceYears: 30, level: 'Expert' },
          { name: 'Blouse Stitching', experienceYears: 25, level: 'Expert' },
          { name: 'Embroidery', experienceYears: 15, level: 'Intermediate' }
        ],
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
        languages: ['Tamil', 'English'],
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], timePreferences: ['Morning', 'Afternoon'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 4.9,
        verification: { status: 'verified' }
      },
      {
        name: 'Savitri Sundaram',
        email: 'savitri@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 68,
        phone: '+919840123452',
        bio: 'Retired high school Mathematics teacher offering warm, patient home tuition for school students.',
        profileImage: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Mathematics Tuition', experienceYears: 35, level: 'Expert' },
          { name: 'Science Mentoring', experienceYears: 25, level: 'Expert' }
        ],
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0418, longitude: 80.2341 },
        languages: ['Tamil', 'English'],
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'], timePreferences: ['Evening'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 4.8,
        verification: { status: 'verified' }
      },
      {
        name: 'Meenakshi Ramachandran',
        email: 'meenakshi@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 58,
        phone: '+919840123453',
        bio: 'Passionate cook specializing in authentic Iyengar style pickles, podis, and traditional festival sweets.',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Traditional Cooking', experienceYears: 25, level: 'Expert' },
          { name: 'Pickle Making', experienceYears: 20, level: 'Expert' }
        ],
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0674, longitude: 80.2376 },
        languages: ['Tamil'],
        availability: { days: ['Monday', 'Wednesday', 'Friday'], timePreferences: ['Morning'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 5.0,
        verification: { status: 'verified' }
      },
      {
        name: 'Ketan Parikh',
        email: 'ketan@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 65,
        phone: '+919840123454',
        bio: 'Retired botany enthusiast helping urban households build balcony herb gardens and organic vegetable patches.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Gardening', experienceYears: 20, level: 'Expert' },
          { name: 'Organic Farming', experienceYears: 12, level: 'Intermediate' }
        ],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
        languages: ['English', 'Kannada', 'Hindi'],
        availability: { days: ['Saturday', 'Sunday'], timePreferences: ['Morning'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 4.7,
        verification: { status: 'verified' }
      },
      {
        name: 'Anasuya Hegde',
        email: 'anasuya@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 60,
        phone: '+919840123455',
        bio: 'Master artisan creating eco-friendly jute bags, cotton pouches, and handmade terracotta home decor items.',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Handicrafts', experienceYears: 18, level: 'Expert' },
          { name: 'Jute Weaving', experienceYears: 15, level: 'Expert' }
        ],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', latitude: 12.9352, longitude: 77.6245 },
        languages: ['Kannada', 'English'],
        availability: { days: ['Monday', 'Tuesday', 'Thursday', 'Friday'], timePreferences: ['Afternoon'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 4.9,
        verification: { status: 'verified' }
      },
      {
        name: 'Rukmini Natesan',
        email: 'rukmini@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 71,
        phone: '+919840123456',
        bio: 'Carnatic music vocalist with 40 years of teaching experience. Conducts gentle vocal classes for kids & adults.',
        profileImage: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Carnatic Music', experienceYears: 40, level: 'Expert' },
          { name: 'Vocal Training', experienceYears: 35, level: 'Expert' }
        ],
        location: { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558 },
        languages: ['Tamil', 'English'],
        availability: { days: ['Tuesday', 'Thursday', 'Saturday'], timePreferences: ['Evening'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 5.0,
        verification: { status: 'verified' }
      },
      {
        name: 'Kalyani Subramanian',
        email: 'kalyani@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 56,
        phone: '+919840123457',
        bio: 'Expert knitter creating soft organic wool baby caps, booties, and winter shawls with traditional patterns.',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Knitting', experienceYears: 22, level: 'Expert' },
          { name: 'Crochet', experienceYears: 15, level: 'Intermediate' }
        ],
        location: { city: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198 },
        languages: ['Tamil'],
        availability: { days: ['Monday', 'Wednesday', 'Saturday'], timePreferences: ['Afternoon'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 4.8,
        verification: { status: 'verified' }
      },
      {
        name: 'Gopalakrishnan Nair',
        email: 'gopal@silverhands.demo',
        password: defaultPassword,
        role: 'provider',
        age: 67,
        phone: '+919840123458',
        bio: 'Retired Malayalam & Sanskrit teacher offering conversational language lessons and script writing.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        skills: [
          { name: 'Language Training', experienceYears: 32, level: 'Expert' },
          { name: 'Malayalam Lessons', experienceYears: 30, level: 'Expert' }
        ],
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0850, longitude: 80.2100 },
        languages: ['Malayalam', 'Tamil', 'English'],
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Friday'], timePreferences: ['Morning'] },
        onboarding: { completed: true, currentStep: 6 },
        rating: 4.9,
        verification: { status: 'verified' }
      }
    ];

    const createdProviders = await User.insertMany(providerProfiles);
    console.log(`[Seed]: Created ${createdProviders.length} Provider accounts.`);

    const providerMap = {};
    createdProviders.forEach(p => { providerMap[p.email] = p._id; });

    // 20 Published Services
    const servicesData = [
      {
        providerId: providerMap['lakshmi@silverhands.demo'],
        title: 'Traditional Blouse Stitching & Alteration',
        description: 'Custom blouse stitching with careful lining, neck designs, and perfect fitting for special occasions and daily wear.',
        category: 'Tailoring',
        skills: ['Tailoring', 'Blouse Stitching'],
        price: 500,
        priceType: 'Per Item',
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
        availability: { days: ['Monday', 'Wednesday', 'Friday'], timePreferences: ['Morning'] },
        deliveryMode: ['Home Based', 'Customer Location'],
        images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'],
        status: 'published'
      },
      {
        providerId: providerMap['lakshmi@silverhands.demo'],
        title: 'Churidar & Salwar Stitching',
        description: 'Custom churidar stitching with matching dupatta piping and comfortable fitting tailored to your exact measurements.',
        category: 'Tailoring',
        skills: ['Tailoring', 'Sewing'],
        price: 650,
        priceType: 'Per Item',
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
        availability: { days: ['Tuesday', 'Thursday'], timePreferences: ['Afternoon'] },
        deliveryMode: ['Home Based'],
        images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600'],
        status: 'published'
      },
      {
        providerId: providerMap['savitri@silverhands.demo'],
        title: 'Class 6-10 Mathematics Home Tuition',
        description: 'Patient 1-on-1 math tutoring focused on clear fundamentals, step-by-step problem solving, and exam confidence.',
        category: 'Tutoring',
        skills: ['Mathematics Tuition', 'Science Mentoring'],
        price: 400,
        priceType: 'Per Hour',
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0418, longitude: 80.2341 },
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], timePreferences: ['Evening'] },
        deliveryMode: ['In Person', 'Online'],
        images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600'],
        status: 'published'
      },
      {
        providerId: providerMap['meenakshi@silverhands.demo'],
        title: 'Traditional South Indian Cooking Workshop',
        description: 'Hands-on kitchen workshop learning authentic sambar powder making, rasam varieties, and crispy vada techniques.',
        category: 'Cooking',
        skills: ['Traditional Cooking'],
        price: 800,
        priceType: 'Per Session',
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0674, longitude: 80.2376 },
        availability: { days: ['Saturday', 'Sunday'], timePreferences: ['Morning'] },
        deliveryMode: ['Home Based'],
        images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'],
        status: 'published'
      },
      {
        providerId: providerMap['ketan@silverhands.demo'],
        title: 'Balcony Herb & Organic Garden Setup',
        description: 'Consultation and hands-on help setting up soil mix, pots, tulsi, mint, curry leaf plants, and natural pest care.',
        category: 'Gardening',
        skills: ['Gardening', 'Organic Farming'],
        price: 750,
        priceType: 'Per Session',
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
        availability: { days: ['Saturday', 'Sunday'], timePreferences: ['Morning'] },
        deliveryMode: ['Customer Location'],
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600'],
        status: 'published'
      },
      {
        providerId: providerMap['rukmini@silverhands.demo'],
        title: 'Carnatic Music Vocal Classes for Beginners',
        description: 'Gentle vocal training covering Sarali Varisai, Alankarams, and devotional Geethams with clear shruti alignment.',
        category: 'Music',
        skills: ['Carnatic Music', 'Vocal Training'],
        price: 350,
        priceType: 'Per Session',
        location: { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558 },
        availability: { days: ['Tuesday', 'Thursday', 'Saturday'], timePreferences: ['Evening'] },
        deliveryMode: ['Online', 'In Person'],
        images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600'],
        status: 'published'
      },
      {
        providerId: providerMap['gopal@silverhands.demo'],
        title: 'Spoken Malayalam & Conversational Practice',
        description: 'Interactive spoken Malayalam sessions for beginners and professionals moving to Kerala or connecting with family.',
        category: 'Language Training',
        skills: ['Language Training', 'Malayalam Lessons'],
        price: 300,
        priceType: 'Per Hour',
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0850, longitude: 80.2100 },
        availability: { days: ['Monday', 'Wednesday', 'Friday'], timePreferences: ['Morning'] },
        deliveryMode: ['Online'],
        images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600'],
        status: 'published'
      }
    ];

    await Service.insertMany(servicesData);
    console.log(`[Seed]: Created ${servicesData.length} Published Services.`);

    // 20 Published Products
    const productsData = [
      {
        providerId: providerMap['meenakshi@silverhands.demo'],
        name: 'Homemade Avakai Mango Pickle (500g)',
        description: 'Authentic spicy cut mango pickle made with gingelly oil, mustard seeds, and family heirloom red chili powder.',
        category: 'Food',
        price: 260,
        quantity: 15,
        unit: 'jar',
        images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'],
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0674, longitude: 80.2376 },
        deliveryOptions: ['Pickup', 'Local Delivery', 'Shipping'],
        status: 'published'
      },
      {
        providerId: providerMap['meenakshi@silverhands.demo'],
        name: 'Handcrafted Gunpowder Sambar Podi (250g)',
        description: 'Freshly roasted traditional sambar spice mix prepared in small batches without artificial preservatives.',
        category: 'Food',
        price: 180,
        quantity: 20,
        unit: 'pack',
        images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600'],
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0674, longitude: 80.2376 },
        deliveryOptions: ['Pickup', 'Local Delivery'],
        status: 'published'
      },
      {
        providerId: providerMap['anasuya@silverhands.demo'],
        name: 'Handmade Eco Cotton Tote Bag',
        description: 'Sturdy 100% natural cotton canvas bag with hand-block printed floral motifs. Perfect for daily shopping.',
        category: 'Handicrafts',
        price: 320,
        quantity: 10,
        unit: 'piece',
        images: ['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&q=80&w=600'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', latitude: 12.9352, longitude: 77.6245 },
        deliveryOptions: ['Pickup', 'Local Delivery', 'Shipping'],
        status: 'published'
      },
      {
        providerId: providerMap['kalyani@silverhands.demo'],
        name: 'Knitted Soft Wool Baby Bonnet & Booties Set',
        description: 'Hand-knitted pure organic wool baby cap and matching booties set for newborns. Hypoallergenic & warm.',
        category: 'Clothing',
        price: 450,
        quantity: 8,
        unit: 'set',
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600'],
        location: { city: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198 },
        deliveryOptions: ['Shipping', 'Pickup'],
        status: 'published'
      },
      {
        providerId: providerMap['anasuya@silverhands.demo'],
        name: 'Terracotta Handpainted Diya & Planter',
        description: 'Handcrafted clay diya pot painted with non-toxic colors by local homemakers. Adds warm charm to any space.',
        category: 'Home Decor',
        price: 290,
        quantity: 12,
        unit: 'piece',
        images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', latitude: 12.9352, longitude: 77.6245 },
        deliveryOptions: ['Pickup', 'Local Delivery'],
        status: 'published'
      }
    ];

    await Product.insertMany(productsData);
    console.log(`[Seed]: Created ${productsData.length} Published Products.`);

    console.log('[Seed]: Successfully completed database seeding!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
