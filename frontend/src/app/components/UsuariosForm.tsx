import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import type { Iusuario } from "../models/auth/Iusuario";
import { put } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { postUser } from "../../redux/slices/authThunks";

interface Props {
  open: boolean;
  onClose: () => void;
  editState: Iusuario | null;
}

export const UsuariosForm = ({ open, onClose, editState }: Props) => {
  const theme = useTheme();
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const perfiles = useSelector((state: RootState) => {
    return (state as any).perfil?.perfil || [];
  });

  // Hook useForm
  const inicialState = {
    perfilid: 1,
    nombre: "",
    email: "",
    foto: "",
    telefono: "",
  };

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Iusuario>({ defaultValues: inicialState });

  // Resetear el formulario con los valores de editState cuando cambia
  useEffect(() => {
    if (editState) {
      reset(editState); // Resetea los valores del formulario con los de editState
    } else {
      reset(inicialState);
    }
  }, [editState, reset]);

  // Guardar (Agregar/Editar)
  const onSubmit = (data: Iusuario) => {
    delete data.perfil;
    if (editState) {
      dispatch(put("usuario", actionCreatorMap, data, true))
        .then(() => toast.info("Elemento modificado"))
        .catch(() => toast.error("Error al modificar el elemento"));
    } else {
      dispatch(postUser("usuario", actionCreatorMap, data, true))
        .then(() => toast.success("Elemento agregado"))
        .catch(() => toast.error("Error al agregar el elemento"));
    }
    reset(inicialState); // Resetear el formulario después de agregar/editar
    onClose(); // Cerrar modal después de agregar/editar
  };

  // Manejo de la imagen
  const imagenValue = watch("foto");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para manejar la selección del archivo
  const manejarCambioArchivo = (e: any) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      // Cuando el archivo se termine de leer...
      reader.onloadend = () => {
        const resultado = reader.result;
        if (typeof resultado === "string") {
          setValue("foto", resultado, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      };
      // Inicia la conversión a Base64
      reader.readAsDataURL(archivo);
      // Limpiar el input para permitir seleccionar el mismo archivo después
      e.target.value = "";
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
        {editState ? "Editar Usuario" : "Nuevo Usuario"}
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

        {/* Bloqueado */}
        {/* <Controller
          name="bloqueado"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Bloqueado"
              control={
                <Switch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
            />
          )}
        /> */}

        {/* Email */}
        <Controller
          name="email"
          control={control}
          rules={{
            required: "El email es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Ingrese un correo electrónico válido",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="email"
              margin="dense"
              label="Correo Electrónico"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        {/* Teléfono */}
        <Controller
          name="telefono"
          control={control}
          rules={{
            required: "El teléfono es obligatorio",
            pattern: {
              value: /^[0-9()+\- ]+$/,
              message: "Ingrese un número de teléfono válido",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="tel"
              margin="dense"
              label="Teléfono"
              fullWidth
              error={!!errors.telefono}
              helperText={errors.telefono?.message}
            />
          )}
        />
        <Typography variant="body2" color="textSecondary">
          Ingrese teléfono en formato sin 0 y sin 15. Ejemplo: 2901 123456 Puede
          dejar espacio o guiones o nada entre los números.
        </Typography>

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

        {/* Foto */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={manejarCambioArchivo}
          style={{ display: "none" }}
        />
        <div
          style={{
            textAlign: "right",
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          {/* Botones */}
          <Tooltip title="Agregar Foto">
            <Fab
              color="success"
              size="small"
              onClick={() => fileInputRef.current?.click()}
            >
              <Add />
            </Fab>
          </Tooltip>
          <Tooltip title="Eliminar Foto">
            <Fab
              size="small"
              color="error"
              onClick={() => setValue("foto", "", { shouldDirty: true })}
            >
              <Delete fontSize="small" />
            </Fab>
          </Tooltip>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {/* Visualización previa */}
          <div
            style={{
              marginTop: "20px",
              minHeight: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f9f9f9",
            }}
          >
            {imagenValue ? (
              <>
                <img
                  src={
                    imagenValue.startsWith("data:")
                      ? imagenValue
                      : `data:image/png;base64,${imagenValue}`
                  }
                  alt="Vista previa"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "8px",
                    objectFit: "contain",
                  }}
                />
              </>
            ) : (
              <p style={{ color: "#999" }}>Sin foto</p>
            )}
          </div>
        </div>
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
