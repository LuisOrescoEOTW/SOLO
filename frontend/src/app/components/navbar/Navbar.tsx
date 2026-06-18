import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext } from "../../theme/ColorModeContext";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@mui/icons-material";
import AlertDialog from "../../hooks/AlertDialog";

interface Props {
  onToggleSidebar: () => void;
  onMobileOpen: () => void;
}
export const Navbar = ({ onToggleSidebar, onMobileOpen }: Props) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // User
  const user = useSelector((state: RootState) => state.auth.user);

  // Logout
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = async (confirmDelete: boolean) => {
    if (confirmDelete && user) {
      dispatch({ type: "auth/logout" });
      navigate("/login");
    }
    setOpenDialog(false);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/* DESKTOP */}

        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* MOBILE */}

        <IconButton
          color="inherit"
          edge="start"
          // onClick={onMobileOpen}
          onClick={(e) => {
            e.currentTarget.blur();
            onMobileOpen();
          }}
          sx={{
            mr: 2,
            display: { xs: "flex", md: "none" },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          sx={{
            flexGrow: 1,
          }}
        >
          Sistema Gestión
        </Typography>

        <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
        <Typography>{user?.nombre}</Typography>
        <Button color="inherit" onClick={handleLogout}>
          <LogoutOutlined />
        </Button>
      </Toolbar>

      {/* Modal Confirma Cerrar Sesión */}
      <AlertDialog
        open={openDialog}
        onClose={handleDialogClose}
        mensaje="Cerrar Sesión"
      />
    </AppBar>
  );
};
