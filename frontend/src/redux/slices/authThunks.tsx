import { Api } from "../../api/api";
import type { AppDispatch } from "../store";
import { login } from "../slices/authSlice";
import { get, getRelaciones } from "./thunks";

export const loginUser = (email: string, password: string) => {
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

export const cambiarPassword =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
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
      }
      return {
        success: false,
        message,
      };
    }
  };

export const resetearPassword = (tabla, actionCreatorMap, id: number, relaciones) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.post(`/auth/reset-password/`, {id});
      if (relaciones) {
        dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(get(tabla, actionCreatorMap));
      }
    } catch (error) {
      console.error("Error en post:", error);
    }
  };
};

//Insertar Nuevo Usuario
export const postUser = (tabla, actionCreatorMap, data, relaciones) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.post(`/auth/register/`, data);
      if (relaciones) {
        dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(get(tabla, actionCreatorMap));
      }
    } catch (error) {
      console.error("Error en post:", error);
    }
  };
};
