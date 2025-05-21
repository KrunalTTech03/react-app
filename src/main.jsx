import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./Components/Signup";
import { Signin } from "./Components/Signin";
import "react-toastify/dist/ReactToastify.css";
import { Listing } from "./Components/Listing";
import { Dashboard } from "./Components/Dashboard";
import Role from "./Components/Role";
import Permission from "./Components/Permission";
import Menu from "./Components/Menu";
import Unauthorized from "./Components/Unauthorized";
import NotFound from "./Components/NotFound";
import { AuthProvider } from "./Auth/AuthContext";
import PrivateRoute from "./Auth/PrivateRoute";
import UserProfile from "./Components/UserProfile";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/Login" element={<Signin />} />
          <Route path="/Unauthorized" element={<Unauthorized />} />
          <Route path="/Listing" element={<Listing />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/UserProfile" element={<UserProfile />} />

          <Route element={<PrivateRoute roles={["Admin", "Manager", "HR"]} />}>
            <Route path="/Role" element={<Role />} />
          </Route>

          <Route element={<PrivateRoute permission="ManagePermissions" />}>
            <Route path="/Permission" element={<Permission />} />
          </Route>

          <Route element={<PrivateRoute roles={["Admin"]} />}>
            <Route path="/Menu" element={<Menu />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
