import {
  Accessibility,
  ElectricalServices,
  ElectricBolt,
  ForkRight,
  Functions,
  GraphicEq,
  Insights,
  Key,
  Person,
  PushPin,
  Settings,
  Sync,
  WaterfallChart,
} from "@mui/icons-material";

// divider en true coloca una linea debajo
export const MenuItems = [
  {
    text: "medicion",
    name: "Medición",
    icon: <WaterfallChart />,
    path: "/medicion",
  },
  {
    text: "configuracion",
    name: "Configuración",
    icon: <Settings />,
    path: "/configuracion",
  },
  {
    text: "pin_gpio",
    name: "Pin Gpio",
    icon: <PushPin />,
    path: "/pin_gpio",
  },
  {
    text: "canal",
    name: "Canal",
    icon: <ElectricalServices />,
    path: "/canal",
    divider: true,
  },

  {
    text: "metodo",
    name: "Metodo",
    icon: <Insights />,
    path: "/metodo",
  },
  {
    text: "frecuencia",
    name: "Frecuencia",
    icon: <GraphicEq />,
    path: "/frecuencia",
  },
  {
    text: "bias",
    name: "Bias",
    icon: <ElectricBolt />,
    path: "/bias",
  },
  {
    text: "funcion",
    name: "Función",
    icon: <Functions />,
    path: "/funcion",
  },
  {
    text: "selector",
    name: "Selector",
    icon: <ForkRight />,
    path: "/selector",
    divider: true,
  },

  {
    text: "usuario",
    name: "Usuario",
    icon: <Person />,
    path: "/usuario",
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
    name: "Asociar",
    icon: <Sync />,
    path: "/item_perfil",
  },
  // Aquí agregar nueva tabla
];
