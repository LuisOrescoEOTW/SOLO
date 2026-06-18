import { useDispatch, useSelector } from "react-redux";
import { Leer } from "../hooks/Leer";
import type { AppDispatch, RootState } from "../../redux/store";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Fab, Paper, Tooltip, useTheme } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useState } from "react";
import type { Iperfil } from "../models/Iperfil";
import { deleted } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";
import AlertDialog from "../hooks/AlertDialog";
import { PerfilesForm } from "../components/PerfilesForm";

export const Perfil = () => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const perfiles = useSelector((state: RootState) => {
    return (state as any).perfil?.perfil || [];
  });

  // Columnas
  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
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
  const [editState, setEditState] = useState<Iperfil | null>(null);

  //Borrar
  const [Id, setId] = useState<number | null>(null); // ID a eliminar o blanquear
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogClose = (confirmDelete: boolean) => {
    if (confirmDelete && Id !== null) {
      dispatch(deleted("perfil", actionCreatorMap, Id, true))
        .then(() => toast.error("Elemento eliminado"))
        .catch(() => toast.error("Error al eliminar el elemento"));
    }
    setId(null);
    setOpenDialog(false);
  };

  return (
    <>
      <Leer tabla="perfil" conRelaciones={false} otrasTablas={[]} />
      {perfiles && (
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
              <h2>Perfiles</h2>
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
                rows={perfiles}
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
          <PerfilesForm
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
        </>
      )}
    </>
  );
};
