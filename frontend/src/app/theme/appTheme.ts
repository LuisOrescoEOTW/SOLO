import { createTheme } from "@mui/material/styles";

export const appTheme = (mode: "light" | "dark") =>
  createTheme({
    // palette: {
    //   mode,

    //   primary: {
    //     main: "#18067C",
    //   },

    //   background: {
    //     default: mode === "light" ? "#f4f6f8" : "#121212",
    //   },
    // },
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#18067C" : "#1e1e1e",
        contrastText: "#fff",
      },
      background: {
        default: mode === "light" ? "#f4f6f8" : "#121212",
      },
    },

    shape: {
      borderRadius: 10,
    },

    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "light" ? "#150A52" : "#1e1e1e",
            color: "#fff",
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: "#fff",
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            color: "#fff",

            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.12)",
            },
          },
        },
      },
    },
  });
