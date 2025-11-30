'use client'
import { useEffect, useState } from "react";

import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


const Collections = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  type Product = { id: number; title: string; description: string; price: number; image: string; category: string };
  type Category = { id: string; label: string };
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const productsJson: Product[] = await productsRes.json();
      const categoriesJson: Array<{ slug: string; name: string }> = await categoriesRes.json();
      setProducts(productsJson);
      setCategories([
        { id: "all", label: "All Products" },
        ...categoriesJson.map((c) => ({ id: c.slug, label: c.name })),
      ]);
      setIsLoading(false);
    };
    load();
  }, []);

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

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

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">No products found in this category</p>
              </div>
            )}
          </>
        )}
      </div>

     
    </div>
  );
};

export default Collections;
