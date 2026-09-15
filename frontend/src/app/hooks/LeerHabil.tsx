import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { useEffect } from "react";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { getHabilFecha } from "../../redux/slices/thunks";

interface Props {
  tabla?: string;
}

export const LeerHabil = ({ tabla }: Props) => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getHabilFecha(tabla, actionCreatorMap));
  }, [dispatch, tabla]);

  return null;
};
