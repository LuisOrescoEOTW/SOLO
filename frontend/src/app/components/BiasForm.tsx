import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
} from "@mui/material";
import type { Ibias } from "../models/Itablas";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { post, put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Ibias | null;
}

export const BiasForm = ({ open, onClose, editState }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputStr, setInputStr] = useState("1.00"); // <-- texto visual

  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();

  // Hook useForm
  const inicialState = {
    valor: 1,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Ibias>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState);
      setInputStr(Number(editState.valor).toFixed(2));
    } else {
      reset(inicialState);
      setInputStr(Number(inicialState.valor).toFixed(2));
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Ibias) => {
    if (editState) {
      dispatch(put("bias", actionCreatorMap, data.id ?? 0, data, true, true))
        .then(() => {
          toast.info("Elemento modificado");
          reset(inicialState);
          onClose();
        })
        .catch(() =>
          toast.error("Error al modificar el elemento. Posible duplicado"),
        );
    } else {
      dispatch(post("bias", actionCreatorMap, data, true, true))
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
        {editState ? "Editar Bias" : "Nuevo Bias"}
      </DialogTitle>

      <DialogContent>
        {/* Valor */}
        <Controller
          name="valor"
          control={control}
          rules={{
            required: "El valor es obligatorio",
            min: { value: 0, message: "No se permiten negativos" },
            max: { value: 9.99, message: "Máximo 9.99 para numeric(3,2)" },
          }}
          render={({ field }) => (
            <TextField
              inputRef={field.ref}
              autoFocus
              margin="dense"
              label="Valor"
              fullWidth
              placeholder="3.50"
              error={!!errors.valor}
              helperText={errors.valor?.message}
              value={isFocused ? inputStr : Number(field.value ?? 0).toFixed(2)}
              slotProps={{
                htmlInput: { inputMode: "decimal" },
              }}
              onFocus={() => {
                setIsFocused(true);
                // al enfocar mostramos el número sin formatear para editar
                setInputStr(String(field.value ?? ""));
              }}
              onBlur={() => {
                setIsFocused(false);
                const num = parseFloat(inputStr.replace(",", "."));
                if (!isNaN(num)) {
                  const fixed = Number(num.toFixed(2));
                  field.onChange(fixed); // sigue siendo number
                  setInputStr(fixed.toFixed(2));
                }
                field.onBlur();
              }}
              onChange={(e) => {
                let raw = e.target.value.replace(",", ".");

                // permite borrar todo, escribir solo "." , "3.", "3.2"
                if (raw === "" || raw === "." || /^\d*\.?\d{0,2}$/.test(raw)) {
                  setInputStr(e.target.value); // guardamos lo que escribe tal cual

                  // solo si es un número válido lo pasamos al form
                  if (raw !== "" && raw !== "." && raw !== ".") {
                    const num = parseFloat(raw);
                    if (!isNaN(num) && num >= 0 && num <= 9.99) {
                      field.onChange(num);
                    }
                  }
                }
              }}
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
