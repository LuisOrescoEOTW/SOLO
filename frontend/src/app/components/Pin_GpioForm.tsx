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
import type { Ipin_gpio, Iselector } from "../models/Itablas";
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
  editState: Ipin_gpio | null;
}

export const Pin_GpioForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const selectores = useSelector(
    (state: RootState) => state.selector?.selector || [],
  );

  // Hook useForm
  const inicialState = {
    selector_id: selectores[0]?.id ?? 1,
    pin_ms: 1,
    pin_rb: 1,
    gpio_rb: 1,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Ipin_gpio>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Ipin_gpio) => {
    delete data.selector;
    if (editState) {
      dispatch(
        put("pin_gpio", actionCreatorMap, data.id ?? 0, data, true, true),
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
      dispatch(post("pin_gpio", actionCreatorMap, data, true, true))
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
        {editState ? "Editar Pin Gpio" : "Nuevo Pin Gpio"}
      </DialogTitle>

      <DialogContent>
        {/* Selector */}
        <Controller
          name="selector_id"
          control={control}
          rules={{ required: "El selector es obligatorio" }}
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
                <em>Seleccione un selector</em>
              </MenuItem>
              {selectores.map((selector: Iselector) => (
                <MenuItem key={selector.id} value={selector.id}>
                  {selector.nombre}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {/* Pin MS */}
        <Controller
          name="pin_ms"
          control={control}
          rules={{ required: "El pin MS es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Pin MS"
              fullWidth
              error={!!errors.pin_ms}
              helperText={errors.pin_ms?.message}
            />
          )}
        />
        {/* Pin RB */}
        <Controller
          name="pin_rb"
          control={control}
          rules={{ required: "El pin RB es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Pin RB"
              fullWidth
              error={!!errors.pin_rb}
              helperText={errors.pin_rb?.message}
            />
          )}
        />
        {/* Gpio RB */}
        <Controller
          name="gpio_rb"
          control={control}
          rules={{ required: "El gpio RB es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Gpio RB"
              fullWidth
              error={!!errors.gpio_rb}
              helperText={errors.gpio_rb?.message}
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
