import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DashboardLayout } from "../app/layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../app/pages/LoginPage";
import { Inicio } from "../app/pages/Inicio";
import { Usuario } from "../app/pages/Usuario";
import { Perfil } from "../app/pages/Perfil";
import { Item } from "../app/pages/Item";
import { Item_Perfil } from "../app/pages/Item_Perfil";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Inicio />} />
          <Route path="usuario" element={<Usuario />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="item" element={<Item />} />
          <Route path="item_perfil" element={<Item_Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
