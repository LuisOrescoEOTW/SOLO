import type { Iperfil } from "./Iperfil";
import type { Isector } from "./Isector";

export interface Iperfilxsector {
  id?: number | 0; 
  perfilid?: number | 0;
  perfil?: Iperfil | null;
  sectorid?: number | 0;
  sector?: Isector | null;
  nivel?: number | 0;
  fechacreacion?: Date | null;
  fechamodificacion?: Date | null;
  borrado?: boolean | false;
}