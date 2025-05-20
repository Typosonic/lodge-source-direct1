import { useState } from "react";
import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  
  const handleAddToOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className={cn(
        "block rounded-lg overflow-hidden bg-lodge-card-bg border border-white/10 hover-scale",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-60 overflow-hidden bg-black/20">
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        <div className="absolute top-3 right-3 px-2 py-1 bg-lodge-dark-bg/80 backdrop-blur-sm rounded-md text-xs font-medium">
          {product.category === "Apple Products" ? "Electronics" : product.category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-white/60 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="font-bold text-lodge-purple">
            ${product.price.toFixed(2)}
          </div>
          <GradientButton
            size="sm"
            onClick={handleAddToOrder}
            className="bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            <span>Add</span>
          </GradientButton>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
