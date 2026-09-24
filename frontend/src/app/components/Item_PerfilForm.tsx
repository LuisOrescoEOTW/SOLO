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
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { post, putCompuesto } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import type { Iitem_perfil } from "../models/Iitem_perfil";

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
    perfilid: perfiles && perfiles.length > 0 ? perfiles[0].id : 1,
    itemid: items && items.length > 0 ? items[0].id : 1,
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
                    <em>Seleccione un perfil</em>
                  </MenuItem>
                  {perfiles.map((perfil) => (
                    <MenuItem key={perfil.id} value={perfil.id}>
                      {perfil.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.perfil_id && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.perfil_id.message}
              </p>
            )}

            {/* Item */}
            <Controller
              name="item_id"
              control={control}
              rules={{ required: "El item es obligatorio" }}
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
                    <em>Seleccione un item</em>
                  </MenuItem>
                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.item_id && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.item_id.message}
              </p>
            )}

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
