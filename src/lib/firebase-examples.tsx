/**
 * Example: How to use Firebase Firestore for Products
 * 
 * This file demonstrates how to integrate Firestore with your e-commerce store.
 * You can use these patterns in your actual product pages.
 */

import { useState, useEffect } from 'react';
import {
    addDocument,
    getDocuments,
    updateDocument,
    deleteDocument,
    subscribeToCollection,
    where,
    orderBy
} from '@/lib/firestore';

// Product interface
interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    inStock: boolean;
    quantity: number;
    createdAt?: any;
    updatedAt?: any;
}

// Example 1: Add a new product (Admin function)
export async function addNewProduct(productData: Omit<Product, 'id'>) {
    try {
        const productId = await addDocument('products', productData);
        console.log('Product added with ID:', productId);
        return productId;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

// Example 2: Get all products
export async function getAllProducts(): Promise<Product[]> {
    try {
        const products = await getDocuments<Product>('products');
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Example 3: Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
    try {
        const products = await getDocuments<Product>('products', [
            where('category', '==', category),
            where('inStock', '==', true)
        ]);
        return products;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return [];
    }
}

// Example 4: Update product stock
export async function updateProductStock(productId: string, newQuantity: number) {
    try {
        await updateDocument('products', productId, {
            quantity: newQuantity,
            inStock: newQuantity > 0
        });
        console.log('Product stock updated');
    } catch (error) {
        console.error('Error updating product stock:', error);
        throw error;
    }
}

// Example 5: Delete a product
export async function deleteProduct(productId: string) {
    try {
        await deleteDocument('products', productId);
        console.log('Product deleted');
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// Example 6: React Component with real-time products
export function ProductsListExample() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToCollection<Product>(
            'products',
            (updatedProducts) => {
                setProducts(updatedProducts);
                setLoading(false);
            },
            [
                where('inStock', '==', true),
                orderBy('createdAt', 'desc')
            ]
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading products...</div>;
    }

    return (
        <div>
            <h2>Products (Real-time)</h2>
            {products.map((product) => (
                <div key={product.id}>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>Price: ₹{product.price}</p>
                    <p>In Stock: {product.quantity}</p>
                </div>
            ))}
        </div>
    );
}

// Example 7: User Orders
interface Order {
    id?: string;
    userId: string;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    };
    createdAt?: any;
    updatedAt?: any;
}

export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
    try {
        const orderId = await addDocument('orders', orderData);
        console.log('Order created with ID:', orderId);
        return orderId;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
    try {
        const orders = await getDocuments<Order>('orders', [
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        ]);
        return orders;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
}

// Example 8: Shopping Cart
interface Cart {
    id?: string;
    userId: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    updatedAt?: any;
}

export async function updateCart(userId: string, items: Cart['items']) {
    try {
        await updateDocument('carts', userId, {
            items,
        });
        console.log('Cart updated');
    } catch (error) {
        console.error('Error updating cart:', error);
        throw error;
    }
}

export async function getCart(userId: string): Promise<Cart | null> {
    try {
        const cart = await getDocuments<Cart>('carts', [
            where('userId', '==', userId)
        ]);
        return cart[0] || null;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
    }
}
