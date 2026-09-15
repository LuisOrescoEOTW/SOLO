import {
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { loginUser } from "../../redux/slices/authThunks";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import imagenLogin from "../images/Presentar.jpeg";

interface Props {
  onCambiarPassword: () => void;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPasswordTemporal: React.Dispatch<React.SetStateAction<string>>;
}

export const LoginPageIniciar = ({
  onCambiarPassword,
  setEmail,
  setPasswordTemporal,
}: Props) => {
  // Leer
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Mostrar/Ocultar password
  const [showPassword, setShowPassword] = useState(false);

  // Hook useForm
  const inicialState = {
    email: "",
    password: "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: inicialState,
  });

  // Submit
  const onSubmit = async (data: any) => {
    try {
      const result = await dispatch(loginUser(data.email, data.password));
      if (result.success) {
        if (result.cambiarPassword) {
          setEmail(result.email);
          setPasswordTemporal(result.passwordTemporal);
          onCambiarPassword();
          return;
        }
        toast.success("Bienvenido!");
        reset(inicialState);
        navigate("/");
      } else {
        toast.error(result.message || "Credenciales incorrectas");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error al iniciar sesión");
    }
  };

  return (
    <>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", m: 2, textAlign: "center" }}
      >
        INICIAR SESIÓN
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

      <Button
        onClick={handleSubmit(onSubmit)}
        variant="contained"
        color="success"
        sx={{ fontWeight: "bold", mt: 2, p: 1 }}
      >
        Ingresar
      </Button>
    </>
  );
};
