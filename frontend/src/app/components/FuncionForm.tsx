import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
} from "@mui/material";
import type { Ifuncion } from "../models/Itablas";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { post, put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Ifuncion | null;
}

export const FuncionForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();

  // Hook useForm
  const inicialState = {
    nombre: "",
    descripcion: "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Ifuncion>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Ifuncion) => {
    if (editState) {
      dispatch(put("funcion", actionCreatorMap, data.id ?? 0, data, true, true))
        .then(() => {
          toast.info("Elemento modificado");
          reset(inicialState);
          onClose();
        })
        .catch(() =>
          toast.error("Error al modificar el elemento. Posible duplicado"),
        );
    } else {
      dispatch(post("funcion", actionCreatorMap, data, true, true))
        .then(() => {
          toast.success("Elemento agregado");
          reset(inicialState);
          onClose();
        })
        .catch(() =>
          toast.error("Error al agregar el elemento. Posible duplicado"),
        );
    }
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
        {editState ? "Editar Función" : "Nueva Función"}
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
              autoFocus
              margin="dense"
              label="Nombre"
              fullWidth
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
          )}
        />
        {/* Descripción */}
        <Controller
          name="descripcion"
          control={control}
          rules={{ required: "La descripción es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              margin="dense"
              label="Descripción"
              fullWidth
              error={!!errors.descripcion}
              helperText={errors.descripcion?.message}
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
