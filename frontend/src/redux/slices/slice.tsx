import { createSlice } from '@reduxjs/toolkit'
import type { Iperfil } from '../../app/models/Iperfil';
import type { Isector } from '../../app/models/Iitem';
import type { Iperfilxsector } from '../../app/models/Iitem_perfil';
import type { Iusuario } from '../../app/models/auth/Iusuario';
import type { Ihabilbloq } from '../../app/models/Ihabil';

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

export const sectorSlice = createSlice({
 name: 'sector',
 initialState: {
   sector: [] as Isector[],
 },
 reducers: {
   sector: (state, action) => {
     state.sector = action.payload.sector;
   },
 },
})

export const perfilxsectorSlice = createSlice({
 name: 'perfilxsector',
 initialState: {
   perfilxsector: [] as Iperfilxsector[],
 },
 reducers: {
   perfilxsector: (state, action) => {
     state.perfilxsector = action.payload.perfilxsector;
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
export const { sector } = sectorSlice.actions
export const { perfilxsector } = perfilxsectorSlice.actions
export const { usuario } = usuarioSlice.actions
export const { habil } = habilSlice.actions
