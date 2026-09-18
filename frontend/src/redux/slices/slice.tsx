import { createSlice } from '@reduxjs/toolkit'
import type { Iperfil } from '../../app/models/Iperfil';
import type { Iitem } from '../../app/models/Iitem';
import type { Iusuario } from '../../app/models/auth/Iusuario';
import type { Ihabilbloq } from '../../app/models/Ihabil';
import type { Iitem_perfil } from '../../app/models/Iitem_perfil';

export const perfilSlice = createSlice({
 name: 'perfil',
 initialState: {
   perfil: [] as Iperfil[],
 },
 reducers: {
   perfil: (state, action) => {
     state.perfil = action.payload.perfil;
   },
 },
})

export const itemSlice = createSlice({
 name: 'item',
 initialState: {
   item: [] as Iitem[],
 },
 reducers: {
   item: (state, action) => {
     state.item = action.payload.item;
   },
 },
})

export const item_perfilSlice = createSlice({
 name: 'item_perfil',
 initialState: {
   item_perfil: [] as Iitem_perfil[],
 },
 reducers: {
   item_perfil: (state, action) => {
     state.item_perfil = action.payload.item_perfil;
   },
 },
})

export const usuarioSlice = createSlice({
 name: 'usuario',
 initialState: {
   usuario: [] as Iusuario[],
 },
 reducers: {
   usuario: (state, action) => {
     state.usuario = action.payload.usuario;
   },
 },
})

export const habilSlice = createSlice({
 name: 'habil',
 initialState: {
   habil: [] as Ihabilbloq[],
 },
 reducers: {
   habil: (state, action) => {
     state.habil = action.payload.habil;
   },
 },
})

export const { perfil } = perfilSlice.actions
export const { item } = itemSlice.actions
export const { item_perfil } = item_perfilSlice.actions
export const { usuario } = usuarioSlice.actions
export const { habil } = habilSlice.actions
