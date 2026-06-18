import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { cambiarPassword } from "../../redux/slices/authThunks";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export const CambiarPassword = () => {
  // Leer
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  // Mostrar/Ocultar password
  const [showPassword, setShowPassword] = useState(false);

  // Hook useForm
  const inicialState = {
    passwordNueva: "",
    passwordNueva2: "",
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
    if (data.passwordNueva !== data.passwordNueva2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    try {
      const result = await dispatch(cambiarPassword(email, data.passwordNueva));
      if (result.success) {
        toast.success("Contraseña actualizada");
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
        <Typography variant="h5">Cambiar Contraseña</Typography>

        <Controller
          name="passwordNueva"
          control={control}
          rules={{
            required: "La contraseña es obligatoria",
            minLength: {
              value: 6,
              message: "Debe tener al menos 6 caracteres",
            },
            pattern: {
              value: /^[A-Z].*\d/,
              message:
                "Debe comenzar con mayúscula y contener al menos un número",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              label="Nueva Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              error={!!errors.passwordNueva}
              helperText={errors.passwordNueva?.message}
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

        <Controller
          name="passwordNueva2"
          control={control}
          rules={{
            required: "La contraseña es obligatoria",
            minLength: {
              value: 6,
              message: "Debe tener al menos 6 caracteres",
            },
            pattern: {
              value: /^[A-Z].*\d/,
              message:
                "Debe comenzar con mayúscula y contener al menos un número",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              label="Confirmar Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              error={!!errors.passwordNueva2}
              helperText={errors.passwordNueva2?.message}
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
        
        <Typography variant="caption" color="text.secondary">
          Mínimo 6 caracteres, comenzar con mayúscula y contener al menos un
          número.
        </Typography>

        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="success"
        >
          Guardar
        </Button>
      </Paper>
    </Box>
  );
};
