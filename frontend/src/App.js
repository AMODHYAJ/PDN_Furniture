import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import UserProfile from "./Pages/UserProfile";
import Wishlist from "./Pages/Wishlist";
import TrackOrder from "./Pages/TrackOrder";
import OrderDetails from "./Pages/OrderDetails";
import OrderHistory from "./Pages/OrderHistory";
import OrderConfirmation from "./Pages/OrderConfirmation";
import Checkout from "./Pages/Checkout";
import Cart from "./Pages/Cart";
import Navbar from "./Components/Navbar";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import Dashboard from "./Pages/Dashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import ProductCatalog from "./Pages/ProductCatalog";
import ProductDetails from "./Pages/ProductDetails";
import AdminOrders from "./Pages/AdminOrders";
import AdminOrderDetails from "./Pages/AdminOrderDetails";
import AdminOrderStats from "./Pages/AdminOrderStats";
import AdminUsers from "./Pages/AdminUsers";
import AdminProduct from "./Pages/AdminProduct";
import AddProduct from "./Pages/AddProduct";
import EditProduct from "./Pages/EditProduct";
import AdminProductView from "./Pages/AdminProductView";
import DiscountManager from "./Pages/DiscountManager";
import AdminInventory from "./Pages/AdminInventory";
import AddInventory from "./Pages/AddInventory";
import UpdateInventory from "./Pages/UpdateInventory";
import AdminProgress from "./Pages/AdminProgress";
import ProgressOrderDetails from "./Pages/ProgressOrderDetails";
import TaskPreview from "./Pages/TaskPreview";
import Alerts from "./Pages/Alerts";
import EmployeeList from "./Pages/EmployeeList";
import EmployeeForm from "./Pages/EmployeeForm";
import PendingOrders from "./Pages/PendingOrders";
import OngoingOrders from "./Pages/OngoingOrders";
import CompletedOrders from "./Pages/CompletedOrders";
import ProductAnalytics from "./Pages/ProductAnalytics";
import DeliveryDashboard from "./Pages/DeliveryDashboard";
import DeliveryOfficersList from "./Pages/DeliveryOfficersList";
import DeliveryOfficerForm from "./Pages/DeliveryOfficerForm";
import "./App.css";
import AboutUs from "./Pages/AboutUs";
import InventoryAIDashboard from "./Pages/InventoryAIDashboard";

const App = () => {
  return (
    <div>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Protected Routes (Authenticated Users) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/history"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId/tracking"
            element={
              <ProtectedRoute>
                <TrackOrder />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes (Authenticated Admins) */}
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={<AdminOrderDetails />}
          />
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <AdminRoute>
                <AdminOrderStats />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/add-product"
            element={
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/edit-product/:id"
            element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/view-product/:id"
            element={
              <AdminRoute>
                <AdminProductView />
              </AdminRoute>
            }
          />
          <Route
            path="/manage-discounts"
            element={
              <AdminRoute>
                <DiscountManager />
              </AdminRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <AdminRoute>
                <ProductAnalytics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <AdminRoute>
                <AdminInventory />
              </AdminRoute>
            }
          />
          <Route
            path="/add-inventory"
            element={
              <AdminRoute>
                <AddInventory />
              </AdminRoute>
            }
          />
          <Route
            path="/update-inventory/:id"
            element={
              <AdminRoute>
                <UpdateInventory />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/inventory-ai"
            element={
              <AdminRoute>
                <InventoryAIDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/workforce"
            element={
              <AdminRoute>
                <AdminProgress />
              </AdminRoute>
            }
          />
          <Route
            path="/order/:id"
            element={
              <AdminRoute>
                <ProgressOrderDetails />
              </AdminRoute>
            }
          />
          <Route
            path="/taskpreview"
            element={
              <AdminRoute>
                <TaskPreview />
              </AdminRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <AdminRoute>
                <Alerts />
              </AdminRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <AdminRoute>
                <EmployeeList />
              </AdminRoute>
            }
          />
          <Route
            path="/employees/add"
            element={
              <AdminRoute>
                <EmployeeForm />
              </AdminRoute>
            }
          />
          <Route
            path="/employees/edit/:id"
            element={
              <AdminRoute>
                <EmployeeForm />
              </AdminRoute>
            }
          />
          <Route
            path="/pending"
            element={
              <AdminRoute>
                <PendingOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/ongoing"
            element={
              <AdminRoute>
                <OngoingOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/completed"
            element={
              <AdminRoute>
                <CompletedOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/delivery"
            element={
              <AdminRoute>
                <DeliveryDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/delivery-officers"
            element={
              <AdminRoute>
                <DeliveryOfficersList />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/delivery-officers/add"
            element={
              <AdminRoute>
                <DeliveryOfficerForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/delivery-officers/edit/:id"
            element={
              <AdminRoute>
                <DeliveryOfficerForm />
              </AdminRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </div>
  );
};

export default App;
