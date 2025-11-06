import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeLayout from "./pages/HomeLayout";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import AdminPortal from "./pages/admin/AdminPortal";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TechnicianPortal from "./pages/technician/TechnicianPortal";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import CustomerPortal from "./pages/customer/CustomerPortal";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/reset-password/ResetPassword";
import { loader as AdminLoader } from "./pages/admin/AdminPortal";
import { loader as CustomerLoader } from "./pages/customer/CustomerPortal";
import { loader as ServiceLoader } from "./pages/admin/services/Service";
import { loader as AdminBookingLoader } from "./pages/admin/bookings/Booking";
import { loader as PartLoader } from "./pages/admin/parts/Part";
import { loader as LogsLoader } from "./pages/admin/inventory/Logs";
import { loader as TechnicianLoader } from "./pages/technician/TechnicianPortal";
import User, { loader as UserListLoader } from "./pages/admin/users/User";
import Customer, {
  loader as CustomerListLoader,
} from "./pages/admin/customers/Customer";
import Technicians, {
  loader as TechnicianListLoader,
} from "./pages/admin/technicians/Technician";
import Car, { loader as CarLoader } from "./pages/customer/cars/Car";
import { loader as CustomerBookingLoader } from "./pages/customer/CustomerDashboard";
import { loader as JobLoader } from "./pages/admin/jobs/Job";
import { loader as TokenLoader } from "./pages/HomeLayout";
import Service from "./pages/admin/services/Service";
import LandingPage from "./pages/landing/LandingPage";
import Booking from "./pages/admin/bookings/Booking";
import Part from "./pages/admin/parts/Part";
import Logs from "./pages/admin/inventory/Logs";
import Job from "./pages/admin/jobs/Job";
import Settings from "./components/Settings";
import TechSettings from "./pages/technician/components/Settings";
import AdminSettings from "./pages/admin/components/Settings";
import ErrorBoundary from "./components/ErrorBoundary";
import Pack, { loader as PackLoader } from "./pages/admin/packs/Pack";
import Consultations from "./pages/admin/consultations/Consultations";
import ChangeRequestLog from "./pages/admin/change-requests/ChangeRequestLog";
import BookAService, {
  loader as BookServiceLoader,
} from "./pages/customer/book/BookAService";
import BookAPackage, {
  loader as BookPackageLoader,
} from "./pages/customer/book/BookAPackage";
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomeLayout />,
      loader: TokenLoader,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <LandingPage />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "/reset-password",
          element: <ResetPassword />,
        },
      ],
    },
    {
      path: "/admin",
      element: <AdminPortal />,
      loader: AdminLoader,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <AdminDashboard />,
        },
        {
          path: "services",
          element: <Service />,
          loader: ServiceLoader,
        },
        {
          path: "packs", // Pack route added here
          element: <Pack />, // Pack page component
          loader: PackLoader, // Optional loader for pack data
        },
        {
          path: "bookings",
          element: <Booking />,
          loader: AdminBookingLoader,
        },
        {
          path: "consultations",
          element: <Consultations />,
        },
        {
          path: "change-requests",
          element: <ChangeRequestLog />,
        },
        {
          path: "parts",
          element: <Part />,
          loader: PartLoader,
        },
        {
          path: "logs",
          element: <Logs />,
          loader: LogsLoader,
        },
        {
          path: "users",
          element: <User />,
          loader: UserListLoader,
        },
        {
          path: "customers",
          element: <Customer />,
          loader: CustomerListLoader,
        },
        {
          path: "technicians",
          element: <Technicians />,
          loader: TechnicianListLoader,
        },
        {
          path: "jobs",
          element: <Job />,
          loader: JobLoader,
        },
        {
          path: "settings",
          element: <AdminSettings />,
        },
      ],
    },
    {
      path: "/tech",
      element: <TechnicianPortal />,
      loader: TechnicianLoader,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <TechnicianDashboard />,
        },
        {
          path: "settings",
          element: <TechSettings />,
        },
      ],
    },
    {
      path: "/customer",
      element: <CustomerPortal />,
      loader: CustomerLoader,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <CustomerDashboard />,
          loader: CustomerBookingLoader,
        },
        {
          path: "cars",
          element: <Car />,
          loader: CarLoader,
        },
        {
          path: "book-a-service",
          element: <BookAService />,
          loader: BookServiceLoader,
        },
        {
          path: "book-a-package",
          element: <BookAPackage />,
          loader: BookPackageLoader,
        },
        {
          path: "settings",
          element: <Settings />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
