'use client'
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";


const Collections = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const allProducts = [
    {
      id: 1,
      title: "Arduino Starter Kit",
      description: "Complete kit with Arduino Uno, sensors, and components for beginners",
      price: 49.99,
      image: "/arduino-kit.jpg",
      category: "arduino",
    },
    {
      id: 2,
      title: "IoT Smart Home Kit",
      description: "Build your own smart home with ESP32 and various IoT sensors",
      price: 79.99,
      image: "/iot-project.jpg",
      category: "iot",
    },
    {
      id: 3,
      title: "Component Bundle",
      description: "Essential electronic components pack - resistors, LEDs, capacitors",
      price: 29.99,
      image: "/components.jpg",
      category: "components",
    },
    {
      id: 4,
      title: "Advanced Robotics Kit",
      description: "Build advanced robots with motors, sensors, and Arduino Mega",
      price: 129.99,
      image: "/arduino-kit.jpg",
      category: "robotics",
    },
    {
      id: 5,
      title: "Arduino Mega Kit",
      description: "Professional-grade Arduino Mega with extended capabilities",
      price: 89.99,
      image: "/components.jpg",
      category: "arduino",
    },
    {
      id: 6,
      title: "IoT Weather Station",
      description: "Create your own weather monitoring system with cloud connectivity",
      price: 59.99,
      image: "/iot-project.jpg",
      category: "iot",
    },
    {
      id: 7,
      title: "Sensor Pack Pro",
      description: "30+ sensors including ultrasonic, temperature, humidity, and more",
      price: 45.99,
      image: "/hero-robotics.jpg",
      category: "components",
    },
    {
      id: 8,
      title: "Line Following Robot",
      description: "Build and program an autonomous line-following robot",
      price: 69.99,
      image: "/iot-project.jpg",
      category: "robotics",
    },
  ];

  const categories = [
    { id: "all", label: "All Products" },
    { id: "arduino", label: "Arduino" },
    { id: "iot", label: "IoT" },
    { id: "robotics", label: "Robotics" },
    { id: "components", label: "Components" },
  ];

  const filteredProducts = activeCategory === "all" 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">

      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Collections</h1>
          <p className="text-lg text-muted-foreground">
            Discover our complete range of robotics kits, components, and project bundles
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">
              No products found in this category
            </p>
          </div>
        )}
      </div>

      <WhatsAppButton />
    </div>
  );
};

export default Collections;