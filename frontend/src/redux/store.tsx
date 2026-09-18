import { configureStore } from '@reduxjs/toolkit'
import { habilSlice, usuarioSlice, itemSlice, perfilSlice, item_perfilSlice } from './slices/slice'
import { authSlice } from './slices/authSlice'

export const store = configureStore({
  reducer: {
	auth: authSlice.reducer,
	usuario: usuarioSlice.reducer,
	
	perfil: perfilSlice.reducer,
	item: itemSlice.reducer,
	item_perfil: item_perfilSlice.reducer,
	habil: habilSlice.reducer,
	
  },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

