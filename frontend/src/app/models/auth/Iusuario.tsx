import type { Iperfil } from "../Iperfil";

export interface Iusuario {
  id?: number | 0;
  perfil_id: number;
  perfil?: Iperfil | null;
  nombre: string;
  email: string;
  telefono: string;
  foto?: string | null;
  intentos?: number | 0;
  bloqueado?: Date | null;
  vencimiento?: Date | null;
  borrado?: boolean | false;
  items?: string[];
}

// theme.palette.primary.main
// theme.palette.secondary.main
// theme.palette.success.main
// theme.palette.error.main
// theme.palette.background.paper
// theme.palette.text.primary
// theme.palette.text.secondary
