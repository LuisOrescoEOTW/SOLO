import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Leer } from "../hooks/Leer";
import { Fab, Paper, Tooltip, useTheme } from "@mui/material";
import { useState } from "react";
import type { Iusuario } from "../models/auth/Iusuario";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Edit, LockReset } from "@mui/icons-material";
import { deleted } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";
import AlertDialog from "../hooks/AlertDialog";
import { UsuariosForm } from "../components/UsuariosForm";
import { resetearPassword } from "../../redux/slices/authThunks";

export const Usuarios = () => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const usuarios = useSelector((state: RootState) => {
    return (state as any).usuario?.usuario || [];
  });

  // Columnas
  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    {
      field: "perfil.nombre",
      headerName: "Perfil",
      flex: 1,
      renderCell: (params) => <>{params.row?.perfil?.nombre ?? "Sin perfil"}</>,
    },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "telefono", headerName: "Teléfono", flex: 1 },
    // {
    //   field: "bloqueado",
    //   headerName: "Bloqueado",
    //   renderCell: (params) => <>{params.row?.bloqueado ? "Sí" : "No"}</>,
    //   flex: 1,
    // },
    {
      field: "fechacreacion",
      headerName: "Fecha Creación",
      renderCell: (params) => (
        <>
          {params.row?.fechacreacion
            ? new Date(params.row.fechacreacion).toLocaleDateString("es-AR")
            : "Sin fecha"}
        </>
      ),
      flex: 1,
    },
    {
      field: "fechamodificacion",
      headerName: "Fecha Modificación",
      renderCell: (params) => (
        <>
          {params.row?.fechamodificacion
            ? new Date(params.row.fechamodificacion).toLocaleDateString("es-AR")
            : "Sin fecha"}
        </>
      ),
      flex: 1,
    },

    {
      field: "acciones",
      headerName: "Acciones",
      flex: 0.6,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Tooltip title="Editar">
            <Fab
              size="small"
              color="primary"
              onClick={(e) => {
                (e.currentTarget as HTMLButtonElement).blur();
                setEditState(params.row);
                setModalAbrir(true);
              }}
            >
              <Edit fontSize="small" />
            </Fab>
          </Tooltip>
          <Tooltip title="Resetear Contraseña">
            <Fab
              size="small"
              color="default"
              onClick={(e) => {
                (e.currentTarget as HTMLButtonElement).blur();
                setId(params.row.id);
                setOpenDialogReset(true);
              }}
            >
              <LockReset fontSize="small" />
            </Fab>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Fab
              size="small"
              color="error"
              onClick={(e) => {
                (e.currentTarget as HTMLButtonElement).blur();
                setId(params.row.id);
                setOpenDialog(true);
              }}
            >
              <Delete fontSize="small" />
            </Fab>
          </Tooltip>
        </div>
      ),
    },
  ];

  const paginationModels = { page: 0, pageSize: 5 };

  // Agregar - Modificar
  const [modalAbrir, setModalAbrir] = useState(false);
  const [editState, setEditState] = useState<Iusuario | null>(null);

  //Borrar
  const [Id, setId] = useState<number | null>(null); // ID a eliminar o blanquear
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogClose = (confirmDelete: boolean) => {
    if (confirmDelete && Id !== null) {
      dispatch(deleted("usuario", actionCreatorMap, Id, true))
        .then(() => toast.error("Elemento eliminado"))
        .catch(() => toast.error("Error al eliminar el elemento"));
    }
    setId(null);
    setOpenDialog(false);
  };

  // Reset Constraseña
  const [openDialogReset, setOpenDialogReset] = useState(false);
  const handleDialogCloseReset = (confirm: boolean) => {
    if (confirm && Id !== null) {
      dispatch(resetearPassword("usuario", actionCreatorMap, Id, true))
        .then(() => toast.success("Se realizó el reset a la contraseña"))
        .catch(() => toast.error("Error al resetear el elemento"));
    }
    setId(null);
    setOpenDialogReset(false);
  };

  return (
    <>
      <Leer tabla="usuario" conRelaciones={true} otrasTablas={["perfil"]} />
      {usuarios && (
        <>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: theme.palette.primary.main,
                marginBottom: "0.5%",
                paddingLeft: "1%",
                paddingRight: "1%",
                color: theme.palette.primary.contrastText,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <h2>Usuarios</h2>
              <div style={{ textAlign: "end" }}>
                <Tooltip title="Agregar">
                  <Fab
                    color="success"
                    size="small"
                    onClick={(e) => {
                      (e.currentTarget as HTMLButtonElement).blur();
                      setEditState(null);
                      setModalAbrir(true);
                    }}
                  >
                    <Add />
                  </Fab>
                </Tooltip>
              </div>
            </div>

            <Paper>
              <DataGrid
                rows={usuarios}
                columns={columns}
                initialState={{
                  pagination: { paginationModel: paginationModels },
                }}
                pageSizeOptions={[5, 10, 50, 100]}
                checkboxSelection={false}
                sx={{
                  width: "100%",
                  height: "100%",
                  border: 2,
                  borderColor: "#D9D9D9",
                  "& .MuiDataGrid-virtualScroller": { overflow: "auto" },
                }}
              />
            </Paper>
          </div>

          {/* Alta - Modificaciones */}
          <UsuariosForm
            open={modalAbrir}
            onClose={() => (setModalAbrir(false), setEditState(null))}
            editState={editState}
          />
          {/* Modal Eliminar */}
          <AlertDialog
            open={openDialog}
            onClose={handleDialogClose}
            mensaje="Eliminar"
          />
          {/* Modal Resetear */}
          <AlertDialog
            open={openDialogReset}
            onClose={handleDialogCloseReset}
            mensaje="Resetear Contraseña"
          />
        </>
      )}
    </>
  );
};

{
  /* <General
        tabla="usuario"
        auxTablas={["perfil"]}
        columnas={[
          { campo: "id", nombre: "Id"},
          { campo: "nombre", nombre: "Nombre" },
          // SOLO GRILLA
          {
            campo: "perfil",
            nombre: "Perfil",
            valueGetter: (value: any, row: any) => row?.perfil?.nombre || "",
          },
          // SOLO FORM
          {
            campo: "perfilid",
            nombre: "Perfil",
            relacion: true,
            opciones: perfiles,
            optionLabel: "nombre",
            optionValue: "id",
          },
          { campo: "email", nombre: "Email", tipo: "email" },
          { campo: "foto", nombre: "Foto" },
          { campo: "telefono", nombre: "Teléfono" },
          { campo: "bloqueado", nombre: "Bloqueado" },
          // { campo: "borrado", nombre: "Borrado", tipo: "boolean" },
          {
            campo: "fechacreacion",
            nombre: "Fecha Creación",
            valueGetter: (value: any) =>
              value ? new Date(value).toLocaleDateString("es-AR") : "",
          },

          {
            campo: "fechamodificacion",
            nombre: "Fecha Modificación",
            valueGetter: (value: any) =>
              value ? new Date(value).toLocaleString("es-AR") : "",
          },
        ]}
        relaciones={true}
      /> */
}
