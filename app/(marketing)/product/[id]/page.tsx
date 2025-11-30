"use client"
import { useState } from "react";
import { useParams } from "next/navigation";
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
    RotateCcw
} from "lucide-react";

const ProductPage = () => {
    const params = useParams();
    const productId = parseInt(params.id as string);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Product data (in a real app, this would come from an API or database)
    const allProducts = [
        {
            id: 1,
            title: "Arduino Starter Kit",
            description: "Complete kit with Arduino Uno, sensors, and components for beginners. Perfect for learning electronics and programming. Includes comprehensive tutorials and project ideas.",
            price: 49.99,
            image: "/arduino-kit.jpg",
            category: "arduino",
            inStock: true,
            rating: 4.8,
            reviews: 127,
            images: ["/arduino-kit.jpg", "/components.jpg", "/hero-robotics.jpg"],
            specifications: [
                "Arduino Uno R3 Board",
                "USB Cable included",
                "16 Digital I/O Pins",
                "6 Analog Inputs",
                "32KB Flash Memory",
                "16MHz Clock Speed",
                "Breadboard & Jumper Wires",
                "20+ Electronic Components"
            ],
            features: [
                "Beginner-friendly with detailed tutorials",
                "Compatible with Arduino IDE",
                "Expandable with shields and modules",
                "Open-source hardware and software",
                "Large community support"
            ]
        },
        {
            id: 2,
            title: "IoT Smart Home Kit",
            description: "Build your own smart home with ESP32 and various IoT sensors. Control devices remotely and automate your home.",
            price: 79.99,
            image: "/iot-project.jpg",
            category: "iot",
            inStock: true,
            rating: 4.6,
            reviews: 89,
            images: ["/iot-project.jpg", "/arduino-kit.jpg", "/components.jpg"],
            specifications: [
                "ESP32 Development Board",
                "WiFi & Bluetooth Enabled",
                "Temperature & Humidity Sensor",
                "Motion Sensor (PIR)",
                "Relay Module",
                "OLED Display",
                "Power Supply Included",
                "Cloud Integration Support"
            ],
            features: [
                "WiFi and Bluetooth connectivity",
                "Mobile app control",
                "Voice assistant compatible",
                "Low power consumption",
                "Secure cloud connectivity"
            ]
        },
        {
            id: 3,
            title: "Component Bundle",
            description: "Essential electronic components pack - resistors, LEDs, capacitors, and more for all your projects.",
            price: 29.99,
            image: "/components.jpg",
            category: "components",
            inStock: true,
            rating: 4.9,
            reviews: 203,
            images: ["/components.jpg", "/arduino-kit.jpg", "/hero-robotics.jpg"],
            specifications: [
                "200+ Resistors (assorted values)",
                "100+ LEDs (various colors)",
                "50+ Capacitors",
                "20+ Transistors",
                "10+ Diodes",
                "Push Buttons & Switches",
                "Potentiometers",
                "Organized Storage Box"
            ],
            features: [
                "High-quality components",
                "Organized in labeled compartments",
                "Perfect for prototyping",
                "Compatible with all projects",
                "Great value for money"
            ]
        },
        {
            id: 4,
            title: "Advanced Robotics Kit",
            description: "Build advanced robots with motors, sensors, and Arduino Mega. Perfect for intermediate to advanced users.",
            price: 129.99,
            image: "/arduino-kit.jpg",
            category: "robotics",
            inStock: true,
            rating: 4.7,
            reviews: 64,
            images: ["/arduino-kit.jpg", "/iot-project.jpg", "/components.jpg"],
            specifications: [
                "Arduino Mega 2560",
                "4x DC Motors with Encoders",
                "Motor Driver Shield",
                "Ultrasonic Distance Sensor",
                "Line Following Sensors",
                "Servo Motors (2x)",
                "Chassis & Wheels",
                "Rechargeable Battery Pack"
            ],
            features: [
                "Advanced motor control",
                "Autonomous navigation capable",
                "Expandable platform",
                "Professional-grade components",
                "Detailed assembly guide"
            ]
        },
        {
            id: 5,
            title: "Arduino Mega Kit",
            description: "Professional-grade Arduino Mega with extended capabilities for complex projects.",
            price: 89.99,
            image: "/components.jpg",
            category: "arduino",
            inStock: true,
            rating: 4.8,
            reviews: 156,
            images: ["/components.jpg", "/arduino-kit.jpg", "/hero-robotics.jpg"],
            specifications: [
                "Arduino Mega 2560 R3",
                "54 Digital I/O Pins",
                "16 Analog Inputs",
                "256KB Flash Memory",
                "16MHz Clock Speed",
                "4 UARTs",
                "USB Cable",
                "Starter Components Included"
            ],
            features: [
                "More pins for complex projects",
                "Multiple serial ports",
                "Larger memory capacity",
                "Compatible with most shields",
                "Industrial-grade reliability"
            ]
        },
        {
            id: 6,
            title: "IoT Weather Station",
            description: "Create your own weather monitoring system with cloud connectivity and real-time data logging.",
            price: 59.99,
            image: "/iot-project.jpg",
            category: "iot",
            inStock: true,
            rating: 4.5,
            reviews: 78,
            images: ["/iot-project.jpg", "/components.jpg", "/arduino-kit.jpg"],
            specifications: [
                "ESP8266 NodeMCU",
                "BME280 Sensor (Temp, Humidity, Pressure)",
                "Rain Sensor",
                "Wind Speed Sensor",
                "UV Sensor",
                "OLED Display",
                "Solar Panel Option",
                "Weatherproof Enclosure"
            ],
            features: [
                "Real-time weather monitoring",
                "Cloud data logging",
                "Mobile app dashboard",
                "Historical data analysis",
                "Solar-powered option"
            ]
        },
        {
            id: 7,
            title: "Sensor Pack Pro",
            description: "30+ sensors including ultrasonic, temperature, humidity, and more for comprehensive projects.",
            price: 45.99,
            image: "/hero-robotics.jpg",
            category: "components",
            inStock: true,
            rating: 4.9,
            reviews: 142,
            images: ["/hero-robotics.jpg", "/components.jpg", "/arduino-kit.jpg"],
            specifications: [
                "Ultrasonic Distance Sensor",
                "DHT22 Temperature & Humidity",
                "PIR Motion Sensor",
                "Sound Sensor",
                "Light Sensor (LDR)",
                "Gas Sensor (MQ-2)",
                "Soil Moisture Sensor",
                "30+ Total Sensors"
            ],
            features: [
                "Wide variety of sensors",
                "All pre-calibrated",
                "Example code included",
                "Compatible with Arduino & ESP",
                "Professional quality"
            ]
        },
        {
            id: 8,
            title: "Line Following Robot",
            description: "Build and program an autonomous line-following robot with advanced sensors.",
            price: 69.99,
            image: "/iot-project.jpg",
            category: "robotics",
            inStock: true,
            rating: 4.6,
            reviews: 91,
            images: ["/iot-project.jpg", "/arduino-kit.jpg", "/hero-robotics.jpg"],
            specifications: [
                "Arduino Nano",
                "IR Line Sensors (5x)",
                "DC Motors with Gearbox",
                "Motor Driver Module",
                "Chassis Kit",
                "Wheels & Caster",
                "Battery Holder",
                "Pre-programmed Code"
            ],
            features: [
                "Easy assembly",
                "Adjustable speed control",
                "PID algorithm included",
                "Competition-ready design",
                "Expandable platform"
            ]
        },
    ];

    const product = allProducts.find(p => p.id === productId);

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="mb-4 text-4xl font-bold">Product Not Found</h1>
                <p className="mb-8 text-muted-foreground">The product you're looking for doesn't exist.</p>
                <Link href="/collections">
                    <Button>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Collections
                    </Button>
                </Link>
            </div>
        );
    }

    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const handleQuantityChange = (delta: number) => {
        setQuantity(Math.max(1, quantity + delta));
    };

    const { addItem } = useCart();
    const { toast } = useToast();
    const handleAddToCart = () => {
        addItem({ id: product.id, title: product.title, price: product.price, image: product.image }, quantity);
        toast({ title: "Added to cart", description: `${quantity} × ${product.title}` });
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
                    <Link href="/collections" className="hover:text-foreground transition-colors">
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
                                            <span className="text-2xl font-bold text-white">Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thumbnail Gallery */}
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

                        {/* Price */}
                        <div className="text-4xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                        </div>

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
                                    <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(1)}
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

                {/* Specifications & Features */}
                <div className="mt-12 grid gap-8 lg:grid-cols-2">
                    {/* Specifications */}
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

                    {/* Features */}
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
                </div>

                {/* Related Products */}
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
    );
};

export default ProductPage;
