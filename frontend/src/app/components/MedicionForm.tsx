import { useEffect, useState } from "react";
import type { Icanal, Iconfiguracion, Imedicion } from "../models/Itablas";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { post, put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Imedicion | null;
}

export const MedicionForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const configuraciones = useSelector(
    (state: RootState) => state.configuracion?.configuracion || [],
  );
  const canales = useSelector((state: RootState) => state.canal?.canal || []);

  // Hook useForm
  const inicialState = {
    configuracion_id: configuraciones[0]?.id ?? 1,
    canal_id: canales[0]?.id ?? 1,
    valor: 1,
    complemento: 1,
    estado: 1,
    rango: 1,
    frecuencia: 1,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Imedicion>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Imedicion) => {
    delete data.configuracion;
    delete data.canal;
    if (editState) {
      dispatch(
        put("medicion", actionCreatorMap, data.id ?? 0, data, true, true),
      )
        .then(() => {
          toast.info("Elemento modificado");
          reset(inicialState);
          onClose();
        })
        .catch(() =>
          toast.error("Error al modificar el elemento. Posible duplicado"),
        );
    } else {
      dispatch(post("medicion", actionCreatorMap, data, true, true))
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
        {editState ? "Editar Medición" : "Nueva Medición"}
      </DialogTitle>

      <DialogContent>
        {/* Configuración */}
        <Controller
          name="configuracion_id"
          control={control}
          rules={{ required: "La configuración es obligatoria" }}
          render={({ field }) => (
            <Select
              {...field}
              fullWidth
              margin="dense"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value="">
                <em>Seleccione una configuración</em>
              </MenuItem>
              {configuraciones.map((configuracion: Iconfiguracion) => (
                <MenuItem key={configuracion.id} value={configuracion.id}>
                  {configuracion.nombre}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {/* Canal */}
        <Controller
          name="canal_id"
          control={control}
          rules={{ required: "El canal es obligatorio" }}
          render={({ field }) => (
            <Select
              {...field}
              fullWidth
              margin="dense"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value="">
                <em>Seleccione un canal</em>
              </MenuItem>
              {canales.map((canal: Icanal) => (
                <MenuItem key={canal.id} value={canal.id}>
                  {canal.nombre}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {/* Valor */}
        <Controller
          name="valor"
          control={control}
          rules={{ required: "El valor es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Valor"
              fullWidth
              error={!!errors.valor}
              helperText={errors.valor?.message}
              sx={{ mt: 2 }}
            />
          )}
        />
        {/* Complemento */}
        <Controller
          name="complemento"
          control={control}
          rules={{ required: "El complemento es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Complemento"
              fullWidth
              error={!!errors.complemento}
              helperText={errors.complemento?.message}
              sx={{ mt: 2 }}
            />
          )}
        />
        {/* Estado */}
        <Controller
          name="estado"
          control={control}
          rules={{ required: "El estado es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              margin="dense"
              label="Estado"
              fullWidth
              error={!!errors.estado}
              helperText={errors.estado?.message}
              sx={{ mt: 2 }}
            />
          )}
        />
        {/* Rango */}
        <Controller
          name="rango"
          control={control}
          rules={{ required: "El rango es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              margin="dense"
              label="Rango"
              fullWidth
              error={!!errors.rango}
              helperText={errors.rango?.message}
              sx={{ mt: 2 }}
            />
          )}
        />
        {/* Frecuencia */}
        <Controller
          name="frecuencia"
          control={control}
          rules={{ required: "La frecuencia es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              margin="dense"
              label="Frecuencia"
              fullWidth
              error={!!errors.frecuencia}
              helperText={errors.frecuencia?.message}
              sx={{ mt: 2 }}
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
