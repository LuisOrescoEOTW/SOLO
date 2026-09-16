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
import { post, put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import type { Iperfil } from "../models/Iperfil";
import type { Iperfilxsector } from "../models/Iitem_perfil";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Iperfil | null;
}

export const PerfilXSectorForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const perfiles = useSelector((state: RootState) => state.perfil.perfil);
  const sectores = useSelector((state: RootState) => state.sector.sector);

  // Hook useForm
  const inicialState = {
    perfilid: perfiles && perfiles.length > 0 ? perfiles[0].id : 1,
    sectorid: sectores && sectores.length > 0 ? sectores[0].id : 1,
    nivel: 1,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Iperfilxsector>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Iperfilxsector) => {
    if (editState) {
      dispatch(put("perfilxsector", actionCreatorMap, data, true, true))
        .then(() => {
          toast.info("Elemento modificado");
          reset(inicialState);
          onClose();
        })
        .catch(() =>
          toast.error("Error al modificar el elemento. Posible duplicado")
        );
    } else {
      dispatch(post("perfilxsector", actionCreatorMap, data, true, true))
        .then(() => {
          toast.success("Elemento agregado");
          reset(inicialState);
          onClose();
        })
        .catch(() =>
          toast.error("Error al agregar el elemento. Posible duplicado")
        );
    }
  };

  return (
    <>
      {perfiles && sectores && (
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
            {editState ? "Editar Perfil x Sector" : "Nuevo Perfil x Sector"}
          </DialogTitle>

          <DialogContent>
            {/* Perfil */}
            <Controller
              name="perfilid"
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
            {errors.perfilid && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.perfilid.message}
              </p>
            )}

            {/* Sector */}
            <Controller
              name="sectorid"
              control={control}
              rules={{ required: "El sector es obligatorio" }}
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
                    <em>Seleccione un sector</em>
                  </MenuItem>
                  {sectores.map((sector) => (
                    <MenuItem key={sector.id} value={sector.id}>
                      {sector.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.sectorid && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.sectorid.message}
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
