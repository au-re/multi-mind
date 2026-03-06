import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider, redirect } from "@tanstack/react-router";
import { Layout } from "@/components/layout";
import { HomePage } from "@/features/home/pages/home-page";

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: Outlet,
});

const routeTree = rootRoute.addChildren([indexRoute, notFoundRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

export const Router = () => {
  return <RouterProvider router={router} />;
};
