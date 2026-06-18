import { createSlice } from '@reduxjs/toolkit'
import type { Iperfil } from '../../app/models/Iperfil';
import type { Isector } from '../../app/models/Isector';
import type { Iperfilxsector } from '../../app/models/Iperfilxsector';
import type { Iusuario } from '../../app/models/auth/Iusuario';

export const perfilSlice = createSlice({
 name: 'perfil',
 initialState: {
   perfil: Array<Iperfil>(),
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
   sector: Array<Isector>(),
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
   perfilxsector: Array<Iperfilxsector>(),
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
   usuario: Array<Iusuario>(),
 },
 reducers: {
   usuario: (state, action) => {
     state.usuario = action.payload.usuario;
   },
 },
})

export const { perfil } = perfilSlice.actions
export const { sector } = sectorSlice.actions
export const { perfilxsector } = perfilxsectorSlice.actions
export const { usuario } = usuarioSlice.actions
