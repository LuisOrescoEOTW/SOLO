import { Api } from "../../api/api";
import type { AppDispatch } from "../store";

//Get All
// export const get = (tabla: any, actionCreatorMap: any) => {
export const getAll = (tabla: any, actionCreatorMap: any) => {
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
// export const getRelaciones = (tabla: any, actionCreatorMap: any) => {
export const getAllRelaciones = (tabla: any, actionCreatorMap: any) => {
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
      console.error("Error en getAllRelaciones:", error);
    }
  };
};

//Get Tabla - Campo - Valor
// export const getSiExiste = (
export const getByCampoValor = (
  tabla: any,
  actionCreatorMap: any,
  campo: any,
  valor: any,
) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.get(`/${tabla}/${campo}/${valor}/campo/`);
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: data }));
      } else {
        console.error(`No actionCreator encontrado en tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en getByCampoValor:", error);
    }
  };
};

//Get Tabla - Campo - Valor con relaciones
export const getByCampoValorRelaciones = (
  tabla: any,
  actionCreatorMap: any,
  campo: any,
  valor: any,
) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await Api.get(
        `/${tabla}/${campo}/${valor}/campo/relaciones/`,
      );
      const actionCreator = actionCreatorMap[tabla];
      if (actionCreator) {
        dispatch(actionCreator({ [tabla]: data }));
      } else {
        console.error(`No actionCreator encontrado en tabla: ${tabla}`);
      }
    } catch (error) {
      console.error("Error en getByCampoValorRelaciones:", error);
    }
  };
};

//Insertar Nuevo
// nombre de la tabla, actionCreatorMap, dato a enviar, hacer get, get con relaciones o no
export const post = (
  tabla: any,
  actionCreatorMap: any,
  data: any,
  hacerget: boolean,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    const response = await Api.post(`/${tabla}/`, data);
    if (hacerget) {
      if (relaciones) {
        await dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(getAll(tabla, actionCreatorMap));
      }
    }
    return response.data;
  };
};

//Modificar
export const put = (
  tabla: any,
  actionCreatorMap: any,
  id: number,
  data: any,
  hacerget: boolean,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    const response = await Api.put(`/${tabla}/${id}/`, data);
    if (hacerget) {
      if (relaciones) {
        await dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(getAll(tabla, actionCreatorMap));
      }
    }
    return response.data;
  };
};

//Modificar con PK Compuesto
export const putCompuesto = (
  tabla: any,
  actionCreatorMap: any,
  pk1: number,
  pk2: number,
  data: any,
  hacerget: boolean,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    const response = await Api.put(`/${tabla}/${pk1}/${pk2}/`, data);
    if (hacerget) {
      if (relaciones) {
        await dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(getAll(tabla, actionCreatorMap));
      }
    }
    return response.data;
  };
};

//Eliminar Lógico
export const deleted = (
  tabla: any,
  actionCreatorMap: any,
  id: number,
  hacerget: boolean,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.delete(`/${tabla}/${id}/`);
      if (hacerget) {
        if (relaciones) {
          await dispatch(getAllRelaciones(tabla, actionCreatorMap));
        } else {
          await dispatch(getAll(tabla, actionCreatorMap));
        }
      }
    } catch (error) {
      console.error("Error en delete:", error);
    }
  };
};

//Eliminar Lógico Compuesto
export const deletedCompuesto = (
  tabla: any,
  actionCreatorMap: any,
  pk1: number,
  pk2: number,
  hacerget: boolean,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.delete(`/${tabla}/${pk1}/${pk2}/`);
      if (hacerget) {
        if (relaciones) {
          await dispatch(getAllRelaciones(tabla, actionCreatorMap));
        } else {
          await dispatch(getAll(tabla, actionCreatorMap));
        }
      }
    } catch (error) {
      console.error("Error en delete:", error);
    }
  };
};

//Eliminar Fisico
export const deletedFisico = (
  tabla: any,
  actionCreatorMap: any,
  id: number,
  hacerget: boolean,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    await Api.delete(`/${tabla}/${id}/fisico/`);
    if (hacerget) {
      if (relaciones) {
        await dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(getAll(tabla, actionCreatorMap));
      }
    }
  };
};

//Eliminar Fisico Compuesto
export const deletedFisicoCompuesto = (
  tabla: any,
  actionCreatorMap: any,
  pk1: number,
  pk2: number,
  hacerget: boolean,
  relaciones: boolean,
) => {
  return async (dispatch: AppDispatch) => {
    await Api.delete(`/${tabla}/${pk1}/${pk2}/fisico/`);
    if (hacerget) {
      if (relaciones) {
        await dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        await dispatch(getAll(tabla, actionCreatorMap));
      }
    }
  };
};

//Vaciar
export const vaciar = (tabla: any, actionCreatorMap: any) => {
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
