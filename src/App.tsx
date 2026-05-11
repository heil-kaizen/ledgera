/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Apply from "./pages/Apply";
import Transparency from "./pages/Transparency";
import CharityDetail from "./pages/CharityDetail";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="apply" element={<Apply />} />
          <Route path="transparency" element={<Transparency />} />
          <Route path="transparency/:id" element={<CharityDetail />} />
          <Route path="resources" element={<div className="p-20 text-center">Resources Page Coming Soon</div>} />
          <Route path="contact" element={<div className="p-20 text-center">Contact Page Coming Soon</div>} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
