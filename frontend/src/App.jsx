import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ROLE_HOME, isStaff, useAuth } from './lib/auth.jsx';
import Shell from './layout/Shell.jsx';
import { Spinner, Empty } from './ui/bits.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

const page = (loader) => lazy(loader);

const RegisterSeller = page(() => import('./pages/auth/RegisterSeller.jsx'));
const ResetPasswordPage = page(() => import('./pages/auth/ResetPasswordPage.jsx'));

const HomePage = page(() => import('./pages/public/Home.jsx'));
const BecomeSeller = page(() => import('./pages/public/BecomeSeller.jsx'));
const ForBuyer = page(() => import('./pages/public/ForBuyer.jsx'));
const ChemicalsPage = page(() => import('./pages/public/ChemicalsPage.jsx'));
const AppPage = page(() => import('./pages/public/AppPage.jsx'));
const BlogPage = page(() => import('./pages/public/BlogPage.jsx'));
const AboutPage = page(() => import('./pages/public/AboutPage.jsx'));
const HelpPage = page(() => import('./pages/public/HelpPage.jsx'));
const Notifications = page(() => import('./pages/shared/Notifications.jsx'));
const Profile = page(() => import('./pages/shared/Profile.jsx'));

const SellerOverview = page(() => import('./pages/seller/Overview.jsx'));
const SellerChemicals = page(() => import('./pages/seller/Chemicals.jsx'));
const SellerInventory = page(() => import('./pages/seller/Inventory.jsx'));
const SellerOrders = page(() => import('./pages/seller/Orders.jsx'));
const SellerPayments = page(() => import('./pages/seller/Payments.jsx'));

const BuyerDashboard = page(() => import('./pages/buyer/Dashboard.jsx'));
const BuyerCatalog = page(() => import('./pages/buyer/Catalog.jsx'));
const BuyerChemical = page(() => import('./pages/buyer/ChemicalDetail.jsx'));
const BuyerRfqs = page(() => import('./pages/buyer/Rfqs.jsx'));
const BuyerOrders = page(() => import('./pages/buyer/Orders.jsx'));
const BuyerShipments = page(() => import('./pages/buyer/Shipments.jsx'));
const BuyerInvoices = page(() => import('./pages/buyer/Invoices.jsx'));
const BuyerPayments = page(() => import('./pages/buyer/Payments.jsx'));

const AdminDashboard = page(() => import('./pages/admin/Dashboard.jsx'));
const AdminApprovals = page(() => import('./pages/admin/Approvals.jsx'));
const AdminChemicals = page(() => import('./pages/admin/Chemicals.jsx'));
const AdminChemical = page(() => import('./pages/admin/ChemicalDetail.jsx'));
const AdminQuotations = page(() => import('./pages/admin/Quotations.jsx'));
const AdminOrders = page(() => import('./pages/admin/Orders.jsx'));
const AdminTransport = page(() => import('./pages/admin/Transportation.jsx'));
const AdminInvoices = page(() => import('./pages/admin/Invoices.jsx'));
const AdminPayments = page(() => import('./pages/admin/Payments.jsx'));
const AdminExpenses = page(() => import('./pages/admin/Expenses.jsx'));
const AdminAnalytics = page(() => import('./pages/admin/Analytics.jsx'));
const AdminDirectory = page(() => import('./pages/admin/Directory.jsx'));
const AdminUsers = page(() => import('./pages/admin/Users.jsx'));
const AdminMargins = page(() => import('./pages/admin/MarginPolicies.jsx'));
const AdminGst = page(() => import('./pages/admin/Gst.jsx'));
const AdminExpenseCategories = page(() => import('./pages/admin/ExpenseCategories.jsx'));
const AdminAudit = page(() => import('./pages/admin/AuditLogs.jsx'));
const AdminPlatform = page(() => import('./pages/admin/Platform.jsx'));
const AdminBackup = page(() => import('./pages/admin/Backup.jsx'));

function Guard({ allow, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="grid min-h-screen place-items-center"><Spinner label="Opening your workspace" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allow(user.role)) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return children;
}

function Home() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />;
}

function NotFound() {
  return <Empty title="Page not found" hint="This page doesn't exist, or you don't have access to it. Use the menu to get back on track." />;
}

const SuperOnly = ({ children }) => <Guard allow={(r) => r === 'SUPER_ADMIN'}>{children}</Guard>;

export default function App() {
  return (
    <Suspense fallback={<div className="p-8"><Spinner /></div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/become-seller" element={<BecomeSeller />} />
        <Route path="/for-buyers" element={<ForBuyer />} />
        <Route path="/chemicals" element={<ChemicalsPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/workspace" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/buyer" element={<Register />} />
        <Route path="/register/seller" element={<RegisterSeller />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />

        <Route path="/seller" element={<Guard allow={(r) => r === 'SELLER'}><Shell /></Guard>}>
          <Route index element={<SellerOverview />} />
          <Route path="chemicals" element={<SellerChemicals />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="payments" element={<SellerPayments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/buyer" element={<Guard allow={(r) => r === 'BUYER'}><Shell /></Guard>}>
          <Route index element={<BuyerDashboard />} />
          <Route path="chemicals" element={<BuyerCatalog />} />
          <Route path="chemicals/:id" element={<BuyerChemical />} />
          <Route path="rfqs" element={<BuyerRfqs />} />
          <Route path="orders" element={<BuyerOrders />} />
          <Route path="shipments" element={<BuyerShipments />} />
          <Route path="invoices" element={<BuyerInvoices />} />
          <Route path="payments" element={<BuyerPayments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<Guard allow={isStaff}><Shell /></Guard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="chemicals" element={<AdminChemicals />} />
          <Route path="chemicals/:id" element={<AdminChemical />} />
          <Route path="quotations" element={<AdminQuotations />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="transportation" element={<AdminTransport />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="directory" element={<AdminDirectory />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="users" element={<SuperOnly><AdminUsers /></SuperOnly>} />
          <Route path="margin-policies" element={<SuperOnly><AdminMargins /></SuperOnly>} />
          <Route path="gst" element={<SuperOnly><AdminGst /></SuperOnly>} />
          <Route path="expense-categories" element={<SuperOnly><AdminExpenseCategories /></SuperOnly>} />
          <Route path="audit-logs" element={<SuperOnly><AdminAudit /></SuperOnly>} />
          <Route path="platform" element={<SuperOnly><AdminPlatform /></SuperOnly>} />
          <Route path="backup" element={<SuperOnly><AdminBackup /></SuperOnly>} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
