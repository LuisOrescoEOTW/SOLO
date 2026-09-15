import { Box, Paper, Typography } from "@mui/material";
import { useState } from "react";
import logo from "../images/user.png";
import { LoginPageIniciar } from "./LoginPageIniciar";
import { LoginPageIniciarCambiarPass } from "./LoginPageCambiarPass";
import { LoginPageHabil } from "./LoginPageHabil";
// import imagenLogin from "../images/Presentar.jpeg";

export const LoginPage = () => {
  const [cambiarPass, setCambiarPass] = useState(0);
  const [email, setEmail] = useState("");
  const [passwordTemporal, setPasswordTemporal] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Cuadro Izquierdo */}
      {/* <Box
        sx={{
          width: {
            xs: "100%",
            md: "45%",
            lg: "40%",
          },
          height: {
            xs: 250,
            md: "100vh",
          },
          bgcolor: "#18067C",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: 10,
        }}
      > */}
      {/* Contenedor de la imagen */}
      {/* <Box
          sx={{
            width: "90%",
            height: "90%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        > */}
      {/* Reemplazar por la imagen cuando esté disponible */}
      {/* <Box
            component="img"
            src={imagenLogin}
            alt="Imagen Login"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // o "cover"
            }}
          /> */}

      {/* <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "bold",
              opacity: 0.5,
            }}
          >
            Imagen
          </Typography> */}
      {/* </Box>
      </Box> */}

      {/* Cuadro Derecho */}
      <Box
        sx={{
          width: {
            xs: "100%",
            md: "45%",
            lg: "40%",
          },
          height: {
            xs: "auto",
            md: "100vh",
          },
          bgcolor: "#18067C",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: 10,
          py: 4,
        }}
      >
        <Paper
          elevation={5}
          sx={{
            position: "relative",
            width: {
              xs: "80%",
              sm: 380,
            },
            maxWidth: 380,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            opacity: 0.9,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              width: 100,
              height: 100,
              objectFit: "cover",
              position: "absolute",
              top: -50, // la mitad del alto del logo
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onClick={() => setCambiarPass(2)}
          />

          {cambiarPass == 0 ? (
            <LoginPageIniciar
              onCambiarPassword={() => setCambiarPass(1)}
              setEmail={setEmail}
              setPasswordTemporal={setPasswordTemporal}
            />
          ) : cambiarPass == 1 ? (
            <LoginPageIniciarCambiarPass
              email={email}
              passwordTemporal={passwordTemporal}
            />
          ) : (
            <LoginPageHabil onCambiarPassword={() => setCambiarPass(0)} />
          )}

          {/* Pie */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Typography sx={{ fontSize: "0.8rem", fontWeight: "bold" }}>
              Inconvenientes?
            </Typography>
            <Typography
              sx={{ fontSize: "0.8rem", fontWeight: "bold", color: "red" }}
            >
              Comuníquese con el administrador
            </Typography>
          </Box>
        </Paper>

        <Typography
          sx={{
            mt: 5,
            color: "white",
            fontSize: "0.8rem",
            fontWeight: "bold",
          }}
        >
          @ by Luis Orescovich
        </Typography>
      </Box>
    </Box>
  );
};
