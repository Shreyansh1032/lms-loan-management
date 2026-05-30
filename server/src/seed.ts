import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db';
import User from './models/User';

dotenv.config();

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'Admin@123',
    role: 'admin' as const,
  },
  {
    name: 'Sales Executive',
    email: 'sales@lms.com',
    password: 'Sales@123',
    role: 'sales' as const,
  },
  {
    name: 'Sanction Executive',
    email: 'sanction@lms.com',
    password: 'Sanction@123',
    role: 'sanction' as const,
  },
  {
    name: 'Disbursement Executive',
    email: 'disburse@lms.com',
    password: 'Disburse@123',
    role: 'disbursement' as const,
  },
  {
    name: 'Collection Executive',
    email: 'collection@lms.com',
    password: 'Collection@123',
    role: 'collection' as const,
  },
  {
    name: 'Test Borrower',
    email: 'borrower@lms.com',
    password: 'Borrower@123',
    role: 'borrower' as const,
  },
];

const seed = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users.\n');

    // Create users — password hashing handled by pre-save hook
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅  Created [${userData.role.padEnd(14)}]  ${userData.email}`);
    }

    console.log('\n──────────────────────────────────────────────────────────');
    console.log('🎉 Seed complete! Use these credentials to log in:\n');
    console.log(
      `${'Role'.padEnd(16)} ${'Email'.padEnd(30)} Password`
    );
    console.log('─'.repeat(64));
    for (const u of seedUsers) {
      console.log(`${u.role.padEnd(16)} ${u.email.padEnd(30)} ${u.password}`);
    }
    console.log('──────────────────────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();