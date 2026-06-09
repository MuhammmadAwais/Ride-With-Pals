import { createBrowserRouter, Navigate } from "react-router-dom";


export const router = createBrowserRouter([
  {
    path: "/",
    // element: (
    //     // <AppLayout />

    // ),
    children: [
      { index: true, element: <Navigate to="/" replace /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
