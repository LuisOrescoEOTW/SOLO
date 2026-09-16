import type { Iusuario } from "./Iusuario";

export interface IauthResponse {
  cambiar_password?: boolean | null;
  vencimiento_actualizado?: boolean | null;
  access_token: string;
  token_type: string;
  usuario?: Iusuario | null;
}
