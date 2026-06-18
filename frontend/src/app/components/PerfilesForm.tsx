import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
} from "@mui/material";
import { post, put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import type { Iperfil } from "../models/Iperfil";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Iperfil | null;
}

export const PerfilesForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();

  // Hook useForm
  const inicialState = {
    nombre: "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Iperfil>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Iperfil) => {
    if (editState) {
      dispatch(put("perfil", actionCreatorMap, data, true))
        .then(() => toast.info("Elemento modificado"))
        .catch(() => toast.error("Error al modificar el elemento"));
    } else {
      dispatch(post("perfil", actionCreatorMap, data, true))
        .then(() => toast.success("Elemento agregado"))
        .catch(() => toast.error("Error al agregar el elemento"));
    }
    reset(inicialState); // Resetear el formulario después de agregar/editar
    onClose(); // Cerrar modal después de agregar/editar
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderRadius: "10px",
          m: 1,
        }}
      >
        {editState ? "Editar Perfil" : "Nuevo Perfil"}
      </DialogTitle>

      <DialogContent>
        {/* Nombre */}
        <Controller
          name="nombre"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              label="Nombre"
              fullWidth
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="success"
        >
          {editState ? "Guardar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
