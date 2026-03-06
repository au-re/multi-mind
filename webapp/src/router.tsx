import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  redirect,
} from "@tanstack/react-router";
import { Layout } from "@/components/layout";
import { CharacterEditPage } from "@/features/characters/pages/character-edit-page";
import { CharacterPage } from "@/features/characters/pages/character-page";
import { CharactersPage } from "@/features/characters/pages/characters-page";

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CharactersPage,
});

const charactersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "characters",
  component: Outlet,
});

const characterRoute = createRoute({
  getParentRoute: () => charactersRoute,
  path: "$characterId",
  component: CharacterPage,
});

const characterEditRoute = createRoute({
  getParentRoute: () => charactersRoute,
  path: "$characterId/edit",
  component: CharacterEditPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: Outlet,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  charactersRoute.addChildren([characterRoute, characterEditRoute]),
  notFoundRoute,
]);

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: "intent",
});

export const Router = () => {
  return <RouterProvider router={router} />;
};
