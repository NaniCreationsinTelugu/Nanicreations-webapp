import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import arduinoKit from "@/public/arduino-kit.jpg";
import iotProject from "@/public/iot-project.jpg";
import components from "@/public/components.jpg";

const Home = () => {
  const featuredProducts = [
    {
      id: 1,
      title: "Arduino Starter Kit",
      description: "Complete kit with Arduino Uno, sensors, and components for beginners",
      price: 49.99,
      image: "/arduino-kit.jpg",
      category: "Arduino",
    },
    {
      id: 2,
      title: "IoT Smart Home Kit",
      description: "Build your own smart home with ESP32 and various IoT sensors",
      price: 79.99,
      image: "/iot-project.jpg",
      category: "IoT",
    },
    {
      id: 3,
      title: "Component Bundle",
      description: "Essential electronic components pack - resistors, LEDs, capacitors",
      price: 29.99,
      image: "/components.jpg",
      category: "Components",
    },
    {
      id: 4,
      title: "Advanced Robotics Kit",
      description: "Build advanced robots with motors, sensors, and Arduino Mega",
      price: 129.99,
      image: "/arduino-kit.jpg",
      category: "Robotics",
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary">
          <img
            src= "/hero-robotics.jpg"
            alt="Robotics workspace"
            className="h-full w-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
              Build Your Next Innovation
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Explore our collection of robotics kits, electronic components, and learning resources for makers of all levels
            </p>
            <div className="mx-auto flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for projects, components, courses..."
                  className="h-12 pl-10 bg-white"
                />
              </div>
              <Button size="lg" variant="secondary" className="h-12">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Explore Collections</h2>
          <p className="text-muted-foreground">Browse our curated selection of projects and components</p>
        </div>
        
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/collections?category=arduino">
            <div className="group cursor-pointer rounded-lg border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-hover">
              <div className="mb-3 text-4xl">🤖</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">Arduino Projects</h3>
            </div>
          </Link>
          <Link href="/collections?category=iot">
            <div className="group cursor-pointer rounded-lg border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-hover">
              <div className="mb-3 text-4xl">📡</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">IoT Devices</h3>
            </div>
          </Link>
          <Link href="/collections?category=components">
            <div className="group cursor-pointer rounded-lg border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-hover">
              <div className="mb-3 text-4xl">⚡</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">Components</h3>
            </div>
          </Link>
          <Link href="/courses">
            <div className="group cursor-pointer rounded-lg border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-hover">
              <div className="mb-3 text-4xl">📚</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">Courses</h3>
            </div>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Featured Products</h3>
          <Link href="/collections">
            <Button variant="ghost">View All →</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Building?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of makers and innovators creating amazing projects
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/collections">
              <Button size="lg">Browse Collections</Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <WhatsAppButton />
    </div>
  );
};

export default Home;
