import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Iusuario } from "../../app/models/auth/Iusuario";
import type { IauthResponse } from "../../app/models/auth/IauthResponse";

interface AuthState {
  token: string | null;
  user: Iusuario | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  isAuthenticated: !!localStorage.getItem("token"),
};

export const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    login: (
      state,
      action: PayloadAction<IauthResponse>
    ) => {
      state.token = action.payload.access_token;
      state.user = action.payload.usuario;
      state.isAuthenticated = true;
      localStorage.setItem(
        "token",
        action.payload.access_token
      );
      localStorage.setItem(
        "user",
        JSON.stringify(action.payload.usuario)
      );
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } =
  authSlice.actions;