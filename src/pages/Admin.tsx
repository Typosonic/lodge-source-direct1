import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash, X, Check, Upload, Package } from "lucide-react";
import { Order } from "@/components/ui/OrderCard";
import { Product } from "@/components/ui/ProductCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCategories } from "@/services/productService";
import clsx from "clsx";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: ""
  });
  
  // Order fulfillment state
  const [fulfilling, setFulfilling] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  
  // Add state for upload loading
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Fetch categories from Supabase
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories();
      setCategories(cats || []);
    };
    fetchCategories();
  }, []);
  
  // Fetch real orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          tracking_number,
          user_id,
          order_items:order_items(
            product_id,
            quantity,
            price,
            products(name)
          )
        `)
        .order('created_at', { ascending: false });
      if (ordersError) {
        toast.error("Failed to fetch orders: " + ordersError.message);
        return;
      }
      const formattedOrders: Order[] = (ordersData || []).map((order: any) => ({
        id: order.id,
        status: order.status,
        items: (order.order_items || []).map((item: any) => ({
          productId: item.product_id,
          name: item.products?.name || 'Unknown Product',
          price: Number(item.price),
          quantity: item.quantity
        })),
        totalPrice: Number(order.total_amount),
        date: order.created_at,
        trackingNumber: order.tracking_number
      }));
      setOrders(formattedOrders);
    };
    fetchOrders();
  }, []);
  
  // Fetch real products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (productsError) {
        toast.error("Failed to fetch products: " + productsError.message);
        return;
      }
      setProducts((productsData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image_url,
        category: p.category_id, // You may want to join with categories for the name
        description: p.description
      })));
    };
    fetchProducts();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled in the filtered items
  };
  
  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      category: "",
      description: "",
      image: ""
    });
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      image: product.image
    });
  };
  
  const handleDeleteProduct = async (productId: string) => {
    setUploading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
      toast.success("Product deleted successfully");
      // Refetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (productsError) {
        toast.error("Failed to fetch products: " + productsError.message);
      } else {
        setProducts((productsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image: p.image_url,
          category: p.category_id,
          description: p.description
        })));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
    setUploading(false);
  };
  
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.description || !productForm.image) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingProduct) {
        // Update existing product in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name,
            price: parseFloat(productForm.price),
            category_id: productForm.category,
            description: productForm.description,
            image_url: productForm.image
          })
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        // Add new product in Supabase
        const { error } = await supabase
          .from('products')
          .insert({
            name: productForm.name,
            price: parseFloat(productForm.price),
            category_id: productForm.category,
            description: productForm.description,
            image_url: productForm.image
          });
        if (error) throw error;
        toast.success("Product added successfully");
      }
      // Refetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (productsError) {
        toast.error("Failed to fetch products: " + productsError.message);
      } else {
        setProducts((productsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image: p.image_url,
          category: p.category_id,
          description: p.description
        })));
      }
      resetProductForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };
  
  const handleFulfillOrder = async (orderId: string) => {
    if (!trackingNumber) {
      toast.error("Please enter a tracking number");
      return;
    }
    // Update order in Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status: 'fulfilled', tracking_number: trackingNumber })
      .eq('id', orderId);
    if (error) {
      toast.error("Failed to update order: " + error.message);
      return;
    }
    // Refetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        tracking_number,
        user_id,
        order_items:order_items(
          product_id,
          quantity,
          price,
          products(name)
        )
      `)
      .order('created_at', { ascending: false });
    if (ordersError) {
      toast.error("Failed to fetch orders: " + ordersError.message);
      return;
    }
    const formattedOrders: Order[] = (ordersData || []).map((order: any) => ({
      id: order.id,
      status: order.status,
      items: (order.order_items || []).map((item: any) => ({
        productId: item.product_id,
        name: item.products?.name || 'Unknown Product',
        price: Number(item.price),
        quantity: item.quantity
      })),
      totalPrice: Number(order.total_amount),
      date: order.created_at,
      trackingNumber: order.tracking_number
    }));
    setOrders(formattedOrders);
    setFulfilling(null);
    setTrackingNumber("");
    toast.success("Order marked as fulfilled");
  };
  
  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Add upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (error) throw error;
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setProductForm({ ...productForm, image: publicUrlData.publicUrl });
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    }
    setUploading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/60">
              Manage orders, products, and other platform settings
            </p>
          </div>
          <form onSubmit={handleSearch} className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-lodge-card-bg border-white/10 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-lodge-card-bg border border-white/10 p-1">
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-lodge-purple data-[state=active]:text-white"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="data-[state=active]:bg-lodge-purple data-[state=active]:text-white"
            >
              Products
            </TabsTrigger>
          </TabsList>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <Card className="bg-lodge-card-bg border-white/10">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Review and fulfill customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                            <TableCell>{formatDate(order.date)}</TableCell>
                            <TableCell>
                              {order.items.map((item, index) => (
                                <div key={item.productId}>
                                  {item.quantity}x {item.name}
                                  {index < order.items.length - 1 && ", "}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                            <TableCell>
                              <span 
                                className={`inline-block px-2 py-1 rounded text-xs font-medium 
                                  ${order.status === "fulfilled" 
                                    ? "bg-green-600/20 text-green-400" 
                                    : "bg-yellow-600/20 text-yellow-400"
                                  }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {order.status === "unfulfilled" && (
                                fulfilling === order.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      placeholder="Tracking #"
                                      value={trackingNumber}
                                      onChange={(e) => setTrackingNumber(e.target.value)}
                                      className="h-8 w-36 bg-lodge-dark-bg border-white/10 text-sm"
                                    />
                                    <GradientButton
                                      onClick={() => handleFulfillOrder(order.id)}
                                    >
                                      <Check className="h-4 w-4 text-green-500" />
                                    </GradientButton>
                                    <GradientButton
                                      onClick={() => setFulfilling(null)}
                                    >
                                      <X className="h-4 w-4 text-red-400" />
                                    </GradientButton>
                                  </div>
                                ) : (
                                  <GradientButton
                                    onClick={() => setFulfilling(order.id)}
                                  >
                                    <Package className="h-4 w-4 mr-1" />
                                    Fulfill
                                  </GradientButton>
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-white/60">No orders found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product List */}
              <Card className="bg-lodge-card-bg border-white/10 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>Add, edit or remove products</CardDescription>
                  </div>
                  <GradientButton 
                    onClick={resetProductForm}
                    className="bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Product
                  </GradientButton>
                </CardHeader>
                <CardContent>
                  {filteredProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="w-10 h-10 rounded overflow-hidden bg-lodge-dark-bg">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <GradientButton
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </GradientButton>
                                  <GradientButton
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </GradientButton>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-white/60">No products found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Product Form */}
              <Card className="bg-lodge-card-bg border-white/10">
                <CardHeader>
                  <CardTitle>{editingProduct ? "Edit Product" : "Add Product"}</CardTitle>
                  <CardDescription>
                    {editingProduct ? "Update product details" : "Create a new product listing"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        placeholder="Product name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        className="bg-lodge-dark-bg border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Price ($)</Label>
                      <Input
                        id="product-price"
                        type="number"
                        placeholder="0.00"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="bg-lodge-dark-bg border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product-category">Category</Label>
                      <Select
                        value={productForm.category}
                        onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                      >
                        <SelectTrigger className="bg-lodge-dark-bg border-white/10">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-lodge-dark-bg border-white/10">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        placeholder="Product description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        className="bg-lodge-dark-bg border-white/10 min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product-image">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="product-image"
                          placeholder="https://example.com/image.jpg"
                          value={productForm.image}
                          onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                          className="bg-lodge-dark-bg border-white/10"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleImageUpload}
                        />
                        <GradientButton
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <span className="animate-spin w-4 h-4 block border-2 border-white border-t-transparent rounded-full"></span>
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </GradientButton>
                      </div>
                      {/* Image preview for any non-empty URL */}
                      {productForm.image && (
                        <div className="mt-2 border border-white/10 rounded-md p-2 bg-white/5 flex justify-center">
                          <img
                            src={productForm.image}
                            alt="Product preview"
                            className={clsx("h-32 rounded object-contain mx-auto transparent-background")}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 flex gap-3">
                      <GradientButton
                        type="button"
                        onClick={resetProductForm}
                      >
                        Cancel
                      </GradientButton>
                      <GradientButton
                        type="submit"
                        className="bg-lodge-purple hover:bg-lodge-dark-purple text-white flex-1 button-glow"
                      >
                        {editingProduct ? "Update Product" : "Add Product"}
                      </GradientButton>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
