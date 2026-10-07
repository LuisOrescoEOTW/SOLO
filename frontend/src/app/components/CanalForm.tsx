import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  useTheme,
} from "@mui/material";
import type { Icanal, Imetodo } from "../models/Itablas";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { post, put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Icanal | null;
}

export const CanalForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const metodos = useSelector((state: RootState) => state.metodo?.metodo || []);

  // Hook useForm
  const inicialState = {
    metodo_id: 1,
    nombre: "",
    inyeccion1: 1,
    inyeccion2: 1,
    medicion1: 1,
    medicion2: 1,
    habilitado: true,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Icanal>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Icanal) => {
    delete data.metodo;
    if (editState) {
      dispatch(put("canal", actionCreatorMap, data.id ?? 0, data, true, true))
        .then(() => {
          toast.info("Elemento modificado");
          reset(inicialState);
          onClose();
        })
        .catch(() =>
          toast.error("Error al modificar el elemento. Posible duplicado"),
        );
    } else {
      dispatch(post("canal", actionCreatorMap, data, true, true))
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
        {editState ? "Editar Canal" : "Nuevo Canal"}
      </DialogTitle>

      <DialogContent>
        {/* Metodo */}
        <Controller
          name="metodo_id"
          control={control}
          rules={{ required: "El método es obligatorio" }}
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
                <em>Seleccione un método</em>
              </MenuItem>
              {metodos.map((metodo: Imetodo) => (
                <MenuItem key={metodo.id} value={metodo.id}>
                  {metodo.nombre}
                </MenuItem>
              ))}
            </Select>
          )}
        />
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
        {/* Inyeccion1 */}
        <Controller
          name="inyeccion1"
          control={control}
          rules={{ required: "La inyección 1 es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Inyección 1"
              fullWidth
              error={!!errors.inyeccion1}
              helperText={errors.inyeccion1?.message}
            />
          )}
        />
        {/* Inyeccion2 */}
        <Controller
          name="inyeccion2"
          control={control}
          rules={{ required: "La inyección 2 es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Inyección 2"
              fullWidth
              error={!!errors.inyeccion2}
              helperText={errors.inyeccion2?.message}
            />
          )}
        />
        {/* Medicion1 */}
        <Controller
          name="medicion1"
          control={control}
          rules={{ required: "La medición 1 es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Medición 1"
              fullWidth
              error={!!errors.medicion1}
              helperText={errors.medicion1?.message}
            />
          )}
        />
        {/* Medicion2 */}
        <Controller
          name="medicion2"
          control={control}
          rules={{ required: "La medición 2 es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Medición 2"
              fullWidth
              error={!!errors.medicion2}
              helperText={errors.medicion2?.message}
            />
          )}
        />
        {/* Habilitado */}
        <Controller
          name="habilitado"
          control={control}
          // rules={{ required: "Habilitado es obligatorio" }}
          render={({ field }) => (
            <FormControlLabel
              label="Habilitado"
              control={
                <Switch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
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
