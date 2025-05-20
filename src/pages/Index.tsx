import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { GradientButton } from "@/components/ui/gradient-button";
import CategoryCard from "@/components/ui/CategoryCard";
import { ArrowRight, Check } from "lucide-react";
import { GradualSpacing } from "@/components/ui/gradual-spacing";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";
import { AuroraBackground } from "@/components/ui/aurora-background";
import ProductCard from "@/components/ui/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories } from "@/services/productService";
import DisplayCards from "@/components/ui/display-cards";
import { Truck, Globe, ListChecks, ShieldCheck } from "lucide-react";

const Index = () => {
  const categories = [
    {
      title: "Fragrances",
      description: "Premium scents & colognes",
      icon: "🧴",
      to: "/catalog?category=fragrances"
    },
    {
      title: "Apple Products",
      description: "Latest devices & accessories",
      icon: "📱",
      to: "/catalog?category=apple"
    },
    {
      title: "Moissanite Jewelry",
      description: "Stunning rings & pendants",
      icon: "💎",
      to: "/catalog?category=jewelry"
    },
    {
      title: "Designer Clothes",
      description: "Fashion from top brands",
      icon: "👕",
      to: "/catalog?category=clothes"
    }
  ];

  // Fetch categories and products
  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts()
  });

  // For each category, find the first product in that category
  const featuredProducts = categoriesData.slice(0, 4).map((cat) => {
    // Change display name for Apple Products to Electronics
    const displayName = cat.name === "Apple Products" ? "Electronics" : cat.name;
    const product = allProducts.find((p) => p.category === cat.name);
    return { category: { ...cat, displayName }, product };
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative p-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158')] bg-cover bg-center opacity-10"></div>
        <AuroraBackground className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <h1
                className="font-orbitron font-bold italic uppercase outline-text text-5xl md:text-7xl tracking-widest mb-2"
              >
                1:1 LODGE
              </h1>
              <p className="font-orbitron text-xl md:text-2xl text-white/80 mb-8">
                Straight from the source. No middleman. Just margin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <GradientButton asChild>
                  <Link to="/auth">Sign In to Start Sourcing</Link>
                </GradientButton>
                <GradientButton asChild>
                  <Link to="/catalog">Browse Products</Link>
                </GradientButton>
              </div>
            </div>
          </div>
        </AuroraBackground>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-orbitron text-3xl font-bold mb-4">Premium Product Categories</h2>
            <p className="text-white/70">
              Access high-quality 1:1 products across our curated categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {featuredProducts.map(({ category, product }) => (
              product ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <div key={category.id} className="bg-lodge-card-bg border border-white/10 rounded-lg flex flex-col items-center justify-center h-80">
                  <span className="text-5xl mb-4">📦</span>
                  <h3 className="font-bold text-lg mb-2">{category.displayName}</h3>
                  <p className="text-white/60 text-sm">No products available</p>
                </div>
              )
            ))}
          </div>
          {/* Optionally keep the original category cards below */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div> */}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-lodge-card-bg/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-orbitron text-3xl font-bold mb-4">How 1:1 Lodge Works</h2>
            <p className="text-white/70">
              Our platform connects resellers directly with high-quality suppliers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-lodge-dark-bg border border-white/10 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-lodge-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="font-orbitron text-xl font-semibold mb-2">1. Create Account</h3>
              <p className="text-white/60">Sign up and verify your reseller status to access exclusive products</p>
            </div>
            <div className="bg-lodge-dark-bg border border-white/10 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-lodge-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-orbitron text-xl font-semibold mb-2">2. Top Up Balance</h3>
              <p className="text-white/60">Add funds to your account via cryptocurrency for secure transactions</p>
            </div>
            <div className="bg-lodge-dark-bg border border-white/10 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-lodge-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="font-orbitron text-xl font-semibold mb-2">3. Place Orders</h3>
              <p className="text-white/60">Browse products, place orders, and track deliveries all in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="font-orbitron text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <span role="img" aria-label="Shipping">📦</span> Fast & Secure Shipping — Built for Resellers
            </h2>
            <p className="text-white/70 text-lg mb-8">
              We know timing matters. That's why every order is packed with care, shipped fast, and fully trackable from the moment it leaves our hands to when it lands at your door.
            </p>
            {/* DisplayCards Section - edit cards as needed */}
            <div className="flex justify-center">
              <DisplayCards cards={[
                {
                  icon: <Truck className="size-6 text-green-400" />, title: "3–5 Day U.S. Shipping", description: "Fast delivery for U.S. resellers", date: "Domestic"
                },
                {
                  icon: <Globe className="size-6 text-green-400" />, title: "14-Day Worldwide Delivery", description: "Global reach, reliable timing", date: "International"
                },
                {
                  icon: <ListChecks className="size-6 text-green-400" />, title: "Track Multiple Orders In-App", description: "Real-time tracking for all your shipments", date: "In-App"
                },
                {
                  icon: <ShieldCheck className="size-6 text-green-400" />, title: "Packed Securely", description: "Your haul lands every time", date: "Protected"
                },
              ]} />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-orbitron text-3xl font-bold mb-4">Why Resellers Choose Us</h2>
            <p className="text-white/70">
              Our platform provides unmatched advantages for serious resellers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-lodge-dark-bg border border-white/10 rounded-xl p-6">
              <h3 className="font-orbitron flex items-center gap-2 text-xl font-semibold mb-4">
                <Check className="text-lodge-purple w-5 h-5" />
                Direct Supplier Access
              </h3>
              <p className="text-white/60">Bypass intermediaries and source directly from manufacturers for better margins</p>
            </div>
            
            <div className="bg-lodge-dark-bg border border-white/10 rounded-xl p-6">
              <h3 className="font-orbitron flex items-center gap-2 text-xl font-semibold mb-4">
                <Check className="text-lodge-purple w-5 h-5" />
                Premium Quality
              </h3>
              <p className="text-white/60">Every product meets our strict quality standards for the most discerning customers</p>
            </div>
            
            <div className="bg-lodge-dark-bg border border-white/10 rounded-xl p-6">
              <h3 className="font-orbitron flex items-center gap-2 text-xl font-semibold mb-4">
                <Check className="text-lodge-purple w-5 h-5" />
                Secure Payments
              </h3>
              <p className="text-white/60">Cryptocurrency transactions ensure privacy and security for your business</p>
            </div>
            
            <div className="bg-lodge-dark-bg border border-white/10 rounded-xl p-6">
              <h3 className="font-orbitron flex items-center gap-2 text-xl font-semibold mb-4">
                <Check className="text-lodge-purple w-5 h-5" />
                Reliable Fulfillment
              </h3>
              <p className="text-white/60">Track your orders every step of the way with our advanced logistics system</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lodge-purple/10 border-y border-lodge-purple/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <h2 className="font-orbitron text-3xl font-bold mb-4">Ready to Increase Your Margins?</h2>
            <p className="text-white/70 mb-8">
              Join 1:1 Lodge today and access our exclusive product catalog for resellers
            </p>
            <GradientButton asChild>
              <Link to="/auth" className="flex items-center gap-2">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </GradientButton>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
