import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layout/root-layout";
import HomePage from "../pages/home/home";
import EditorPage from "../pages/editor/editor";
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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
