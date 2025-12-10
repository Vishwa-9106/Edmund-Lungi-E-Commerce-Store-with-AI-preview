import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { MainLayout } from "@/layouts/MainLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/Home/HomePage"));
const ShopPage = lazy(() => import("@/pages/Shop/ShopPage"));
const ProductDetailsPage = lazy(() => import("@/pages/ProductDetails/ProductDetailsPage"));
const AboutPage = lazy(() => import("@/pages/About/AboutPage"));
const ContactPage = lazy(() => import("@/pages/Contact/ContactPage"));
const CartPage = lazy(() => import("@/pages/Cart/CartPage"));
const FAQPage = lazy(() => import("@/pages/FAQ/FAQPage"));
const LoginPage = lazy(() => import("@/pages/Login/LoginPage"));
const SignupPage = lazy(() => import("@/pages/Signup/SignupPage"));
const CustomerDashboard = lazy(() => import("@/pages/CustomerDashboard/CustomerDashboard"));
const AdminDashboard = lazy(() => import("@/pages/Admin/Dashboard/AdminDashboard"));
const SalesAnalysisPage = lazy(() => import("@/pages/Admin/SalesAnalysis/SalesAnalysisPage"));
const ProductsPage = lazy(() => import("@/pages/Admin/Products/ProductsPage"));
const OrdersPage = lazy(() => import("@/pages/Admin/Orders/OrdersPage"));
const UsersPage = lazy(() => import("@/pages/Admin/Users/UsersPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes with MainLayout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/about-us" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Auth Routes (no layout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="sales" element={<SalesAnalysisPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="users" element={<UsersPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
