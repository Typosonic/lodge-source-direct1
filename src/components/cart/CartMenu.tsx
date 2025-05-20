import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GradientButton } from "@/components/ui/gradient-button";

export const CartMenu = () => {
  const { items, removeItem, updateQuantity, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();
  
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-lodge-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-lodge-dark-bg border-white/10 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">Your Cart</SheetTitle>
        </SheetHeader>
        
        {cartCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <ShoppingCart className="h-16 w-16 text-white/30 mb-4" />
            <p className="text-white/60">Your cart is empty</p>
            <SheetClose asChild>
              <GradientButton
                className="mt-4 bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
                onClick={() => navigate('/catalog')}
              >
                Browse Products
              </GradientButton>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[70vh] pr-4 my-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 bg-lodge-card-bg p-3 rounded-lg border border-white/10"
                  >
                    <div className="w-20 h-20">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md" 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-white/60 text-sm">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center mt-2 justify-between">
                        <div className="flex items-center border border-white/20 rounded-md overflow-hidden">
                          <button
                            className="px-2 py-1 hover:bg-white/10"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <div className="px-3 py-1 border-x border-white/20">
                            {item.quantity}
                          </div>
                          <button
                            className="px-2 py-1 hover:bg-white/10"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          className="text-white/60 hover:text-red-400 text-sm"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <SheetFooter className="border-t border-white/10 pt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <SheetClose asChild>
                  <GradientButton
                    className="w-full bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </GradientButton>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartMenu;
