import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { loginUser } from "../../redux/slices/authThunks";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";

export const LoginPage = () => {
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
          navigate("/cambiar-password", {
            state: {
              email: result.email,
              passwordTemporal: result.passwordTemporal,
            },
          });

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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 4,
          width: 350,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h5">Iniciar Sesión</Typography>

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
              margin="dense"
              label="Correo"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
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
              margin="dense"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
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
        >
          Ingresar
        </Button>
      </Paper>
    </Box>
  );
};
