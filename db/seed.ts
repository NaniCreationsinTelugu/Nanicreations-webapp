import { config } from "dotenv";
import { db } from "./drizzle";
import { category, product, course } from "./schema";

config({ path: ".env" });

async function upsertCategories() {
  const categoriesData = [
    { id: 1, slug: "arduino", name: "Arduino" },
    { id: 2, slug: "iot", name: "IoT" },
    { id: 3, slug: "components", name: "Components" },
    { id: 4, slug: "robotics", name: "Robotics" },
  ];
  await db.insert(category).values(categoriesData).onConflictDoNothing();
}

async function upsertProducts() {
  const items = [
    { id: 1, title: "Arduino Starter Kit", description: "Complete kit with Arduino Uno, sensors, and components for beginners", price: 49.99, image: "/arduino-kit.jpg", categoryId: 1 },
    { id: 2, title: "IoT Smart Home Kit", description: "Build your own smart home with ESP32 and various IoT sensors", price: 79.99, image: "/iot-project.jpg", categoryId: 2 },
    { id: 3, title: "Component Bundle", description: "Essential electronic components pack - resistors, LEDs, capacitors", price: 29.99, image: "/components.jpg", categoryId: 3 },
    { id: 4, title: "Advanced Robotics Kit", description: "Build advanced robots with motors, sensors, and Arduino Mega", price: 129.99, image: "/arduino-kit.jpg", categoryId: 4 },
    { id: 5, title: "Arduino Mega Kit", description: "Professional-grade Arduino Mega with extended capabilities", price: 89.99, image: "/components.jpg", categoryId: 1 },
    { id: 6, title: "IoT Weather Station", description: "Create your own weather monitoring system with cloud connectivity", price: 59.99, image: "/iot-project.jpg", categoryId: 2 },
    { id: 7, title: "Sensor Pack Pro", description: "30+ sensors including ultrasonic, temperature, humidity, and more", price: 45.99, image: "/hero-robotics.jpg", categoryId: 3 },
    { id: 8, title: "Line Following Robot", description: "Build and program an autonomous line-following robot", price: 69.99, image: "/iot-project.jpg", categoryId: 4 },
  ];
  const mapped = items.map(i => ({ ...i, price: i.price.toFixed(2) }));
  await db.insert(product).values(mapped).onConflictDoNothing();
}

async function upsertCourses() {
  const items = [
    { id: 1, title: "Arduino Programming Fundamentals", description: "Learn the basics of Arduino programming and build your first circuits", level: "Beginner", duration: "4 weeks", lessons: 12, price: 29.99 },
    { id: 2, title: "IoT with ESP32", description: "Master IoT development with ESP32 and cloud connectivity", level: "Intermediate", duration: "6 weeks", lessons: 18, price: 49.99 },
    { id: 3, title: "Robotics Engineering", description: "Build and program autonomous robots from scratch", level: "Advanced", duration: "8 weeks", lessons: 24, price: 79.99 },
  ];
  const mapped = items.map(i => ({ ...i, price: i.price.toFixed(2) }));
  await db.insert(course).values(mapped).onConflictDoNothing();
}

async function main() {
  await upsertCategories();
  await upsertProducts();
  await upsertCourses();
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
