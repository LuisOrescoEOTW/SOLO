import { Accessibility, Key, Person, Sync } from "@mui/icons-material";

// divider en true coloca una linea debajo
export const MenuItems = [
  {
    text: "usuario",
    name: "Usuario",
    icon: <Person />,
    path: "/usuario",
    divider: true,
  },
  {
    text: "perfil",
    name: "Perfil",
    icon: <Accessibility />,
    path: "/perfil",
  },
  {
    text: "item",
    name: "Item",
    icon: <Key />,
    path: "/item",
  },
  {
    text: "item_perfil",
    name: "Item - Perfil",
    icon: <Sync />,
    path: "/item_perfil",
  },
  // Aquí agregar nueva tabla
];
