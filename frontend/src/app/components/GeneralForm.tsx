import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { post, put } from "../../redux/slices/thunks";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  MenuItem,
} from "@mui/material";

import { actionCreatorMap } from "../../redux/actionCreatorMap";

interface Campo {
  campo: string;
  nombre: string;
  tipo?: string;
  relacion?: boolean;
  opciones?: any[];
  optionLabel?: string;
  optionValue?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  editState: any | null;
  tabla: string;
  campos: Campo[];
  relaciones?: boolean;
}

export const GeneralForm = ({
  open,
  onClose,
  editState,
  tabla,
  campos,
  relaciones,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estado inicial dinámico
  const initialState = campos.reduce((acc: any, campo) => {
    acc[campo.campo] = campo.tipo === "boolean" ? false : "";
    return acc;
  }, {});

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    defaultValues: initialState,
    mode: "onChange",
  });

  // Cargar datos al editar
  useEffect(() => {
    if (editState) {
      reset(editState);
    } else {
      reset(initialState);
    }
  }, [editState, reset]);

  // Guardar
  const onSubmit = (data: any) => {
    const cleanData = { ...data };

    // Eliminar objetos relación
    campos.forEach((campo) => {
      if (campo.relacion) {
        const nombreRelacion = campo.campo.replace("id", "");
        delete cleanData[nombreRelacion];
      }
    });

    if (editState) {
      dispatch(put(tabla, actionCreatorMap, cleanData, relaciones))
        .then(() => toast.info("Elemento modificado"))
        .catch(() => toast.error("Error al modificar"));
    } else {
      dispatch(post(tabla, actionCreatorMap, cleanData, relaciones))
        .then(() => toast.success("Elemento agregado"))
        .catch(() => toast.error("Error al agregar"));
    }

    reset(initialState);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editState ? "Editar" : "Nuevo"}</DialogTitle>

      <DialogContent>
        {campos.map((campo) => (
          <Controller
            key={campo.campo}
            name={campo.campo}
            control={control}
            rules={{
              required:
                campo.tipo !== "boolean"
                  ? `${campo.nombre} es requerido`
                  : false,

              validate: (value) => {
                // VALIDAR EMAIL
                if (campo.tipo === "email") {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                  if (!emailRegex.test(value)) {
                    return "Ingrese un email válido";
                  }
                }

                // VALIDAR SOLO NUMEROS
                if (campo.tipo === "number") {
                  const numberRegex = /^[0-9]+$/;

                  if (!numberRegex.test(value)) {
                    return "Solo se permiten números";
                  }
                }

                return true;
              },
            }}
            render={({ field }) =>
              campo.tipo === "boolean" ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <label>{campo.nombre}</label>

                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </div>
              ) : campo.relacion ? (
                <TextField
                  {...field}
                  select
                  margin="dense"
                  label={campo.nombre}
                  fullWidth
                  error={!!errors[campo.campo]}
                  helperText={errors[campo.campo]?.message as string}
                >
                  {campo.opciones?.map((opcion) => (
                    <MenuItem
                      key={opcion[campo.optionValue || "id"]}
                      value={opcion[campo.optionValue || "id"]}
                    >
                      {opcion[campo.optionLabel || "nombre"]}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  {...field}
                  margin="dense"
                  required={campo.tipo !== "boolean"}
                  label={campo.nombre}
                  type={
                    campo.tipo === "email"
                      ? "email"
                      : campo.tipo === "number"
                      ? "text"
                      : campo.tipo || "text"
                  }
                  fullWidth
                  error={!!errors[campo.campo]}
                  helperText={errors[campo.campo]?.message as string}
                  slotProps={{
                    htmlInput:
                      campo.tipo === "number"
                        ? {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }
                        : undefined,
                  }}
                  onInput={(e: any) => {
                    if (campo.tipo === "number") {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");

                      field.onChange(e.target.value);
                    }
                  }}
                />
              )
            }
          />
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="error" variant="contained">
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit(onSubmit)}
          color="success"
          variant="contained"
          disabled={!isValid}
        >
          {editState ? "Guardar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "../../redux/store";
// import { useEffect } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { toast } from "react-toastify";
// import { post, put } from "../../redux/slices/thunks";
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Switch,
//   MenuItem,
// } from "@mui/material";
// import { actionCreatorMap } from "../../redux/actionCreatorMap";
// interface Campo {
//   campo: string;
//   nombre: string;
//   tipo?: string;
//   // NUEVO
//   relacion?: boolean;
//   // ARRAY DE OPCIONES
//   opciones?: any[];
//   // QUE MOSTRAR
//   optionLabel?: string;
//   // QUE GUARDAR
//   optionValue?: string;
// }

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   editState: any | null;
//   tabla: string;
//   campos: Campo[];
//   relaciones?: boolean;
// }

// export const GeneralForm = ({
//   open,
//   onClose,
//   editState,
//   tabla,
//   campos,
//   relaciones,
// }: Props) => {
//   const dispatch = useDispatch<AppDispatch>();

//   // Estado inicial dinámico
//   const initialState = campos.reduce((acc: any, campo) => {
//     acc[campo.campo] = "";
//     return acc;
//   }, {});

//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isValid },
//     reset,
//   } = useForm({
//     defaultValues: initialState,
//     mode: "onChange",
//   });

//   // Cargar datos al editar
//   useEffect(() => {
//     if (editState) {
//       reset(editState);
//     } else {
//       reset(initialState);
//     }
//   }, [editState, reset]);

//   // Guardar
//   const onSubmit = (data: any) => {
//     // COPIA LIMPIA
//     const cleanData = { ...data };
//     // ELIMINAR OBJETOS DE RELACION
//     campos.forEach((campo) => {
//       if (campo.relacion) {
//         const nombreRelacion = campo.campo.replace("id", "");
//         delete cleanData[nombreRelacion];
//       }
//     });
//     if (editState) {
//       dispatch(put(tabla, actionCreatorMap, cleanData, relaciones))
//         .then(() => toast.info("Elemento modificado"))
//         .catch(() => toast.error("Error al modificar"));
//     } else {
//       dispatch(post(tabla, actionCreatorMap, cleanData, relaciones))
//         .then(() => toast.success("Elemento agregado"))
//         .catch(() => toast.error("Error al agregar"));
//     }
//     reset(initialState);
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>{editState ? "Editar" : "Nuevo"}</DialogTitle>

//       <DialogContent>
//         {campos.map((campo) => (
//           <Controller
//             key={campo.campo}
//             name={campo.campo}
//             control={control}
//             rules={{ required: `${campo.nombre} es requerido` }}
//             render={({ field }) =>
//               campo.tipo === "boolean" ? (
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     marginTop: "10px",
//                     marginBottom: "10px",
//                   }}
//                 >
//                   <label>{campo.nombre}</label>

//                   <Switch
//                     checked={!!field.value}
//                     onChange={(e) => field.onChange(e.target.checked)}
//                   />
//                 </div>
//               ) : campo.relacion ? (
//                 <TextField
//                   {...field}
//                   select
//                   margin="dense"
//                   label={campo.nombre}
//                   fullWidth
//                   error={!!errors[campo.campo]}
//                   helperText={errors[campo.campo]?.message as string}
//                 >
//                   {campo.opciones?.map((opcion) => (
//                     <MenuItem
//                       key={opcion[campo.optionValue || "id"]}
//                       value={opcion[campo.optionValue || "id"]}
//                     >
//                       {opcion[campo.optionLabel || "nombre"]}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               ) : (
//                 <TextField
//                   {...field}
//                   margin="dense"
//                   required
//                   label={campo.nombre}
//                   type={campo.tipo || "text"}
//                   fullWidth
//                   error={!!errors[campo.campo]}
//                   helperText={errors[campo.campo]?.message as string}
//                 />
//               )
//             }
//           />
//         ))}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="error" variant="contained">
//           Cancelar
//         </Button>
//         <Button
//           onClick={handleSubmit(onSubmit)}
//           color="success"
//           variant="contained"
//           disabled={!isValid}
//         >
//           {editState ? "Guardar" : "Agregar"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
