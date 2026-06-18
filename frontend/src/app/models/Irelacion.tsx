import type { Itabla1 } from "./Itabla1";
import type { Itabla2 } from "./Itabla2";

export interface Irelacion {
  id?: number | 0; 
  tabla1id?: number | 0;
  tabla1?: Itabla1 | null;
  tabla2id?: number | 0;
  tabla2?: Itabla2 | null;
  cantidad?: number | 0;
  habilitado?: boolean | false;
  fechacreacion?: Date | null;
  fechamodificacion?: Date | null;
  borrado?: boolean | false;
}