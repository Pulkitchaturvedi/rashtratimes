import { PrismaClient, Role, Status } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const reporters = await Promise.all(
      Array.from({ length: 3 }).map((_, index) =>
        tx.user.upsert({
          where: { email: `reporter${index + 1}@rashtratimes.com` },
          update: {},
          create: {
            email: `reporter${index + 1}@rashtratimes.com`,
            name: faker.person.fullName(),
            role: Role.REPORTER
          }
        })
      )
    );

    const editors = await Promise.all(
      Array.from({ length: 2 }).map((_, index) =>
        tx.user.upsert({
          where: { email: `editor${index + 1}@rashtratimes.com` },
          update: {},
          create: {
            email: `editor${index + 1}@rashtratimes.com`,
            name: faker.person.fullName(),
            role: Role.EDITOR
          }
        })
      )
    );

    const publisher = await tx.user.upsert({
      where: { email: 'publisher@rashtratimes.com' },
      update: {},
      create: {
        email: 'publisher@rashtratimes.com',
        name: faker.person.fullName(),
        role: Role.PUBLISHER
      }
    });

    const admin = await tx.user.upsert({
      where: { email: 'admin@rashtratimes.com' },
      update: {},
      create: {
        email: 'admin@rashtratimes.com',
        name: 'Site Admin',
        role: Role.ADMIN
      }
    });

    const allUsers = [...reporters, ...editors, publisher, admin];

    await Promise.all(
      Array.from({ length: 12 }).map(async (_, index) => {
        const author = reporters[index % reporters.length];
        const editor = editors[index % editors.length];
        const slug = `sample-article-${index + 1}`;
        await tx.article.upsert({
          where: { slug },
          update: {},
          create: {
            slug,
            title: faker.lorem.sentence(),
            body: { blocks: [{ type: 'paragraph', content: faker.lorem.paragraphs(3) }] },
            excerpt: faker.lorem.sentences(2),
            status: index % 4 === 0 ? Status.PUBLISHED : Status.DRAFT,
            section: faker.helpers.arrayElement(['Delhi', 'Politics', 'Business', 'Culture']),
            tags: [faker.word.noun(), faker.word.noun()],
            lang: 'en',
            location: faker.location.city(),
            authorId: author.id,
            editorId: editor.id,
            publishedAt: new Date()
          }
        });
      })
    );
  });

  console.info('Seed data created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
