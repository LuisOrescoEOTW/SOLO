// src/hooks/useCargaInicial.ts
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { getAll, getAllRelaciones } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";

type TablaConfig = string | { tabla: string; conRelaciones?: boolean };

export const useCargaInicial = (tablas: TablaConfig[] = []) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const yaCargo = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      yaCargo.current = false;
      toast.error("Debes estar autenticado para acceder");
      return;
    }
    // Evita la doble carga de React StrictMode en desarrollo
    if (yaCargo.current) return;
    yaCargo.current = true;

    tablas.forEach((t) => {
      if (typeof t === "string") {
        dispatch(getAll(t, actionCreatorMap) as any);
      } else {
        if (t.conRelaciones) {
          dispatch(getAllRelaciones(t.tabla, actionCreatorMap) as any);
        } else {
          dispatch(getAll(t.tabla, actionCreatorMap) as any);
        }
      }
    });
  }, [isAuthenticated]); // solo cuando cambia auth, no por tablas
};
