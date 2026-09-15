import type { Iusuario } from "./Iusuario";

export interface IauthResponse {
  access_token: string;
  token_type: string;
  usuario: Iusuario;
}