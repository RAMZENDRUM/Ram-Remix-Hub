
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'ramzendrum@gmail.com';
    const password = 'RAMA';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: 'ADMIN',
        },
        create: {
            email,
            name: 'Ram Zendrum',
            passwordHash: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log(`Admin user created/updated:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${user.role}`);
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
