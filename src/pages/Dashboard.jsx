// import {
//   useEffect,
//   useState,
// } from "react";

// import api from "../services/api";

// export default function Dashboard() {
//   const [dashboard, setDashboard] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   const loadDashboard =
//     async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response =
//           await api.get(
//             "/admin/dashboard"
//           );

//         const data =
//           response?.data?.data ||
//           response?.data;

//         setDashboard(data);
//       } catch (error) {
//         console.error(
//           "DASHBOARD ERROR:",
//           error
//         );

//         setError(
//           error?.response?.data
//             ?.message ||
//             "Unable to load dashboard."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   useEffect(() => {
//     loadDashboard();
//   }, []);

//   const stats =
//     dashboard?.stats ||
//     dashboard?.kpis ||
//     dashboard?.overview ||
//     {};

//   const recentOrders =
//     dashboard?.recentOrders ||
//     dashboard?.orders ||
//     [];

//   const cards = [
//     {
//       title: "Total Orders",
//       value:
//         stats?.totalOrders ??
//         stats?.orders ??
//         0,
//     },
//     {
//       title: "Revenue",
//       value:
//         stats?.revenue ??
//         stats?.totalRevenue ??
//         0,
//     },
//     {
//       title: "Products",
//       value:
//         stats?.products ??
//         stats?.totalProducts ??
//         0,
//     },
//     {
//       title: "Customers",
//       value:
//         stats?.customers ??
//         stats?.totalCustomers ??
//         0,
//     },
//   ];

//   return (
//     <div className="page">
//       <div className="page-heading">
//         <div>
//           <h1>
//             Dashboard
//           </h1>

//           <p>
//             Marketplace overview
//           </p>
//         </div>

//         <button
//           className="secondary-button"
//           onClick={
//             loadDashboard
//           }
//         >
//           Refresh
//         </button>
//       </div>

//       {error && (
//         <div className="error-box">
//           {error}
//         </div>
//       )}

//       <div className="stats-grid">
//         {cards.map((card) => (
//           <div
//             className="stat-card"
//             key={card.title}
//           >
//             <span>
//               {card.title}
//             </span>

//             <strong>
//               {loading
//                 ? "..."
//                 : card.value}
//             </strong>
//           </div>
//         ))}
//       </div>

//       <div className="panel">
//         <div className="panel-header">
//           <div>
//             <h3>
//               Recent Orders
//             </h3>

//             <p>
//               Latest marketplace orders
//             </p>
//           </div>
//         </div>

//         {loading ? (
//           <div className="empty-state">
//             Loading orders...
//           </div>
//         ) : recentOrders.length ===
//           0 ? (
//           <div className="empty-state">
//             No recent orders found.
//           </div>
//         ) : (
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>
//                     Order
//                   </th>

//                   <th>
//                     Customer
//                   </th>

//                   <th>
//                     Status
//                   </th>

//                   <th>
//                     Amount
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {recentOrders.map(
//                   (
//                     order,
//                     index
//                   ) => (
//                     <tr
//                       key={
//                         order?.uuid ||
//                         order?.id ||
//                         index
//                       }
//                     >
//                       <td>
//                         {order?.orderNumber ||
//                           order?.uuid ||
//                           `#${index + 1}`}
//                       </td>

//                       <td>
//                         {order
//                           ?.customer
//                           ?.fullName ||
//                           order
//                             ?.customer
//                             ?.email ||
//                           order?.email ||
//                           "-"}
//                       </td>

//                       <td>
//                         {order?.status ||
//                           "-"}
//                       </td>

//                       <td>
//                         {order?.amount ??
//                           order?.total ??
//                           "-"}
//                       </td>
//                     </tr>
//                   )
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [data, setData] = useState(null);


const loadDashboard = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await getDashboard();

    setData(response);
  } catch (error) {
    console.error(error);

    setError(
      error?.response?.data?.message ||
      "Failed to load dashboard"
    );
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  loadDashboard();
}, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/dashboard"
      );

      console.log(
        "DASHBOARD RESPONSE:",
        response.data
      );

      /*
        Actual backend response:

        {
          success: true,
          statusCode: 200,
          message: "Success",
          data: {
            totalUsers: 121,
            totalVendors: 51,
            pendingVendors: 21,
            approvedVendors: 25,
            totalProducts: 100,
            pendingProducts: 19,
            totalOrders: 172
          }
        }
      */

      const data = response?.data?.data;

      setDashboard(data);
    } catch (err) {
      console.error(
        "DASHBOARD API ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);
if (loading) {
  return (
    <div className="dashboard-page">
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  );
}
if (error) {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>{error}</p>

      <button onClick={loadDashboard}>
        Retry
      </button>
    </div>
  );
}
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
          </div>
        </div>

        <div className="dashboard-grid">
          {Array.from({ length: 7 }).map(
            (_, index) => (
              <div
                className="dashboard-card skeleton-card"
                key={index}
              >
                <div className="skeleton skeleton-icon" />
                <div className="skeleton skeleton-small" />
                <div className="skeleton skeleton-number" />
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Marketplace overview
            </p>
          </div>
        </div>

        <div className="dashboard-error">
          <h3>
            Unable to load dashboard
          </h3>

          <p>{error}</p>

          <button
            onClick={fetchDashboard}
            className="refresh-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          No dashboard data available.
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: dashboard.totalUsers,
      description:
        "Registered users",
      className: "blue",
    },
    {
      title: "Total Vendors",
      value: dashboard.totalVendors,
      description:
        "Marketplace vendors",
      className: "purple",
    },
    {
      title: "Pending Vendors",
      value:
        dashboard.pendingVendors,
      description:
        "Awaiting approval",
      className: "orange",
    },
    {
      title: "Approved Vendors",
      value:
        dashboard.approvedVendors,
      description:
        "Approved vendors",
      className: "green",
    },
    {
      title: "Total Products",
      value:
        dashboard.totalProducts,
      description:
        "Products in marketplace",
      className: "cyan",
    },
    {
      title: "Pending Products",
      value:
        dashboard.pendingProducts,
      description:
        "Awaiting approval",
      className: "yellow",
    },
    {
      title: "Total Orders",
      value:
        dashboard.totalOrders,
      description:
        "Marketplace orders",
      className: "pink",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Marketplace overview
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div
            className={`dashboard-card ${card.className}`}
            key={card.title}
          >
            <div className="card-top">
              <span className="card-title">
                {card.title}
              </span>

              <span className="card-dot" />
            </div>

            <div className="card-value">
              {card.value ?? 0}
            </div>

            <div className="card-description">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      {/* Orders section */}
      <div className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>
              Recent Orders
            </h2>

            <p>
              Order information will appear here
              when the dashboard/order endpoint
              provides it.
            </p>
          </div>
        </div>

        <div className="orders-empty">
          <div className="empty-icon">
            🛒
          </div>

          <h3>
            No recent order data
          </h3>

          <p>
            The current dashboard API response
            provides total orders but does not
            return a recent-orders list.
          </p>
        </div>

      </div>

    </div>
  );
}