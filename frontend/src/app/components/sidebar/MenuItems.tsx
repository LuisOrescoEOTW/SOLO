import { Accessibility, Key, Person, Sync } from "@mui/icons-material";

// divider en true coloca una linea debajo
export const MenuItems = [
  {
    text: "Usuario",
    icon: <Person />,
    path: "/usuario",
  },
  {
    text: "Perfil",
    icon: <Accessibility />,
    path: "/perfil",
    divider: true,
  },
  {
    text: "Item",
    icon: <Key />,
    path: "/item",
  },
  {
    text: "Perfil -> Item",
    icon: <Sync />,
    path: "/perfil-item",
  },
  // Aquí agregar nueva tabla

];
