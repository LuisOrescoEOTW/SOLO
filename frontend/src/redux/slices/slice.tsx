import { createSlice } from "@reduxjs/toolkit";
import type { Iperfil } from "../../app/models/Iperfil";
import type { Iitem } from "../../app/models/Iitem";
import type { Iusuario } from "../../app/models/auth/Iusuario";
import type { Ihabilbloq } from "../../app/models/Ihabil";
import type { Iitem_perfil } from "../../app/models/Iitem_perfil";
import type {
  Ibias,
  Icanal,
  Iconfiguracion,
  Ifrecuencia,
  Ifuncion,
  Imedicion,
  Imetodo,
  Ipin_gpio,
  Iselector,
  Iselector_configuracion,
} from "../../app/models/Itablas";

export const perfilSlice = createSlice({
  name: "perfil",
  initialState: {
    perfil: [] as Iperfil[],
  },
  reducers: {
    perfil: (state, action) => {
      state.perfil = action.payload.perfil;
    },
  },
});
export const itemSlice = createSlice({
  name: "item",
  initialState: {
    item: [] as Iitem[],
  },
  reducers: {
    item: (state, action) => {
      state.item = action.payload.item;
    },
  },
});
export const item_perfilSlice = createSlice({
  name: "item_perfil",
  initialState: {
    item_perfil: [] as Iitem_perfil[],
  },
  reducers: {
    item_perfil: (state, action) => {
      state.item_perfil = action.payload.item_perfil;
    },
  },
});
export const usuarioSlice = createSlice({
  name: "usuario",
  initialState: {
    usuario: [] as Iusuario[],
  },
  reducers: {
    usuario: (state, action) => {
      state.usuario = action.payload.usuario;
    },
  },
});
export const habilSlice = createSlice({
  name: "habil",
  initialState: {
    habil: [] as Ihabilbloq[],
  },
  reducers: {
    habil: (state, action) => {
      state.habil = action.payload.habil;
    },
  },
});

export const metodoSlice = createSlice({
  name: "metodo",
  initialState: {
    metodo: [] as Imetodo[],
  },
  reducers: {
    metodo: (state, action) => {
      state.metodo = action.payload.metodo;
    },
  },
});
export const frecuenciaSlice = createSlice({
  name: "frecuencia",
  initialState: {
    frecuencia: [] as Ifrecuencia[],
  },
  reducers: {
    frecuencia: (state, action) => {
      state.frecuencia = action.payload.frecuencia;
    },
  },
});
export const biasSlice = createSlice({
  name: "bias",
  initialState: {
    bias: [] as Ibias[],
  },
  reducers: {
    bias: (state, action) => {
      state.bias = action.payload.bias;
    },
  },
});
export const funcionSlice = createSlice({
  name: "funcion",
  initialState: {
    funcion: [] as Ifuncion[],
  },
  reducers: {
    funcion: (state, action) => {
      state.funcion = action.payload.funcion;
    },
  },
});
export const selectorSlice = createSlice({
  name: "selector",
  initialState: {
    selector: [] as Iselector[],
  },
  reducers: {
    selector: (state, action) => {
      state.selector = action.payload.selector;
    },
  },
});
export const canalSlice = createSlice({
  name: "canal",
  initialState: {
    canal: [] as Icanal[],
  },
  reducers: {
    canal: (state, action) => {
      state.canal = action.payload.canal;
    },
  },
});
export const configuracionSlice = createSlice({
  name: "configuracion",
  initialState: {
    configuracion: [] as Iconfiguracion[],
  },
  reducers: {
    configuracion: (state, action) => {
      state.configuracion = action.payload.configuracion;
    },
  },
});
export const pin_gpioSlice = createSlice({
  name: "pin_gpio",
  initialState: {
    pin_gpio: [] as Ipin_gpio[],
  },
  reducers: {
    pin_gpio: (state, action) => {
      state.pin_gpio = action.payload.pin_gpio;
    },
  },
});
export const medicionSlice = createSlice({
  name: "medicion",
  initialState: {
    medicion: [] as Imedicion[],
  },
  reducers: {
    medicion: (state, action) => {
      state.medicion = action.payload.medicion;
    },
  },
});
export const selector_configuracionSlice = createSlice({
  name: "selector_configuracion",
  initialState: {
    selector_configuracion: [] as Iselector_configuracion[],
  },
  reducers: {
    selector_configuracion: (state, action) => {
      state.selector_configuracion = action.payload.selector_configuracion;
    },
  },
});

export const { perfil } = perfilSlice.actions;
export const { item } = itemSlice.actions;
export const { item_perfil } = item_perfilSlice.actions;
export const { usuario } = usuarioSlice.actions;
export const { habil } = habilSlice.actions;
export const { metodo } = metodoSlice.actions;
export const { frecuencia } = frecuenciaSlice.actions;
export const { bias } = biasSlice.actions;
export const { funcion } = funcionSlice.actions;
export const { selector } = selectorSlice.actions;
export const { canal } = canalSlice.actions;
export const { configuracion } = configuracionSlice.actions;
export const { pin_gpio } = pin_gpioSlice.actions;
export const { medicion } = medicionSlice.actions;
export const { selector_configuracion } = selector_configuracionSlice.actions;
