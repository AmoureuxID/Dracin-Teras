import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { DramaPage } from "./pages/DramaPage";
import { MoviePage } from "./pages/MoviePage";
import { AnimePage } from "./pages/AnimePage";
import { KomikPage } from "./pages/KomikPage";
import { DetailPage } from "./pages/DetailPage";
import { WatchPage } from "./pages/WatchPage";
import { SearchPage } from "./pages/SearchPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TestAPIPage } from "./pages/TestAPIPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "drama", Component: DramaPage },
      { path: "movie", Component: MoviePage },
      { path: "anime", Component: AnimePage },
      { path: "anime/:slug", Component: DetailPage },
      { path: "komik", Component: KomikPage },
      { path: "komik/:slug", Component: DetailPage },
      { path: "detail/:id", Component: DetailPage },
      { path: "watch/:id/:episode", Component: WatchPage },
      { path: "search", Component: SearchPage },
      { path: "test-api", Component: TestAPIPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);