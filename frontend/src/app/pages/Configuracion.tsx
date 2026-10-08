import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Fab, Paper, Tooltip, useTheme } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useState } from "react";
import type { Iconfiguracion } from "../models/Itablas";
import { deletedFisico } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";
import { Leer } from "../hooks/Leer";
import AlertDialog from "../hooks/AlertDialog";
import { ConfiguracionForm } from "../components/ConfiguracionForm";

export const Configuracion = () => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const configuraciones = useSelector(
    (state: RootState) => state.configuracion.configuracion,
  );

  // Columnas
  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    {
      field: "frecuencia.nombre",
      headerName: "Frecuencia",
      flex: 1,
      renderCell: (params) => (
        <>{params.row?.frecuencia?.nombre ?? "Sin frecuencia"}</>
      ),
    },
    {
      field: "bias.valor",
      headerName: "Bias",
      flex: 1,
      renderCell: (params) => <>{params.row?.bias?.valor ?? "Sin bias"}</>,
    },
    {
      field: "funcion.nombre",
      headerName: "Función",
      flex: 1,
      renderCell: (params) => (
        <>{params.row?.funcion?.nombre ?? "Sin función"}</>
      ),
    },
    {
      field: "usuario.nombre",
      headerName: "Usuario",
      flex: 1,
      renderCell: (params) => (
        <>{params.row?.usuario?.nombre ?? "Sin usuario"}</>
      ),
    },
    { field: "frecuencia_inicial", headerName: "Frecuencia Inicial", flex: 1 },
    {
      field: "frecuencia_cantidad",
      headerName: "Frecuencia Cantidad",
      flex: 1,
    },
    { field: "frecuencia_final", headerName: "Frecuencia Final", flex: 1 },
    { field: "voltaje", headerName: "Voltaje", flex: 1 },
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
              color="info"
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
  const [editState, setEditState] = useState<Iconfiguracion | null>(null);

  //Borrar
  const [Id, setId] = useState<number | null>(null); // ID a eliminar o blanquear
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogClose = (confirmDelete: boolean) => {
    if (confirmDelete && Id !== null) {
      dispatch(deletedFisico("configuracion", actionCreatorMap, Id, true, true))
        .then(() => toast.error("Elemento eliminado"))
        .catch(() => toast.error("Error al eliminar el elemento"));
    }
    setId(null);
    setOpenDialog(false);
  };

  return (
    <>
      <Leer
        tabla="configuracion"
        conRelaciones={true}
        otrasTablas={["frecuencia", "bias", "funcion", "usuario"]}
      />
      {configuraciones && (
        <>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5%",
                paddingLeft: "1%",
                paddingRight: "1%",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <h2>Configuración</h2>
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
                rows={configuraciones}
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
          <ConfiguracionForm
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
