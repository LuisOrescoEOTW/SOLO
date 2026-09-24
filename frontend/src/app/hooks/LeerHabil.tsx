import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { useEffect } from "react";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { authFecha } from "../../redux/slices/authThunks";

interface Props {
  tabla?: string;
}

export const LeerHabil = ({ tabla }: Props) => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(authFecha(tabla, actionCreatorMap));
  }, [dispatch, tabla]);

  return null;
};
