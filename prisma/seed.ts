// import { PrismaClient, Role } from '@prisma/client';
// import { faker } from '@faker-js/faker';
// import * as bcryptjs from 'bcryptjs';

// const prisma = new PrismaClient();

// async function main() {
//   await prisma.orderProducts.deleteMany();
//   await prisma.order.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.user.deleteMany();
//   await prisma.branch.deleteMany();
//   await prisma.restaurant.deleteMany();

//   // Crear 2 restaurantes con un propietario (OWNER) cada uno
//   const restaurants = [];
//   for (let i = 0; i < 2; i++) {
//     const restaurant = await prisma.restaurant.create({
//       data: {
//         name: faker.company.name(),
//         address: faker.address.streetAddress(),
//         phoneNumber: faker.phone.number(),
//         owners: {
//           create: {
//             email: faker.internet.email(),
//             password: await bcryptjs.hash('password123', 6),
//             role: Role.OWNER,
//             verificationToken: faker.datatype.uuid(),
//           },
//         },
//       },
//     });
//     restaurants.push(restaurant);
//   }

//   // Crear 1 sucursal para cada restaurante con un administrador (ADMIN) cada uno
//   const branches = [];
//   for (const restaurant of restaurants) {
//     const branch = await prisma.branch.create({
//       data: {
//         name: `${restaurant.name} Branch 1`,
//         restaurantId: restaurant.id,
//       },
//     });
//     branches.push(branch);

//     // Crear un usuario ADMIN para cada sucursal
//     await prisma.user.create({
//       data: {
//         email: faker.internet.email(),
//         password: await bcryptjs.hash('password123', 6),
//         role: Role.ADMIN,
//         branchId: branch.id,
//         verificationToken: faker.datatype.uuid(),
//       },
//     });
//   }

//   // Crear 1 usuario (CHEF) para cada sucursal
//   for (const branch of branches) {
//     await prisma.user.create({
//       data: {
//         email: faker.internet.email(),
//         password: await bcryptjs.hash('password123', 6),
//         role: Role.CHEF,
//         branchId: branch.id,
//         verificationToken: faker.datatype.uuid(),
//       },
//     });
//   }

//   // Crear 3 categorías para cada sucursal
//   const categories = [];
//   for (const branch of branches) {
//     for (let i = 0; i < 3; i++) {
//       const category = await prisma.category.create({
//         data: {
//           name: faker.commerce.department(),
//           branchId: branch.id,
//         },
//       });
//       categories.push(category);
//     }
//   }

//   // Crear 2 productos para cada categoría
//   for (const category of categories) {
//     for (let i = 0; i < 2; i++) {
//       await prisma.product.create({
//         data: {
//           name: faker.commerce.productName(),
//           description: faker.commerce.productDescription(),
//           price: parseFloat(faker.commerce.price()),
//           categoryId: category.id,
//           branchId: category.branchId,
//         },
//       });
//     }
//   }

//   // Crear 2 órdenes para cada sucursal
//   for (const branch of branches) {
//     for (let i = 0; i < 2; i++) {
//       const order = await prisma.order.create({
//         data: {
//           total: parseFloat(faker.commerce.price()),
//           table: faker.random.alphaNumeric(5),
//           delivery: faker.datatype.boolean(),
//           status: 'received',
//           date: faker.date.recent(),
//           branchId: branch.id,
//         },
//       });

//       // Crear 2 productos de orden para cada orden
//       const products = await prisma.product.findMany({
//         where: { branchId: branch.id },
//         take: 2,
//       });
//       for (const product of products) {
//         await prisma.orderProducts.create({
//           data: {
//             orderId: order.id,
//             productId: product.id,
//             quantity: faker.datatype.number({ min: 1, max: 10 }),
//             spicyLevelNumber: product.spicyLevel ? faker.datatype.number({ min: 0, max: 5 }) : null,
//           },
//         });
//       }
//     }
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
