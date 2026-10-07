import { configureStore } from "@reduxjs/toolkit";
import {
  habilSlice,
  usuarioSlice,
  itemSlice,
  perfilSlice,
  item_perfilSlice,
  metodoSlice,
  frecuenciaSlice,
  biasSlice,
  funcionSlice,
  selectorSlice,
  canalSlice,
  configuracionSlice,
  pin_gpioSlice,
  medicionSlice,
  selector_configuracionSlice,
} from "./slices/slice";
import { authSlice } from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    usuario: usuarioSlice.reducer,

    perfil: perfilSlice.reducer,
    item: itemSlice.reducer,
    item_perfil: item_perfilSlice.reducer,
    habil: habilSlice.reducer,
    metodo: metodoSlice.reducer,
    frecuencia: frecuenciaSlice.reducer,
    bias: biasSlice.reducer,
    funcion: funcionSlice.reducer,
    selector: selectorSlice.reducer,
    canal: canalSlice.reducer,
    configuracion: configuracionSlice.reducer,
    pin_gpio: pin_gpioSlice.reducer,
    medicion: medicionSlice.reducer,
    selector_configuracion: selector_configuracionSlice.reducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
