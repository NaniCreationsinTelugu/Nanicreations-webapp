import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import CourseCard from "@/components/CourseCard";
import HeroSearch from "@/components/HeroSearch";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { product, course, category } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface Course {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  videoCount: number;
  isPublished: boolean;
  isFree: boolean;
}


async function getFeaturedProducts() {
  try {
    const products = await db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        categoryId: product.categoryId,
        categoryName: category.name,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .limit(4);

    return products.map((p) => ({
      id: p.id,
      title: p.name || "",
      description: p.description || "",
      price: parseFloat(p.price as string) || 0,
      image: Array.isArray(p.images) && p.images.length > 0 ? (p.images as string[])[0] : "/placeholder.jpg",
      category: p.categoryName || "",
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getFeaturedCourses() {
  try {
    const courses = await db
      .select()
      .from(course)
      .where(eq(course.isPublished, true))
      .limit(4);

    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

const Home = async () => {
  const featuredProducts = await getFeaturedProducts();
  const featuredCourses = await getFeaturedCourses();

  return (
    <div className="min-h-screen bg-background">


      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary">
          <img
            src="/hero-robotics.jpg"
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
            <HeroSearch />
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
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product: Product) => (
              <ProductCard key={product.id} {...product} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No products available yet.
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Featured Courses</h3>
          <Link href="/courses">
            <Button variant="ghost">View All →</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course: Course) => (
              <CourseCard key={course.id} {...course} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No courses available yet.
            </div>
          )}
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
