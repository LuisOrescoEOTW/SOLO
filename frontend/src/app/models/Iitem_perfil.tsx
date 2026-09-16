import type { Iperfil } from "./Iperfil";
import type { Iitem } from "./Iitem";

export interface Iitem_perfil {
  perfil_id: number;
  perfil?: Iperfil | null;
  item_id: number;
  item?: Iitem | null;
  nivel?: number | 0;
  borrado?: boolean | false;
}