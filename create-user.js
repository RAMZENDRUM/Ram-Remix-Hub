
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'user@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
        },
        create: {
            email,
            name: 'Test User',
            passwordHash: hashedPassword,
            role: 'LISTENER',
        },
    });

    console.log(`User created/updated:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`ID: ${user.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
