"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/use-toast";
import {
    ShoppingCart,
    Minus,
    Plus,
    ChevronLeft,
    Star,
    Truck,
    Shield,
    RotateCcw,
} from "lucide-react";

interface ProductDetailProps {
    product: {
        id: number;
        title: string;
        description: string;
        price: number;
        images: string[];
        image: string;
        category: string;
        inStock: boolean;
        stock: number;
        rating: number;
        reviews: number;
        specifications: string[];
        features: string[];
    };
    relatedProducts: Array<{
        id: number;
        title: string;
        description: string;
        price: number;
        image: string;
        category: string;
    }>;
}

export default function ProductDetailClient({
    product,
    relatedProducts,
}: ProductDetailProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem } = useCart();
    const { toast } = useToast();

    const handleQuantityChange = (delta: number) => {
        setQuantity(Math.max(1, quantity + delta));
    };

    const handleAddToCart = () => {
        addItem(
            {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
            },
            quantity
        );
        toast({
            title: "Added to cart",
            description: `${quantity} × ${product.title}`,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <span>/</span>
                    <Link
                        href="/collections"
                        className="hover:text-foreground transition-colors"
                    >
                        Collections
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{product.title}</span>
                </nav>

                {/* Product Details */}
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                    <img
                                        src={product.images[selectedImage]}
                                        alt={product.title}
                                        className="h-full w-full object-cover"
                                    />
                                    {!product.inStock && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <span className="text-2xl font-bold text-white">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thumbnail Gallery */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-3 gap-4">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedImage === idx
                                                ? "border-primary scale-105"
                                                : "border-transparent hover:border-muted-foreground/50"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.title} view ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Category Badge */}
                        <div>
                            <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                                {product.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold">{product.title}</h1>

                        {/* Rating */}
                        {product.rating > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.floor(product.rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {product.rating} ({product.reviews} reviews)
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="text-4xl font-bold text-primary">
                            ₹{product.price.toFixed(2)}
                        </div>

                        {/* Stock */}
                        {product.stock > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {product.stock} units in stock
                            </p>
                        )}

                        {/* Description */}
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>

                        {/* Quantity Selector */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">Quantity:</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center text-lg font-semibold">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <Button
                                size="lg"
                                className="w-full text-lg"
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {product.inStock ? "Add to Cart" : "Out of Stock"}
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 border-t pt-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Truck className="h-6 w-6 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                    Free Shipping
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Shield className="h-6 w-6 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                    1 Year Warranty
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <RotateCcw className="h-6 w-6 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                    30 Day Returns
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications & Features */}
                {(product.specifications.length > 0 || product.features.length > 0) && (
                    <div className="mt-12 grid gap-8 lg:grid-cols-2">
                        {/* Specifications */}
                        {product.specifications.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="mb-4 text-2xl font-bold">
                                        Specifications
                                    </h2>
                                    <ul className="space-y-2">
                                        {product.specifications.map((spec, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                                <span className="text-muted-foreground">
                                                    {spec}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Features */}
                        {product.features.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="mb-4 text-2xl font-bold">
                                        Key Features
                                    </h2>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                                <span className="text-muted-foreground">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="mb-6 text-3xl font-bold">Related Products</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard
                                    key={relatedProduct.id}
                                    {...relatedProduct}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <WhatsAppButton />
        </div>
    );
}
