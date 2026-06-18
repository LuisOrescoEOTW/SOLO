import { createTheme } from "@mui/material/styles";

export const appTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,

      primary: {
        main: "#1976d2",
      },

      background: {
        default: mode === "light" ? "#f4f6f8" : "#121212",
      },
    },

    shape: {
      borderRadius: 10,
    },

  });
