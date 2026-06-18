import { configureStore } from '@reduxjs/toolkit'
import { perfilSlice, perfilxsectorSlice, sectorSlice, usuarioSlice } from './slices/slice'
import { authSlice } from './slices/authSlice'

export const store = configureStore({
  reducer: {
	auth: authSlice.reducer,
	usuario: usuarioSlice.reducer,
	
	perfil: perfilSlice.reducer,
	sector: sectorSlice.reducer,
	perfilxsector: perfilxsectorSlice.reducer,
	
  },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
