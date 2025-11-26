"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard = ({ id, title, description, price, image, category }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-hover animate-scale-in py-0">
        <Link href={`/product/${id}`}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {category}
              </span>
            </div>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <p className="text-xl font-bold text-primary">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;