import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { useEffect } from "react";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { get, getRelaciones } from "../../redux/slices/thunks";

interface Props {
  tabla?: string;
  conRelaciones?: boolean;
  otrasTablas?: string[];
}

export const Leer = ({ tabla, conRelaciones, otrasTablas }: Props) => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated) {
      otrasTablas.forEach((tablaAux) => {
        dispatch(get(tablaAux, actionCreatorMap));
      });
    }
  }, [dispatch, isAuthenticated, otrasTablas]);

  useEffect(() => {
    if (isAuthenticated) {
      if (conRelaciones) {
        dispatch(getRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(get(tabla, actionCreatorMap));
      }
    }
  }, [dispatch, isAuthenticated, tabla]);

  return null;
};
