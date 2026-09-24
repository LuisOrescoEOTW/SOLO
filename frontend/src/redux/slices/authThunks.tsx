import { Api } from "../../api/api";
import type { AppDispatch } from "../store";
import { login } from "../slices/authSlice";
import type { Iregister } from "../../app/models/auth/Iregister";
import { getAll, getAllRelaciones } from "./thunks";

//Insertar Nuevo Usuario
export const authRegister = (
  tabla: any,
  actionCreatorMap: any,
  data: Iregister,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.post(`/auth/register/`, data);
      if (relaciones) {
        await dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(getAll(tabla, actionCreatorMap));
      }
    } catch (error) {
      console.error("Error en post:", error);
    }
  };
};

//Cambiar Contraseña
export const authCambiarPassword = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.post("/auth/cambiar-password/", {
        email,
        password,
      });
      dispatch(login(data));
      return {
        success: true,
      };
    } catch (error: any) {
      let message = "Error al cambiar contraseña";

      if (typeof error.response?.data?.detail === "string") {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response?.data?.detail)) {
        message = error.response.data.detail.map((e: any) => e.msg).join(", ");
      }

      return {
        success: false,
        message,
      };
    }
  };
};

//Resetear Contraseña
export const authResetPassword = (
  tabla: any,
  actionCreatorMap: any,
  id: number,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.post(`/auth/reset-password/`, { id });
      if (relaciones) {
        await dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(getAll(tabla, actionCreatorMap));
      }
    } catch (error) {
      console.error("Error en post:", error);
    }
  };
};

//Login
export const authLogin = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.post("/auth/login/", {
        email,
        password,
      });
      if (data.cambiar_password) {
        return {
          success: true,
          cambiarPassword: true,
          email: data.email,
          passwordTemporal: password,
        };
      }
      dispatch(login(data));
      return {
        success: true,
        cambiarPassword: false,
      };
    } catch (error: any) {
      let message = "Error al iniciar sesión";

      if (typeof error.response?.data?.detail === "string") {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response?.data?.detail)) {
        message = error.response.data.detail.map((e: any) => e.msg).join(", ");
      }

      return {
        success: false,
        message,
      };
    }
  };
};

// ********************************************************************* */
// Traer Fecha
export const authFecha = (tabla: any, actionCreatorMap: any) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.get(`/auth/fecha/`);
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: data }));
      } else {
        console.error(`No actionCreator encontrado en tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en authFecha:", error);
    }
  };
};

// Actualizar Fecha
export const authHabilitar = (
  email: string,
  password: string,
  vencimiento: string,
) => {
  return async () => {
    try {
      await Api.put("/auth/habilitar/", {
        email,
        password,
        vencimiento,
      });
      return { success: true };
    } catch (error: any) {
      let message = "Error al actualizar fecha";
      if (typeof error.response?.data?.detail === "string") {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response?.data?.detail)) {
        message = error.response.data.detail.map((e: any) => e.msg).join(", ");
      }
      return {
        success: false,
        message,
      };
    }
  };
};
