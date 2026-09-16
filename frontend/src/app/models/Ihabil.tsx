
export interface Ihabil {
  id?: number | 0; 
  email?: string | "";
  bloqueado?: Date | null;
  intentos?: number | 0; 
  vencimiento?: Date | null;
  borrado?: boolean | false;
}

export interface Ihabilbloq {
  vencimiento?: Date | null;
}

// theme.palette.primary.main
// theme.palette.secondary.main
// theme.palette.success.main
// theme.palette.error.main
// theme.palette.background.paper
// theme.palette.text.primary
// theme.palette.text.secondary