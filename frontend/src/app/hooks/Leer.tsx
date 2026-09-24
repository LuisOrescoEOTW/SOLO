import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { useEffect } from "react";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { getAll, getAllRelaciones } from "../../redux/slices/thunks";

interface Props {
  tabla?: string;
  conRelaciones?: boolean;
  otrasTablas?: string[];
}

export const Leer = ({ tabla, conRelaciones, otrasTablas }: Props) => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (isAuthenticated) {
      otrasTablas?.forEach((tablaAux) => {
        dispatch(getAll(tablaAux, actionCreatorMap));
      });
    }
  }, [dispatch, isAuthenticated, otrasTablas]);

  useEffect(() => {
    if (isAuthenticated) {
      if (conRelaciones) {
        dispatch(getAllRelaciones(tabla, actionCreatorMap));
      } else {
        dispatch(getAll(tabla, actionCreatorMap));
      }
    }
  }, [dispatch, isAuthenticated, tabla]);

  return null;
};
