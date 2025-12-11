"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import CourseCard from "@/components/CourseCard";
import Link from "next/link";

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    image: string;
    category: string;
    categoryId?: number | null;
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

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [products, setProducts] = useState<Product[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (searchQuery) {
            performSearch(searchQuery);
        }
    }, [searchQuery]);

    const performSearch = async (q: string) => {
        setLoading(true);
        try {
            // Fetch products and courses in parallel
            const [productsRes, coursesRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/courses"),
            ]);

            const [allProducts, allCourses] = await Promise.all([
                productsRes.json(),
                coursesRes.json(),
            ]);

            // Filter products by search query (using 'title' field from API)
            const filteredProducts = allProducts.filter((product: Product) =>
                product.title.toLowerCase().includes(q.toLowerCase()) ||
                product.description?.toLowerCase().includes(q.toLowerCase())
            );

            // Filter courses by search query
            const filteredCourses = allCourses.filter((course: Course) =>
                course.name.toLowerCase().includes(q.toLowerCase()) ||
                course.description?.toLowerCase().includes(q.toLowerCase())
            );

            setProducts(filteredProducts);
            setCourses(filteredCourses);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(query);
    };

    const totalResults = products.length + courses.length;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">Search</h1>

                    <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for products, courses..."
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                    </form>
                </div>

                {/* Results */}
                {searchQuery && (
                    <>
                        <div className="mb-6">
                            <p className="text-muted-foreground">
                                {loading ? (
                                    "Searching..."
                                ) : (
                                    <>
                                        Found <span className="font-semibold text-foreground">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
                                    </>
                                )}
                            </p>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="mb-6">
                                <TabsTrigger value="all">
                                    All ({totalResults})
                                </TabsTrigger>
                                <TabsTrigger value="products">
                                    Products ({products.length})
                                </TabsTrigger>
                                <TabsTrigger value="courses">
                                    Courses ({courses.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-12">
                                {products.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">Products</h2>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                            {products.map((product) => (
                                                <ProductCard
                                                    key={product.id}
                                                    id={product.id}
                                                    title={product.title}
                                                    description={product.description}
                                                    price={product.price}
                                                    image={product.image}
                                                    category={product.category}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {courses.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">Courses</h2>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                            {courses.map((course) => (
                                                <CourseCard key={course.id} {...course} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!loading && totalResults === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
                                        <Link href="/collections">
                                            <Button variant="outline">Browse All Products</Button>
                                        </Link>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="products">
                                {products.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                id={product.id}
                                                title={product.title}
                                                description={product.description}
                                                price={product.price}
                                                image={product.image}
                                                category={product.category}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground mb-4">No products found for "{searchQuery}"</p>
                                        <Link href="/collections">
                                            <Button variant="outline">Browse All Products</Button>
                                        </Link>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="courses">
                                {courses.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                        {courses.map((course) => (
                                            <CourseCard key={course.id} {...course} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground mb-4">No courses found for "{searchQuery}"</p>
                                        <Link href="/courses">
                                            <Button variant="outline">Browse All Courses</Button>
                                        </Link>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </>
                )}

                {!searchQuery && (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">Start Searching</h2>
                        <p className="text-muted-foreground">
                            Enter a search term to find products and courses
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
