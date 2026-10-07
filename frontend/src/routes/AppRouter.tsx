import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DashboardLayout } from "../app/layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../app/pages/LoginPage";
import { Inicio } from "../app/pages/Inicio";
import { Usuario } from "../app/pages/Usuario";
import { Perfil } from "../app/pages/Perfil";
import { Item } from "../app/pages/Item";
import { Item_Perfil } from "../app/pages/Item_Perfil";
import { Metodo } from "../app/pages/Metodo";
import { Frecuencia } from "../app/pages/Frecuencia";
import { Bias } from "../app/pages/Bias";
import { Funcion } from "../app/pages/Funcion";
import { Selector } from "../app/pages/Selector";
import { Canal } from "../app/pages/Canal";

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
          <Route path="metodo" element={<Metodo />} />
          <Route path="frecuencia" element={<Frecuencia />} />
          <Route path="bias" element={<Bias />} />
          <Route path="funcion" element={<Funcion />} />
          <Route path="selector" element={<Selector />} />
          <Route path="canal" element={<Canal />} />

          <Route path="usuario" element={<Usuario />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="item" element={<Item />} />
          <Route path="item_perfil" element={<Item_Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
