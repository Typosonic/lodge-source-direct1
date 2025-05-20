import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { Product } from "@/components/ui/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      categories!inner(name, slug)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: Number(data.price),
    image: data.image_url,
    category: data.categories?.name || ''
  };
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id || ''),
    enabled: !!id
  });
  
  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success("Product added to cart");
  };
  
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : prev);

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Link to="/catalog" className="inline-flex items-center text-white/70 hover:text-lodge-purple transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Link>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-lodge-card-bg animate-pulse rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-10 bg-lodge-card-bg animate-pulse rounded-lg"></div>
              <div className="h-6 bg-lodge-card-bg animate-pulse rounded-lg"></div>
              <div className="h-6 bg-lodge-card-bg animate-pulse rounded-lg w-1/2"></div>
              <div className="h-20 bg-lodge-card-bg animate-pulse rounded-lg mt-4"></div>
              <div className="h-12 bg-lodge-card-bg animate-pulse rounded-lg mt-4"></div>
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-lodge-card-bg border border-white/10 rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[400px] object-cover"
              />
            </div>
            
            <div>
              <div className="inline-block px-3 py-1 bg-lodge-purple/20 text-lodge-purple rounded-full text-sm font-medium mb-4">
                {product.category}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-white/70 mb-4">{product.description}</p>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="text-lodge-purple font-bold text-3xl">
                  ${product.price.toFixed(2)}
                </div>
                <div className="text-white/40 line-through">
                  ${(product.price * 1.5).toFixed(2)}
                </div>
              </div>
              
              <Card className="bg-lodge-dark-bg border-white/10 p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Premium 1:1 quality</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Fast worldwide shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Secure payment options</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Discreet packaging</span>
                  </div>
                </div>
              </Card>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-white/20 rounded-md overflow-hidden">
                  <button
                    className="px-3 py-2 hover:bg-white/10"
                    onClick={decrementQuantity}
                  >
                    -
                  </button>
                  <div className="px-4 py-2 border-x border-white/20">
                    {quantity}
                  </div>
                  <button
                    className="px-3 py-2 hover:bg-white/10"
                    onClick={incrementQuantity}
                  >
                    +
                  </button>
                </div>
                
                <Button 
                  className="bg-lodge-purple hover:bg-lodge-dark-purple text-white flex-grow button-glow"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
              
              <div className="text-white/60 text-sm">
                Total: ${(product.price * quantity).toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-white/60 mb-6">
              The product you are looking for does not exist or has been removed.
            </p>
            <Button 
              variant="default" 
              className="bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
              asChild
            >
              <Link to="/catalog">Browse Catalog</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
