import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Delete existing data
  await prisma.expense.deleteMany({})
  await prisma.income.deleteMany({})
  await prisma.creditCard.deleteMany({})
  await prisma.user.deleteMany({})

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: hashedPassword,
    },
  })

  console.log('Created user:', user.email)

  // Create test credit cards
  const card1 = await prisma.creditCard.create({
    data: {
      userId: user.id,
      name: 'Visa Platinum',
      creditLimit: 5000,
      paymentLimit: 1200,
      currentBalance: 1500,
      lastDigits: '4242',
      issuer: 'VISA',
    },
  })

  const card2 = await prisma.creditCard.create({
    data: {
      userId: user.id,
      name: 'Mastercard Gold',
      creditLimit: 10000,
      paymentLimit: 2500,
      currentBalance: 3200,
      lastDigits: '5555',
      issuer: 'MASTERCARD',
    },
  })

  console.log('Created credit cards:', card1.name, card2.name)

  // Create test expenses
  const expense1 = await prisma.expense.create({
    data: {
      userId: user.id,
      creditCardId: card1.id,
      description: 'Grocery shopping',
      amount: 150,
      category: 'groceries',
      date: new Date('2026-03-10'),
    },
  })

  const expense2 = await prisma.expense.create({
    data: {
      userId: user.id,
      creditCardId: card1.id,
      description: 'Gas station',
      amount: 45.5,
      category: 'transportation',
      date: new Date('2026-03-12'),
    },
  })

  const expense3 = await prisma.expense.create({
    data: {
      userId: user.id,
      creditCardId: card2.id,
      description: 'Restaurant dinner',
      amount: 85,
      category: 'dining',
      date: new Date('2026-03-11'),
    },
  })

  console.log('Created test expenses')

  await prisma.income.createMany({
    data: [
      {
        userId: user.id,
        description: 'Main salary',
        amount: 3200,
        type: 'fixed',
        date: new Date('2026-03-01'),
      },
      {
        userId: user.id,
        description: 'Freelance project',
        amount: 600,
        type: 'variable',
        date: new Date('2026-03-20'),
      },
    ],
  })

  console.log('Created test incomes')
  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
