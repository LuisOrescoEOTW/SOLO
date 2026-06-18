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
        console.error(`No action creator found for tabla: ${tabla}`);
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
        console.error(`No action creator found for tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en getAll:", error);
    }
  };
};

//Insertar Nuevo
export const post = (tabla, actionCreatorMap, data, relaciones) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.post(`/${tabla}/`, data);
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

//Modificar
export const put = (tabla, actionCreatorMap, data, relaciones) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.put(`/${tabla}/${data.id}`, data);
      if (relaciones) {
        dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(get(tabla, actionCreatorMap));
      }
    } catch (error) {
      console.error("Error en put:", error);
    }
  };
};

//Eliminar Lógico
export const deleted = (tabla, actionCreatorMap, data: number, relaciones) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.delete(`/${tabla}/${data}`);
      if (relaciones) {
        dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(get(tabla, actionCreatorMap));
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
  relaciones
) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.delete(`/${tabla}/fisico/${data}`);
      if (relaciones) {
        dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(get(tabla, actionCreatorMap));
      }
    } catch (error) {
      console.error("Error en delete:", error);
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

