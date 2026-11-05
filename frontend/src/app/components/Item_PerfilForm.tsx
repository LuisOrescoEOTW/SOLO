import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { post, putCompuesto } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import type { Iitem_perfil } from "../models/Iitem_perfil";
import type { Iperfil } from "../models/Iperfil";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Iitem_perfil | null;
}

export const Item_PerfilForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const perfiles = useSelector((state: RootState) => state.perfil.perfil);
  const items = useSelector((state: RootState) => state.item.item);

  // Hook useForm
  const inicialState = {
    perfilid: perfiles[0]?.id ?? 1,
    itemid: items[0]?.id ?? 1,
    nivel: 1,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Iitem_perfil>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Iitem_perfil) => {
    if (editState) {
      dispatch(
        putCompuesto(
          "item_perfil",
          actionCreatorMap,
          data.item_id,
          data.perfil_id,
          data,
          true,
          true,
        ),
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
      dispatch(post("item_perfil", actionCreatorMap, data, true, true))
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
    <>
      {perfiles && items && (
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
            {editState ? "Editar Item x Perfil" : "Nuevo Item x Perfil"}
          </DialogTitle>

          <DialogContent>
            {/* Perfil */}
            <Controller
              name="perfil_id"
              control={control}
              rules={{ required: "El perfil es obligatorio" }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  margin="dense"
                  error={!!errors.perfil_id}
                  sx={{ mt: 2 }}
                >
                  <InputLabel id="label-perfil">Perfil</InputLabel>
                  <Select
                    {...field}
                    labelId="label-perfil"
                    label="Perfil"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    {perfiles.map((perfil: Iperfil) => (
                      <MenuItem key={perfil.id} value={perfil.id}>
                        {perfil.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.perfil_id && (
                    <FormHelperText>{errors.perfil_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Item */}
            <Controller
              name="item_id"
              control={control}
              rules={{ required: "El item es obligatorio" }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  margin="dense"
                  error={!!errors.item_id}
                  sx={{ mt: 2 }}
                >
                  <InputLabel id="label-item">Item</InputLabel>
                  <Select
                    {...field}
                    labelId="label-item"
                    label="Item"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    {items.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.item_id && (
                    <FormHelperText>{errors.item_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Nivel */}
            <Controller
              name="nivel"
              control={control}
              rules={{ required: "El nivel es obligatorio" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Nivel"
                  fullWidth
                  error={!!errors.nivel}
                  helperText={errors.nivel?.message}
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
      )}
    </>
  );
};
