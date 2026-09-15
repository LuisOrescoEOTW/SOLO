import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DashboardLayout } from "../app/layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../app/pages/LoginPage";
import { Inicio } from "../app/pages/Inicio";
// import { CambiarPassword } from "../app/pages/CambiarPassword";
import { Usuario } from "../app/pages/Usuario";
import { Perfil } from "../app/pages/Perfil";
import { Sector } from "../app/pages/Sector";
import { PerfilXSector } from "../app/pages/PerfilXSector";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/cambiar-password" element={<CambiarPassword />} /> */}
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
          <Route path="sector" element={<Sector />} />
          <Route path="perfil-sector" element={<PerfilXSector />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};
