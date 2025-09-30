import { db } from "./src/config/db.js";
import {
  wasteCategoriesTable,
  wasteItemsTable,
  usersTable,
  wasteLogsTable,
} from "./src/db/schema.js";

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Add sample user
    const user = await db
      .insert(usersTable)
      .values({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "+1234567890",
        role: "user",
      })
      .returning();

    console.log("✅ Added sample user");

    // Add waste categories
    const categories = await db
      .insert(wasteCategoriesTable)
      .values([
        {
          name: "Plastic",
          description: "Recyclable plastic materials",
        },
        {
          name: "Paper",
          description: "Paper and cardboard materials",
        },
        {
          name: "Glass",
          description: "Glass bottles and containers",
        },
        {
          name: "Metal",
          description: "Aluminum and steel containers",
        },
        {
          name: "Organic",
          description: "Food waste and organic materials",
        },
      ])
      .returning();

    console.log("✅ Added waste categories");

    // Add waste items for each category
    const items = [];

    // Plastic items
    items.push(
      {
        categoryId: categories[0].id,
        name: "Plastic Bottles",
        disposalInstructions:
          "Remove caps and labels, rinse clean before recycling",
      },
      {
        categoryId: categories[0].id,
        name: "Plastic Bags",
        disposalInstructions:
          "Take to special collection points, not regular recycling bins",
      }
    );

    // Paper items
    items.push(
      {
        categoryId: categories[1].id,
        name: "Newspapers",
        disposalInstructions: "Remove any plastic wrapping, keep dry",
      },
      {
        categoryId: categories[1].id,
        name: "Cardboard",
        disposalInstructions: "Flatten boxes, remove tape and staples",
      }
    );

    // Glass items
    items.push({
      categoryId: categories[2].id,
      name: "Glass Bottles",
      disposalInstructions:
        "Rinse clean, remove metal caps, sort by color if required",
    });

    // Metal items
    items.push({
      categoryId: categories[3].id,
      name: "Aluminum Cans",
      disposalInstructions: "Rinse clean, crushing is optional but saves space",
    });

    // Organic items
    items.push({
      categoryId: categories[4].id,
      name: "Food Scraps",
      disposalInstructions: "Compost or use for organic waste collection",
    });

    await db.insert(wasteItemsTable).values(items);
    console.log("✅ Added waste items");

    // Add sample waste logs
    const sampleLogs = [
      {
        userId: user[0].id,
        itemId: items[0].id, // Plastic bottles
        description: "Recycled 5 plastic water bottles",
        quantity: 2,
      },
      {
        userId: user[0].id,
        itemId: items[3].id, // Cardboard
        description: "Recycled Amazon delivery boxes",
        quantity: 3,
      },
      {
        userId: user[0].id,
        itemId: items[5].id, // Aluminum cans
        description: "Recycled soda cans from party",
        quantity: 1,
      },
      {
        userId: user[0].id,
        description: "Mixed recycling from kitchen",
        quantity: 4,
      },
    ];

    await db.insert(wasteLogsTable).values(sampleLogs);
    console.log("✅ Added sample waste logs");

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedDatabase();
