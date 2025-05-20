import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/components/ui/OrderCard";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderResponse = {
  id: string;
  status: "unfulfilled" | "processing" | "fulfilled" | "cancelled";
  totalPrice: number;
  date: string;
  trackingNumber?: string;
  items: OrderItem[];
};

// Fetch all orders for the current user
export async function getUserOrders(): Promise<Order[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        total_amount, 
        created_at, 
        tracking_number,
        shipping_provider,
        shipping_name,
        shipping_street,
        shipping_city,
        shipping_state,
        shipping_zip,
        shipping_country,
        shipping_phone
      `)
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return [];
    }
    
    const formattedOrders: Order[] = [];
    
    // For each order, fetch its items
    for (const order of orders) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          price,
          products(name)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.error(`Error fetching items for order ${order.id}:`, itemsError);
        continue;
      }
      
      const formattedItems: OrderItem[] = orderItems.map(item => ({
        productId: item.product_id,
        name: item.products?.name || 'Unknown Product',
        price: Number(item.price),
        quantity: item.quantity
      }));
      
      // Fix the type error by ensuring the status is of the correct type
      const orderStatus = order.status as "unfulfilled" | "processing" | "fulfilled" | "cancelled";
      
      formattedOrders.push({
        id: order.id,
        status: orderStatus,
        items: formattedItems,
        totalPrice: Number(order.total_amount),
        date: order.created_at,
        ...(order.tracking_number && { trackingNumber: order.tracking_number }),
        shippingProvider: order.shipping_provider,
        shippingName: order.shipping_name,
        shippingStreet: order.shipping_street,
        shippingCity: order.shipping_city,
        shippingState: order.shipping_state,
        shippingZip: order.shipping_zip,
        shippingCountry: order.shipping_country,
        shippingPhone: order.shipping_phone
      });
    }
    
    return formattedOrders;
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    return [];
  }
}

// Get order details by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        total_amount, 
        created_at, 
        tracking_number,
        shipping_provider,
        shipping_name,
        shipping_street,
        shipping_city,
        shipping_state,
        shipping_zip,
        shipping_country,
        shipping_phone
      `)
      .eq('id', orderId)
      .eq('user_id', user.user.id)
      .single();
    
    if (orderError) {
      console.error("Error fetching order:", orderError);
      return null;
    }
    
    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
        products(name)
      `)
      .eq('order_id', order.id);
    
    if (itemsError) {
      console.error(`Error fetching items for order ${order.id}:`, itemsError);
      return null;
    }
    
    const formattedItems: OrderItem[] = orderItems.map(item => ({
      productId: item.product_id,
      name: item.products?.name || 'Unknown Product',
      price: Number(item.price),
      quantity: item.quantity
    }));
    
    // Fix the type error by ensuring the status is of the correct type
    const orderStatus = order.status as "unfulfilled" | "processing" | "fulfilled" | "cancelled";
    
    return {
      id: order.id,
      status: orderStatus,
      items: formattedItems,
      totalPrice: Number(order.total_amount),
      date: order.created_at,
      ...(order.tracking_number && { trackingNumber: order.tracking_number }),
      shippingProvider: order.shipping_provider,
      shippingName: order.shipping_name,
      shippingStreet: order.shipping_street,
      shippingCity: order.shipping_city,
      shippingState: order.shipping_state,
      shippingZip: order.shipping_zip,
      shippingCountry: order.shipping_country,
      shippingPhone: order.shipping_phone
    };
  } catch (error) {
    console.error("Error in getOrderById:", error);
    return null;
  }
}
