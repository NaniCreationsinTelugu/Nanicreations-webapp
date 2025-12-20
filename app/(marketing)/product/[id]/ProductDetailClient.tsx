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

// ... imports
// ... imports

interface DetailedProduct {
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
}

interface Option {
    id: number;
    name: string;
    values: { id: number; name: string }[];
}

interface Variant {
    id: number;
    price: string | null;
    stock: number;
    sku: string | null;
    image: string | null;
    optionValues: { optionName: string; value: string; optionValueId: number }[];
}

interface ProductDetailProps {
    product: DetailedProduct;
    relatedProducts: any[];
    options: Option[];
    variants: Variant[];
}

export default function ProductDetailClient({
    product,
    relatedProducts,
    options = [],
    variants = [],
}: ProductDetailProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem } = useCart();
    const { toast } = useToast();

    // Variant Selection State
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // Determine active variant
    const getActiveVariant = () => {
        if (options.length === 0 || Object.keys(selectedOptions).length < options.length) return null;

        return variants.find(v => {
            return v.optionValues.every(ov => selectedOptions[ov.optionName] === ov.value);
        });
    };

    const activeVariant = getActiveVariant();

    // Derived values
    const currentPrice = activeVariant?.price ? parseFloat(activeVariant.price) : product.price;
    const currentStock = activeVariant ? activeVariant.stock : product.stock;
    const currentImage = activeVariant?.image || product.images[selectedImage];
    const isOutOfStock = currentStock <= 0;

    // Auto-select first options if not selected?
    // User preference: Maybe. Let's force user to select if options exist.
    // Or auto select first valid variant.

    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(Math.max(1, quantity + delta));
    };

    const handleAddToCart = () => {
        if (options.length > 0 && !activeVariant) {
            toast({
                title: "Please select options",
                description: "You must choose all available options."
            });
            return;
        }

        addItem(
            {
                id: product.id,
                title: product.title,
                price: currentPrice,
                image: currentImage,
                variantId: activeVariant?.id,
                variantOptions: activeVariant ? activeVariant.optionValues.map(ov => `${ov.optionName}: ${ov.value}`).join(", ") : undefined
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
                {/* ... Breadcrumb ... */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/collections" className="hover:text-foreground transition-colors">Collections</Link>
                    <span>/</span>
                    <span className="text-foreground">{product.title}</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                    <img
                                        src={currentImage} // Update to current variant image if exists
                                        alt={product.title}
                                        className="h-full w-full object-cover"
                                    />
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <span className="text-2xl font-bold text-white">Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thumbnails - logic needs update to include variant images? 
                           For now keeping base images. */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-3 gap-4">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${product.images[selectedImage] === img && !activeVariant?.image // crude check
                                            ? "border-primary scale-105"
                                            : "border-transparent hover:border-muted-foreground/50"
                                            }`}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                                {product.category}
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold">{product.title}</h1>

                        {/* Price */}
                        <div className="text-4xl font-bold text-primary">
                            ₹{currentPrice.toFixed(2)}
                        </div>

                        {/* Variant Selectors */}
                        {options.map((opt) => (
                            <div key={opt.id} className="space-y-3">
                                <span className="font-semibold text-sm">{opt.name}:</span>
                                <div className="flex flex-wrap gap-2">
                                    {opt.values.map((val) => {
                                        const isSelected = selectedOptions[opt.name] === val.name;
                                        return (
                                            <button
                                                key={val.id}
                                                onClick={() => handleOptionSelect(opt.name, val.name)}
                                                className={`px-4 py-2 rounded-md border text-sm transition-all ${isSelected
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background hover:bg-muted"
                                                    }`}
                                            >
                                                {val.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Stock */}
                        <p className="text-sm text-muted-foreground">
                            {currentStock > 0 ? `${currentStock} units in stock` : "Out of Stock"}
                        </p>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>

                        {/* Add to Cart */}
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
                                        disabled={quantity >= currentStock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full text-lg"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || (options.length > 0 && !activeVariant)}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </Button>
                        </div>

                        {/* Trust Badges... */}
                        {/* ... keep existing trust badges ... */}
                        <div className="grid grid-cols-3 gap-4 border-t pt-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Truck className="h-6 w-6 text-primary" />
                                <span className="text-xs text-muted-foreground">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Shield className="h-6 w-6 text-primary" />
                                <span className="text-xs text-muted-foreground">1 Year Warranty</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <RotateCcw className="h-6 w-6 text-primary" />
                                <span className="text-xs text-muted-foreground">30 Day Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feat/Spec/Related */}
                {(product.specifications.length > 0 || product.features.length > 0) && (
                    <div className="mt-12 grid gap-8 lg:grid-cols-2">
                        {product.specifications.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="mb-4 text-2xl font-bold">Specifications</h2>
                                    <ul className="space-y-2">
                                        {product.specifications.map((spec, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                                <span className="text-muted-foreground">{spec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                        {product.features.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="mb-4 text-2xl font-bold">Key Features</h2>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="mb-6 text-3xl font-bold">Related Products</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} {...relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
            <WhatsAppButton />
        </div>
    )
}
