import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../components/layout/root-layout";
import HomePage from "../pages/home/home";
import EditorPage from "../pages/editor/editor";
import CustomContentPage from "../pages/custom-content/custom-content";
import MyResourcesPage from "../pages/my-resources/my-resources";
import NotFoundPage from "../pages/not-found/not-found";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/editor",
        element: <EditorPage />,
      },
      {
        path: "/my-resources",
        element: <MyResourcesPage />,
      },
      {
        path: "/custom-content",
        element: <Navigate to="/my-resources" replace />,
      },
      {
        path: "/common-resources",
        element: <Navigate to="/my-resources" replace />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
