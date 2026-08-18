// import {
//   Navigate,
//   Route,
//   Routes,
// } from "react-router-dom";

// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Users from "./pages/Users";
// import Roles from "./pages/Roles";
// import Permissions from "./pages/Permissions";
// import Analytics from "./pages/Analytics";
// import Profile from "./pages/Profile";
// import Settings from "./pages/Settings";

// import { useAuth } from "./context/AuthContext";

// function ProtectedRoute({
//   children,
// }) {
//   const {
//     loading,
//     isAuthenticated,
//   } = useAuth();

//   if (loading) {
//     return (
//       <div
//         style={{
//           padding: 40,
//           textAlign: "center",
//         }}
//       >
//         Loading...
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//       />
//     );
//   }

//   return children;
// }

// // export default function App() {
// //   return (
// //     <Routes>

// //       <Route
// //         path="/login"
// //         element={<Login />}
// //       />

// //       <Route
// //         path="/dashboard"
// //         element={
// //           <ProtectedRoute>
// //             <Dashboard />
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/users"
// //         element={
// //           <ProtectedRoute>
// //             <Users />
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/roles"
// //         element={
// //           <ProtectedRoute>
// //             <Roles />
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/permissions"
// //         element={
// //           <ProtectedRoute>
// //             <Permissions />
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/analytics"
// //         element={
// //           <ProtectedRoute>
// //             <Analytics />
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/profile"
// //         element={
// //           <ProtectedRoute>
// //             <Profile />
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/settings"
// //         element={
// //           <ProtectedRoute>
// //             <Settings />
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/"
// //         element={
// //           <Navigate
// //             to="/dashboard"
// //             replace
// //           />
// //         }
// //       />

// //       <Route
// //         path="*"
// //         element={
// //           <Navigate
// //             to="/dashboard"
// //             replace
// //           />
// //         }
// //       />

// //     </Routes>
// //   );
// // }

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  useAuth,
} from "./context/AuthContext";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";


import Layout from "./components/Layout";
import Loading from "./components/Loading";

function ProtectedRoute({
  children,
}) {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return (
      <Loading text="Checking session..." />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function ProtectedLayout({
  children,
}) {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedLayout>
            <Users />
          </ProtectedLayout>
        }
      />

      <Route
        path="/roles"
        element={
          <ProtectedLayout>
            <Roles />
          </ProtectedLayout>
        }
      />

      <Route
        path="/permissions"
        element={
          <ProtectedLayout>
            <Permissions />
          </ProtectedLayout>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedLayout>
            <Analytics />
          </ProtectedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <Profile />
          </ProtectedLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        }
      />

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}