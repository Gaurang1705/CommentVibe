import "./App.css";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { AppLayout } from "./Components/Layouts/AppLayout";
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import { Error } from "./pages/Error";
import Analyze from "./pages/Analyze";
const router=createBrowserRouter([
  {
    path:"/",
    element:<AppLayout />,
    errorElement:<Error />,
    children:[
    {
      path: "/",
      element: <Home/>,
    },
    {
      path:"/about",
      element:<About />,
    },
    {
      path:"/analyze",
      element:<Analyze />,
    },
    {
      path:"/contact",
      element:<Contact />,
    },
    ]
  },
])
const App=()=>{
  return <RouterProvider router={router}></RouterProvider>;
};
export default App;