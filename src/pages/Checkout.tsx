import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input, AddressAutocomplete } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GradientButton } from "@/components/ui/gradient-button";
import { getUserWalletBalance } from "@/services/transactionService";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'wallet'>('wallet');
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [shippingProvider, setShippingProvider] = useState('dhl');
  const shippingProviders = [
    { value: 'dhl', label: 'DHL' },
    { value: 'usps', label: 'USPS' },
    { value: 'ups', label: 'UPS' },
  ];
  // Calculate shipping cost
  const shippingBase = 17.55;
  const shippingPerItem = 5.35;
  const shippingCost = items.length > 0 ? shippingBase + (items.length * shippingPerItem) : 0;
  const orderTotal = getCartTotal() + shippingCost;
  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  });
  
  const handleCheckout = async () => {
    if (!user) {
      toast.error("You need to be logged in to checkout");
      navigate("/auth");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate shipping address
      for (const key in shippingAddress) {
        if (!shippingAddress[key as keyof typeof shippingAddress]) {
          toast.error("Please fill out all shipping address fields");
          setLoading(false);
          return;
        }
      }
      // If using wallet, check balance first
      if (paymentMethod === 'wallet') {
        const balance = await getUserWalletBalance();
        if (balance < orderTotal) {
          toast.error("Insufficient wallet balance for this order");
          setLoading(false);
          return;
        }
      }
      // Create the order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: orderTotal,
          status: 'unfulfilled',
          shipping_provider: shippingProvider,
          shipping_cost: shippingCost,
          shipping_name: shippingAddress.name,
          shipping_street: shippingAddress.street,
          shipping_city: shippingAddress.city,
          shipping_state: shippingAddress.state,
          shipping_zip: shippingAddress.zip,
          shipping_country: shippingAddress.country,
          shipping_phone: shippingAddress.phone,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create the order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // If using wallet, create a transaction and deduct from balance
      if (paymentMethod === 'wallet') {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: -orderTotal,
            type: 'purchase',
            reference: `Order #${orderData.id}`,
            status: 'completed',
          });
        if (transactionError) throw transactionError;
        // Deduct from wallet_balance
        const currentBalance = await getUserWalletBalance();
        const newBalance = currentBalance - orderTotal;
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', user.id);
        if (balanceError) throw balanceError;
      }
      
      toast.success("Order placed successfully!");
      clearCart();
      navigate(`/orders`);
      
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(`Checkout failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <Layout>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          {items.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
              <p className="text-white/60 mb-6">
                Add some products to your cart before checking out.
              </p>
              <GradientButton
                variant="default"
                className="bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
                onClick={() => navigate('/catalog')}
              >
                Browse Products
              </GradientButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Card className="bg-lodge-card-bg border-white/10">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Review your items before placing the order</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-4 pb-4 border-b border-white/10"
                        >
                          <div className="w-16 h-16">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md" 
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-white/60 text-sm">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                            <div className="text-white/60 text-sm">${item.price.toFixed(2)} each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-lodge-card-bg border-white/10">
                  <CardHeader>
                    <CardTitle>Shipping Provider</CardTitle>
                    <CardDescription>Select your preferred shipping provider</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <label htmlFor="shipping-provider" className="block text-white/80 mb-1">Provider</label>
                      <select
                        id="shipping-provider"
                        value={shippingProvider}
                        onChange={e => setShippingProvider(e.target.value)}
                        className="w-full bg-lodge-dark-bg border border-white/10 rounded px-3 py-2 text-white"
                      >
                        {shippingProviders.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-2 text-white/70 text-sm">
                      Shipping cost: <span className="font-bold text-white">${shippingCost.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-lodge-card-bg border-white/10">
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                    <CardDescription>Enter your shipping details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping-name">Full Name</Label>
                        <Input
                          id="shipping-name"
                          placeholder="Full Name"
                          value={shippingAddress.name}
                          onChange={e => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                          className="bg-lodge-dark-bg border-white/10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-phone">Phone Number</Label>
                        <Input
                          id="shipping-phone"
                          placeholder="Phone Number"
                          value={shippingAddress.phone}
                          onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          className="bg-lodge-dark-bg border-white/10"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="shipping-street">Street Address</Label>
                        <Input
                          id="shipping-street"
                          placeholder="Street Address"
                          value={shippingAddress.street}
                          onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className="bg-lodge-dark-bg border-white/10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-city">City</Label>
                        <Input
                          id="shipping-city"
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="bg-lodge-dark-bg border-white/10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-state">State/Province</Label>
                        <Input
                          id="shipping-state"
                          placeholder="State/Province"
                          value={shippingAddress.state}
                          onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="bg-lodge-dark-bg border-white/10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-zip">ZIP/Postal Code</Label>
                        <Input
                          id="shipping-zip"
                          placeholder="ZIP/Postal Code"
                          value={shippingAddress.zip}
                          onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                          className="bg-lodge-dark-bg border-white/10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-country">Country</Label>
                        <Input
                          id="shipping-country"
                          placeholder="Country"
                          value={shippingAddress.country}
                          onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          className="bg-lodge-dark-bg border-white/10"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="bg-lodge-card-bg border-white/10">
                  <CardHeader>
                    <CardTitle>Order Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/70">Subtotal</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Shipping ({shippingProviders.find(p => p.value === shippingProvider)?.label})</span>
                        <span>${shippingCost.toFixed(2)}</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <GradientButton
                      className="w-full bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </GradientButton>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Checkout;
