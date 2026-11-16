import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { PublicLayout } from './components/PublicLayout';
import { WorkspaceLayout } from './components/WorkspaceLayout';

// Public Pages (1–13)
import { HomePage } from './pages/public/HomePage';
import { ExploreCarsPage } from './pages/public/ExploreCarsPage';
import { BrowseGroupsPage } from './pages/public/BrowseGroupsPage';
import { PublicGroupDetailsPage } from './pages/public/PublicGroupDetailsPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { FaqPage } from './pages/public/FaqPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';

// User Pages (14–24)
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { MyProfilePage } from './pages/user/MyProfilePage';
import { MyRequestsPage } from './pages/user/MyRequestsPage';
import { CreateRequestPage } from './pages/user/CreateRequestPage';
import { MyGroupsPage } from './pages/user/MyGroupsPage';
import { UserGroupDetailsPage } from './pages/user/UserGroupDetailsPage';
import { DealerOffersPage } from './pages/user/DealerOffersPage';
import { OfferComparisonPage } from './pages/user/OfferComparisonPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { PurchaseTrackingPage } from './pages/user/PurchaseTrackingPage';
import { AccountSettingsPage } from './pages/user/AccountSettingsPage';

// Admin Pages (25–35)
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage';
import { AdminModelsPage } from './pages/admin/AdminModelsPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminGroupsPage } from './pages/admin/AdminGroupsPage';
import { AdminDealersPage } from './pages/admin/AdminDealersPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminPurchasesPage } from './pages/admin/AdminPurchasesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RoleGuard: React.FC<{
  allowedRole: 'user' | 'admin';
  children: React.ReactNode;
}> = ({ allowedRole, children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (currentUser.role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F6] px-4">
        <div className="bg-white border border-[#E4E4E0] rounded-xl max-w-md w-full p-8 text-center space-y-3">
          <h1 className="text-xl font-bold text-[#17191D] font-display">
            Role Access Restricted
          </h1>
          <p className="text-sm text-[#5A5F6B]">
            This section requires <strong>{allowedRole}</strong> privileges. You are currently
            signed in as <strong>{currentUser.role}</strong> ({currentUser.email}).
          </p>
          <div className="pt-3 flex justify-center gap-3">
            <Link
              to={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg"
            >
              Go to My Workspace
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-xs font-medium border border-[#D8D8D2] rounded-lg"
            >
              Public Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const NotFoundPage: React.FC = () => (
  <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
    <h1 className="text-3xl font-extrabold text-[#17191D] font-display">Page Not Found</h1>
    <p className="text-sm text-[#5A5F6B]">
      The requested AutoCollective page could not be located.
    </p>
    <Link
      to="/"
      className="inline-block px-5 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg"
    >
      Return Home
    </Link>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer />
        <Routes>
          {/* Public Pages (1–13) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<ExploreCarsPage />} />
            <Route path="/groups" element={<BrowseGroupsPage />} />
            <Route path="/groups/:groupId" element={<PublicGroupDetailsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* User Pages (14–24) */}
          <Route
            path="/dashboard"
            element={
              <RoleGuard allowedRole="user">
                <WorkspaceLayout mode="user" />
              </RoleGuard>
            }
          >
            <Route index element={<UserDashboardPage />} />
            <Route path="profile" element={<MyProfilePage />} />
            <Route path="requests" element={<MyRequestsPage />} />
            <Route path="requests/new" element={<CreateRequestPage />} />
            <Route path="requests/:requestId/edit" element={<CreateRequestPage />} />
            <Route path="groups" element={<MyGroupsPage />} />
            <Route path="groups/:groupId" element={<UserGroupDetailsPage />} />
            <Route path="offers" element={<DealerOffersPage />} />
            <Route path="compare" element={<OfferComparisonPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="purchases" element={<PurchaseTrackingPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
          </Route>

          {/* Admin Pages (25–35) */}
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRole="admin">
                <WorkspaceLayout mode="admin" />
              </RoleGuard>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="brands" element={<AdminBrandsPage />} />
            <Route path="models" element={<AdminModelsPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="groups" element={<AdminGroupsPage />} />
            <Route path="dealers" element={<AdminDealersPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="purchases" element={<AdminPurchasesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
