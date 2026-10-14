import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Fab, Paper, Tooltip, useTheme } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useState } from "react";
import type { Imedicion } from "../models/Itablas";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { deleted } from "../../redux/slices/thunks";
import { toast } from "react-toastify";
import { Leer } from "../hooks/Leer";
import AlertDialog from "../hooks/AlertDialog";
import { MedicionForm } from "../components/MedicionForm";

export const Medicion = () => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const mediciones = useSelector((state: RootState) => state.medicion.medicion);

  // Columnas
  const columns: GridColDef[] = [
    {
      field: "configuracion.nombre",
      headerName: "Configuración",
      flex: 1,
      renderCell: (params) => (
        <>{params.row?.configuracion?.nombre ?? "Sin configuración"}</>
      ),
    },
    {
      field: "canal.nombre",
      headerName: "Canal",
      flex: 0.6,
      renderCell: (params) => <>{params.row?.canal?.nombre ?? "Sin canal"}</>,
    },
    { field: "valor", headerName: "Valor", flex: 1 },
    { field: "complemento", headerName: "Complemento", flex: 1 },
    { field: "estado", headerName: "Estado", flex: 1 },
    { field: "rango", headerName: "Rango", flex: 1 },
    { field: "frecuencia", headerName: "Frecuencia", flex: 1 },
    {
      field: "fecha_creacion",
      headerName: "Fecha Creación",
      renderCell: (params) => (
        <>
          {params.row?.fecha_creacion
            ? new Date(params.row.fecha_creacion).toLocaleDateString("es-AR")
            : "Sin fecha"}
        </>
      ),
      flex: 1,
    },
    {
      field: "fecha_modificacion",
      headerName: "Fecha Modificación",
      renderCell: (params) => (
        <>
          {params.row?.fecha_modificacion
            ? new Date(params.row.fecha_modificacion).toLocaleDateString(
                "es-AR",
              )
            : "Sin fecha"}
        </>
      ),
      flex: 1,
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 0.7,
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
  const [editState, setEditState] = useState<Imedicion | null>(null);

  //Borrar
  const [Id, setId] = useState<number | null>(null); // ID a eliminar o blanquear
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogClose = (confirmDelete: boolean) => {
    if (confirmDelete && Id !== null) {
      dispatch(deleted("medicion", actionCreatorMap, Id, true, true))
        .then(() => toast.error("Elemento eliminado"))
        .catch(() => toast.error("Error al eliminar el elemento"));
    }
    setId(null);
    setOpenDialog(false);
  };

  return (
    <>
      <Leer
        tabla="medicion"
        conRelaciones={true}
        otrasTablas={["configuracion", "canal"]}
      />
      {mediciones && (
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
              <h2>Mediciones</h2>
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
                rows={mediciones}
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
          <MedicionForm
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
