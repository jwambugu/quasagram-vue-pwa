const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "page.home",
        component: () => import("pages/PageHome.vue"),
      },
      {
        path: "/camera",
        name: "page.camera",
        component: () => import("pages/PageCamera.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
