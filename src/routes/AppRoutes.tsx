// frontend/src/routes/AppRoutes.tsx

import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentDetailPage from "../features/students/StudentDetailPage";
import StudentFormPage from "../features/students/StudentFormPage";
import { useSessionStore } from "../stores/sessionStore";
import SlotManagementPage from "../features/admin/slots/SlotManagementPage";
import { Loader } from "lucide-react";
import FeeManagementPage from "../features/admin/fees/FeeManagementPage";
import RoomManagementPage from "../features/admin/rooms/RoomManagementPage";


// Lazy load feature modules
const AdminDashboardPage = lazy(
  () => import("../features/dashboard/AdminDashboardPage"),
);
const StudentDashboardPage = lazy(
  () => import("../features/dashboard/StudentDashboardPage"),
);
const AdminLoginForm = lazy(
  () => import("../features/auth/components/AdminLoginForm"),
);
const StudentLoginForm = lazy(
  () => import("../features/auth/components/StudentLoginForm"),
);
const NotificationsPage = lazy(
  () => import("../features/notifications/NotificationsPage"),
);

const StudentProfilePage = lazy(
  () => import("../features/students/StudentProfilePage"),
);

const StudentFeePage = lazy(
  () => import("../features/students/StudentFeePage"),
);

const ForgotPasswordPage = lazy(
  () => import("@/features/auth/components/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("@/features/auth/components/ResetPasswordPage"),
);

const AdminStudentsListPage = lazy(
  () => import("../features/admin/students/AdminStudentsListPage"),
);
const AdminStudentDetailPage = lazy(
  () => import("../features/admin/students/AdminStudentDetailPage"),
);
const AdminStudentForm = lazy(
  () => import("../features/admin/students/AdminStudentForm"),
);

const AdminRemindersPage = lazy(
  () => import("@/features/reminders/admin-reminders/components/RemindersPage"),
);

const LibrarySettingsPage = lazy(
  () => import("../features/admin/settings/LibrarySettingsPage"),
);

const ExpensesPage = lazy(
  () => import("../features/admin/expenses/ExpensesPage"),
);

const AdminAttendancePage = lazy(
  () => import("../features/admin/attendance/AdminAttendancePage"),
);

const AdminProfilePage = lazy(
  () => import("../features/admin/profile/AdminProfilePage"),
);

import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import DueTrackingPage from "@/features/admin/fees/pages/DueTrackingPage";
import BulkReminderPage from "@/features/admin/fees/pages/BulkReminderPage";

// Role-based reactive guard component
const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: string;
}) => {
  const { token, role } = useSessionStore();

  if (!token) {
    const loginPath =
      allowedRole === "STUDENT" ? "/student/login" : "/admin/login";
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRole === "ADMIN" && !["ADMIN", "SUPER_ADMIN", "STAFF"].includes(role || "")) {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (allowedRole === "STUDENT" && role !== "STUDENT") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// Redirect authenticated users away from public pages (login/register)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, role } = useSessionStore();

  if (token) {
    return <Navigate to={role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard"} replace />;
  }

  return <>{children}</>;
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/student/dashboard" replace />,
  },
  {
    path: "/student",
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRole="STUDENT">
            <RootLayout>
              <StudentDashboardPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },

      {
        path: "students/:id",
        element: (
          <ProtectedRoute allowedRole="STUDENT">
            <RootLayout>
              <StudentDetailPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "students/new",
        element: (
          <ProtectedRoute allowedRole="STUDENT">
            <RootLayout>
              <StudentFormPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "students/edit/:id",
        element: (
          <ProtectedRoute allowedRole="STUDENT">
            <RootLayout>
              <StudentFormPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <AuthLayout>
              <StudentLoginForm />
            </AuthLayout>
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <AuthLayout>
              <React.Suspense fallback={null}>
                {React.createElement(
                  React.lazy(
                    () =>
                      import("../features/auth/components/StudentRegisterForm"),
                  ),
                )}
              </React.Suspense>
            </AuthLayout>
          </PublicRoute>
        ),
      },
      {
        path: "verify-otp",
        element: (
          <AuthLayout>
            {React.createElement(
              React.lazy(
                () => import("../features/auth/components/StudentOtpForm"),
              ),
            )}
          </AuthLayout>
        ),
      },
      {
        path: "resend-otp",
        element: (
          <AuthLayout>
            {React.createElement(
              React.lazy(
                () =>
                  import("../features/auth/components/StudentResendOtpForm"),
              ),
            )}
          </AuthLayout>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute allowedRole="STUDENT">
            <RootLayout>
              <NotificationsPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRole="STUDENT">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <StudentProfilePage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "fees",
        element: (
          <ProtectedRoute allowedRole="STUDENT">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <StudentFeePage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <AdminDashboardPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "students",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <AdminStudentsListPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "students/add",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <AdminStudentForm />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "students/edit/:id",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <AdminStudentForm />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "students/:studentId",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <AdminStudentDetailPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "rooms",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <RoomManagementPage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "slots",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <SlotManagementPage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },

      {
        path: "fees",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <FeeManagementPage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "reminders",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <SectionErrorBoundary title="Reminders Engine">
                <Suspense fallback={<Loader />}>
                  <AdminRemindersPage />
                </Suspense>
              </SectionErrorBoundary>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "due",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <DueTrackingPage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "due/reminders",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <BulkReminderPage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <LibrarySettingsPage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "expenses",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <ExpensesPage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "attendance",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <AdminAttendancePage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <Suspense fallback={<Loader />}>
                <AdminProfilePage />
              </Suspense>
            </RootLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <RootLayout>
              <NotificationsPage />
            </RootLayout>
          </ProtectedRoute>
        ),
      },

      {
        path: "login",
        element: (
          <PublicRoute>
            <AuthLayout>
              <AdminLoginForm />
            </AuthLayout>
          </PublicRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <AuthLayout>
            <ResetPasswordPage />
          </AuthLayout>
        ),
      },
    ],
  },
  // ✅ CATCH-ALL ROUTE MUST BE AT THE BOTTOM!
  {
    path: "*",
    element: <Navigate to="/student/login" replace />,
  },
];

const router = createBrowserRouter(routes);

const AppRoutes: React.FC = () => <RouterProvider router={router} />;

export default AppRoutes;
