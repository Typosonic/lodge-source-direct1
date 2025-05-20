import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Tabs as VercelTabs } from "@/components/ui/vercel-tabs";
import { Search } from "lucide-react";
import { getProducts, getCategories } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get the category from URL params
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  // Fetch categories using React Query
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorObj
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  // Fetch products using React Query with category dependency
  const { 
    data: allProducts = [], 
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj
  } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => getProducts(activeCategory === 'all' ? undefined : activeCategory)
  });
  
  // Filter products by search term
  const filteredProducts = allProducts.filter(product => 
    searchTerm ? (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true
  );
  
  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filtered products
  };

  // Loading state combines both category and product loading
  const loading = categoriesLoading || productsLoading;

  // Show toast notifications for errors
  useEffect(() => {
    if (categoriesError) {
      toast.error("Failed to load categories: " + (categoriesErrorObj?.message || "Unknown error"));
    }
    if (productsError) {
      toast.error("Failed to load products: " + (productsErrorObj?.message || "Unknown error"));
    }
  }, [categoriesError, productsError, categoriesErrorObj, productsErrorObj]);

  // Build tabs array for VercelTabs
  const tabs = [
    { id: "all", label: "All Products" },
    ...categories.map((category: any) => ({
      id: category.slug,
      label: category.name === "Apple Products" ? "Electronics" : category.name
    }))
  ];

  return (
    <Layout>
      <ErrorBoundary>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Product Catalog</h1>
              <p className="text-white/60">
                Browse our selection of high-quality products for resellers
              </p>
            </div>
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 bg-lodge-card-bg border-white/10 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          <div className="mb-8">
            <VercelTabs
              tabs={tabs}
              activeTab={activeCategory}
              onTabChange={handleCategoryChange}
              className="mb-4"
            />
            {/* Product Grid/Content */}
            {categoriesError || productsError ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">
                  {categoriesError && `Failed to load categories: ${categoriesErrorObj?.message || "Unknown error"}`}
                  {productsError && `Failed to load products: ${productsErrorObj?.message || "Unknown error"}`}
                </p>
                <GradientButton onClick={() => window.location.reload()}>
                  Retry
                </GradientButton>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-80 animate-pulse bg-lodge-card-bg rounded-lg"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/60 mb-4">No products found matching your search criteria</p>
                <GradientButton onClick={() => setSearchTerm("")}>Clear Search</GradientButton>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default Catalog;
