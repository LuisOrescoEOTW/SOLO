import type { Iusuario } from "./auth/Iusuario";

export interface Imetodo {
  id?: number | 0;
  nombre: string;
  borrado?: boolean | false;
}
export interface Ifrecuencia {
  id?: number | 0;
  nombre: string;
  tipo: number;
  borrado?: boolean | false;
}
export interface Ibias {
  id?: number | 0;
  valor: number;
  borrado?: boolean | false;
}
export interface Ifuncion {
  id?: number | 0;
  nombre: string;
  descripcion: string;
  borrado?: boolean | false;
}
export interface Iselector {
  id?: number | 0;
  nombre: string;
  borrado?: boolean | false;
}
export interface Icanal {
  id?: number | 0;
  metodo_id: number;
  metodo?: Imetodo | null;
  nombre: string;
  inyeccion1: number;
  inyeccion2: number;
  medicion1: number;
  medicion2: number;
  habilitado?: boolean | false;
  borrado?: boolean | false;
}
export interface Iconfiguracion {
  id?: number | 0;
  frecuencia_id: number;
  frecuencia?: Ifrecuencia | null;
  bias_id: number;
  bias?: Ibias | null;
  funcion_id: number;
  funcion?: Ifuncion | null;
  usuario_id: number;
  usuario?: Iusuario | null;
  nombre: string;
  frecuencia_inicial: number;
  frecuencia_cantidad: number;
  frecuencia_final: number;
  voltaje: number;
  borrado?: boolean | false;
}
export interface Ipin_gpio {
  id?: number | 0;
  selector_id: number;
  selector?: Iselector | null;
  pin_ms: number;
  pin_rb: number;
  gpio_rb: number;
  borrado?: boolean | false;
}
export interface Imedicion {
  id?: number | 0;
  canal_id: number;
  canal?: Icanal | null;
  configuracion_id: number;
  configuracion?: Iconfiguracion | null;
  valor: number;
  complemento: number;
  estado: number;
  rango: number;
  frecuencia: number;
  fecha_creacion?: Date | null;
  fecha_modificacion?: Date | null;
  borrado?: boolean | false;
}
export interface Iselector_configuracion {
  selector_id: number;
  selector?: Iselector | null;
  configuracion_id: number;
  configuracion?: Iconfiguracion | null;
  borrado?: boolean | false;
}
