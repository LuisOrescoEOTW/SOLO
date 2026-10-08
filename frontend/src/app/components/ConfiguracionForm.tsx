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
import type {
  Ibias,
  Iconfiguracion,
  Ifrecuencia,
  Ifuncion,
} from "../models/Itablas";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { post, put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Iconfiguracion | null;
}

export const ConfiguracionForm = ({ open, onClose, editState }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputStr, setInputStr] = useState("1.0000");
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const frecuencias = useSelector(
    (state: RootState) => state.frecuencia?.frecuencia || [],
  );
  const biases = useSelector((state: RootState) => state.bias?.bias || []);
  const funciones = useSelector(
    (state: RootState) => state.funcion?.funcion || [],
  );
  const user = useSelector((state: RootState) => state.auth.user);

  // Hook useForm
  const inicialState = {
    frecuencia_id: frecuencias[0]?.id ?? 1,
    bias_id: biases[0]?.id ?? 1,
    funcion_id: funciones[0]?.id ?? 1,
    usuario_id: user?.id ?? 1,
    frecuencia_inicial: 1,
    frecuencia_cantidad: 1,
    frecuencia_final: 1,
    voltaje: 1,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Iconfiguracion>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Iconfiguracion) => {
    delete data.frecuencia;
    delete data.bias;
    delete data.funcion;
    delete data.usuario;
    if (editState) {
      dispatch(
        put("configuracion", actionCreatorMap, data.id ?? 0, data, true, true),
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
      dispatch(post("configuracion", actionCreatorMap, data, true, true))
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
        {editState ? "Editar Configuración" : "Nueva Configuración"}
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
        {/* Frecuencia */}
        <Controller
          name="frecuencia_id"
          control={control}
          rules={{ required: "La frecuencia es obligatoria" }}
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
                <em>Seleccione una frecuencia</em>
              </MenuItem>
              {frecuencias.map((frecuencia: Ifrecuencia) => (
                <MenuItem key={frecuencia.id} value={frecuencia.id}>
                  {frecuencia.nombre}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {/* Bias */}
        <Controller
          name="bias_id"
          control={control}
          rules={{ required: "El bias es obligatorio" }}
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
                <em>Seleccione un bias</em>
              </MenuItem>
              {biases.map((bias: Ibias) => (
                <MenuItem key={bias.id} value={bias.id}>
                  {bias.valor}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {/* Funcion */}
        <Controller
          name="funcion_id"
          control={control}
          rules={{ required: "La función es obligatoria" }}
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
                <em>Seleccione una función</em>
              </MenuItem>
              {funciones.map((funcion: Ifuncion) => (
                <MenuItem key={funcion.id} value={funcion.id}>
                  {funcion.nombre}
                </MenuItem>
              ))}
            </Select>
          )}
        />

        {/* Frecuencia inicial */}
        <Controller
          name="frecuencia_inicial"
          control={control}
          rules={{ required: "La frecuencia inicial es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Frecuencia inicial"
              fullWidth
              error={!!errors.frecuencia_inicial}
              helperText={errors.frecuencia_inicial?.message}
              sx={{ mt: 2 }}
            />
          )}
        />
        {/* Frecuencia cantidad */}
        <Controller
          name="frecuencia_cantidad"
          control={control}
          rules={{ required: "La frecuencia cantidad es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Frecuencia cantidad"
              fullWidth
              error={!!errors.frecuencia_cantidad}
              helperText={errors.frecuencia_cantidad?.message}
              sx={{ mt: 2 }}
            />
          )}
        />
        {/* Frecuencia final */}
        <Controller
          name="frecuencia_final"
          control={control}
          rules={{ required: "La frecuencia final es obligatoria" }}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              type="number"
              margin="dense"
              label="Frecuencia final"
              fullWidth
              error={!!errors.frecuencia_final}
              helperText={errors.frecuencia_final?.message}
              sx={{ mt: 2 }}
            />
          )}
        />
        {/* Voltaje */}
        <Controller
          name="voltaje"
          control={control}
          rules={{
            required: "El voltaje es obligatorio",
            min: { value: 0, message: "No se permiten negativos" },
            max: {
              value: 999999.9999,
              message: "Máximo 999999.9999 para numeric(10,4)",
            },
          }}
          render={({ field }) => (
            <TextField
              // ...
              label="Valor"
              placeholder="3.5000" // antes 3.50
              value={isFocused ? inputStr : Number(field.value ?? 0).toFixed(4)}
              onFocus={() => {
                setIsFocused(true);
                setInputStr(String(field.value ?? ""));
              }}
              onBlur={() => {
                setIsFocused(false);
                const num = parseFloat(inputStr.replace(",", "."));
                if (!isNaN(num)) {
                  const fixed = Number(num.toFixed(4));
                  field.onChange(fixed);
                  setInputStr(fixed.toFixed(4));
                }
                field.onBlur();
              }}
              onChange={(e) => {
                let raw = e.target.value.replace(",", ".");

                // permite hasta 4 decimales
                if (raw === "" || raw === "." || /^\d*\.?\d{0,4}$/.test(raw)) {
                  setInputStr(e.target.value);

                  if (raw !== "" && raw !== ".") {
                    const num = parseFloat(raw);
                    if (!isNaN(num) && num >= 0 && num <= 999999.9999) {
                      field.onChange(num);
                    }
                  }
                }
              }}
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
