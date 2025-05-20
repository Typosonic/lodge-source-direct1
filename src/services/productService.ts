import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/components/ui/ProductCard";

// Fetch all products or filter by category
export async function getProducts(category?: string): Promise<Product[]> {
  try {
    let query = supabase.from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        categories!inner(name, slug)
      `);
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('categories.slug', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    
    // Map the Supabase data to our Product interface
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      image: item.image_url,
      category: item.categories?.name || ''
    }));
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

// Fetch product categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('name');
  
  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  
  return data;
}
