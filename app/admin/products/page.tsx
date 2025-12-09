"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ProductDialog from "./ProductDialog";
import { toast } from "sonner";
import Image from "next/image";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    images: string[];
    categoryId: number;
    categoryName: string;
    stock: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/admin/products");
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreate = () => {
        setEditingProduct(null);
        setDialogOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete product");
            }

            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSuccess = () => {
        toast.success(
            editingProduct
                ? "Product updated successfully"
                : "Product created successfully"
        );
        fetchProducts();
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Products</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((prod) => (
                    <Card key={prod.id} className="py-0">
                        <CardHeader className="p-0">
                            <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                                <Image
                                    src={prod.images?.[0] || "/placeholder.png"}
                                    alt={prod.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <CardTitle className="mb-2">{prod.name}</CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {prod.description}
                            </p>
                            <div className="flex items-center justify-between text-sm mb-3">
                                <span className="font-bold text-lg">₹{prod.price}</span>
                                <span className="text-muted-foreground">
                                    {prod.categoryName}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span
                                    className={`text-xs px-2 py-1 rounded ${prod.stock > 0
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {prod.stock > 0 ? `Stock: ${prod.stock}` : "Out of Stock"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(prod)}
                                    className="flex-1"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(prod.id)}
                                    className="flex-1"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                        No products found. Create one to get started.
                    </div>
                )}
            </div>

            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={editingProduct}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
