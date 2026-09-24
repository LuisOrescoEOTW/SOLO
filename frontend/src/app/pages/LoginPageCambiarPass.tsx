import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authCambiarPassword } from "../../redux/slices/authThunks";

interface Props {
  email: string;
  passwordTemporal: string;
}

export const LoginPageIniciarCambiarPass = ({
  email,
  passwordTemporal,
}: Props) => {
  // Leer
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Mostrar/Ocultar password
  const [showPassword, setShowPassword] = useState(false);

  // Hook useForm
  const inicialState = {
    passwordNueva: passwordTemporal,
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
      const result = await dispatch(
        authCambiarPassword(email, data.passwordNueva),
      );
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
    <>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", m: 2, textAlign: "center" }}
      >
        CAMBIAR CONTRASEÑA
      </Typography>

      {/* Pass Nueva */}
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

      {/* Pass Nueva 2 */}
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
        sx={{ fontWeight: "bold", mt: 2, p: 1 }}
      >
        Guardar
      </Button>
    </>
  );
};
