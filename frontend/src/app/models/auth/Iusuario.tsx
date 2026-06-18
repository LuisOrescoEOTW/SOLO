import type { Iperfil } from "../Iperfil";

export interface Iusuario {
  id?: number | 0; 
  perfilid?: number | 0;
  perfil?: Iperfil | null;
  nombre?: string | "";
  email?: string | "";
  telefono?: string | "";
  foto?: string | "";
  bloqueado?: Date | null;
  fechacreacion?: Date | null;
  fechamodificacion?: Date | null;
  borrado?: boolean | false;
}

// theme.palette.primary.main
// theme.palette.secondary.main
// theme.palette.success.main
// theme.palette.error.main
// theme.palette.background.paper
// theme.palette.text.primary
// theme.palette.text.secondary