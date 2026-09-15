import { Api } from "../../api/api";
import type { AppDispatch } from "../store";

//Get All
export const get = (tabla, actionCreatorMap) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.get(`/${tabla}/`);
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: data }));
      } else {
        console.error(`No actionCreator encontrado en tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en getAll:", error);
    }
  };
};

//Get All con relaciones
export const getRelaciones = (tabla, actionCreatorMap) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.get(`/${tabla}/relaciones/`);
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: data }));
      } else {
        console.error(`No actionCreator encontrado en tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en getAll:", error);
    }
  };
};

//Get Tabla - Campo - Id
export const getSiExiste = (tabla, actionCreatorMap, campo, id) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.get(`/${tabla}/${campo}/${id}/campo/`);
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: data }));
      } else {
        console.error(`No actionCreator encontrado en tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en getAll:", error);
    }
  };
};

//Insertar Nuevo
// nombre de la tabla, actionCreatorMap, dato a enviar, hacer get,get con relaciones o no
export const post = (tabla, actionCreatorMap, data, hacerget, relaciones) => {
  return async (dispatch: AppDispatch) => {
    const response = await Api.post(`/${tabla}/`, data);
    if (hacerget) {
      if (relaciones) {
        await dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(get(tabla, actionCreatorMap));
      }
    }
    return response.data;
  };
};

//Modificar
export const put = (tabla, actionCreatorMap, data, hacerget, relaciones) => {
  return async (dispatch: AppDispatch) => {
    const response = await Api.put(`/${tabla}/${data.id}`, data);
    if (hacerget) {
      if (relaciones) {
        await dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(get(tabla, actionCreatorMap));
      }
    }
    return response.data;
  };
};

//Eliminar Lógico
export const deleted = (
  tabla,
  actionCreatorMap,
  data: number,
  hacerget,
  relaciones
) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.delete(`/${tabla}/${data}`);
      if (hacerget) {
        if (relaciones) {
          dispatch(getRelaciones(tabla, actionCreatorMap));
        } else {
          dispatch(get(tabla, actionCreatorMap));
        }
      }
    } catch (error) {
      console.error("Error en delete:", error);
    }
  };
};

//Eliminar Fisico
export const deletedFisico = (
  tabla,
  actionCreatorMap,
  data: number,
  hacerget,
  relaciones
) => {
  return async (dispatch: AppDispatch) => {
    await Api.delete(`/${tabla}/fisico/${data}`);
    if (hacerget) {
      if (relaciones) {
        dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(get(tabla, actionCreatorMap));
      }
    }
  };
};

//Vaciar
export const vaciar = (tabla, actionCreatorMap) => {
  return async (dispatch: AppDispatch) => {
    try {
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: [] }));
      } else {
        console.error(`No action creator found for tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en vaciar:", error);
    }
  };
};

//********************************************************************* */
//Get Fecha de tabla Habil
export const getHabilFecha = (tabla, actionCreatorMap) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.get(`/${tabla}/fecha/`);
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: data }));
      } else {
        console.error(`No actionCreator encontrado en tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en getAll:", error);
    }
  };
};

// Actualizar Fecha
export const putHabilFecha = (
  email: string,
  password: string,
  vencimiento: string
) => {
  return async () => {
    try {
      await Api.put("/habil/validar/", {
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
