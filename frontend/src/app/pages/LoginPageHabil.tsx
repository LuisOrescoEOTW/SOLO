import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Button,
  DialogActions,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LeerHabil } from "../hooks/LeerHabil";
import dayjs, { Dayjs } from "dayjs";
import { authHabilitar } from "../../redux/slices/authThunks";

interface Props {
  onCambiarPassword: () => void;
}

export const LoginPageHabil = ({ onCambiarPassword }: Props) => {
  // Leer
  const dispatch = useDispatch<AppDispatch>();
  const habiles = useSelector((state: RootState) => state.habil);

  // Mostrar/Ocultar password
  const [showPassword, setShowPassword] = useState(false);

  // Hook useForm
  const inicialState = {
    email: "",
    password: "",
    vencimiento: null,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<{
    email: string;
    password: string;
    vencimiento: Dayjs | null;
  }>({
    defaultValues: inicialState,
  });

  // Set de Fecha
  useEffect(() => {
    if (habiles.habil[0]?.vencimiento) {
      setValue("vencimiento", dayjs(habiles.habil[0].vencimiento));
    }
  }, [habiles, setValue]);

  // Submit
  const onSubmit = async (datos: any) => {
    try {
      const data = {
        ...datos,
        vencimiento: datos.vencimiento
          ? datos.vencimiento.format("YYYY-MM-DD")
          : null,
      };
      const result = await dispatch(
        authHabilitar(data.email, data.password, data.vencimiento),
      );
      if (result.success) {
        toast.success("Nuevo Vencimiento Actualizado");
        reset(inicialState);
        onCambiarPassword();
      } else {
        toast.error(result.message || "Credenciales incorrectas");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error al iniciar sesión");
    }
  };

  //Cancelar
  const cancelar = () => {
    onCambiarPassword();
  };

  return (
    <>
      <LeerHabil tabla="habil" />
      {habiles && (
        <>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", m: 2, textAlign: "center" }}
          >
            HABILITACIÓN
          </Typography>

          {/* EMAIL */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: "El correo es obligatorio",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Ingrese un correo válido",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                placeholder="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />

          {/* PASSWORD */}
          <Controller
            name="password"
            control={control}
            rules={{
              required: "La contraseña es obligatoria",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type={showPassword ? "text" : "password"}
                fullWidth
                placeholder="Contraseña"
                margin="dense"
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />

          {/* FECHA */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="vencimiento"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Habilitado hasta"
                  value={field.value}
                  onChange={field.onChange}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "dense",
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>

          {/* Botón Finalizar */}
          <DialogActions>
            <Button
              onClick={cancelar}
              variant="contained"
              color="error"
              sx={{ fontWeight: "bold", mt: 2, p: 1 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="success"
              sx={{ fontWeight: "bold", mt: 2, p: 1 }}
            >
              Aplicar
            </Button>
          </DialogActions>
        </>
      )}
    </>
  );
};
