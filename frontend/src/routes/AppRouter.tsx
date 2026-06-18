import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DashboardLayout } from "../app/layouts/DashboardLayout";
import { Usuarios } from "../app/pages/Usuarios";
import { PerfilXSector } from "../app/pages/PerfilXSector";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../app/pages/LoginPage";
import { Inicio } from "../app/pages/Inicio";
import { Perfil } from "../app/pages/Perfil";
import { Sector } from "../app/pages/Sector";
import { CambiarPassword } from "../app/pages/CambiarPassword";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Inicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="sector" element={<Sector />} />
          <Route path="perfilxsector" element={<PerfilXSector />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
