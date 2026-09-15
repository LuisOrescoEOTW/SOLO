import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { useState } from "react";
import { deleted } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { Fab, Paper, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Delete, Edit, Add } from "@mui/icons-material";
import { toast } from "react-toastify";
import AlertDialog from "../hooks/AlertDialog";
import { GeneralForm } from "../components/GeneralForm";
interface Props {
  tabla: string;
  columnas: any;
  relaciones?: boolean;
  auxTablas?: string[];
}

export const Grilla = ({ tabla, columnas, relaciones, auxTablas }: Props) => {
  
  //Leer
  const dispatch = useDispatch<AppDispatch>();

  // Obtener dinámicamente los datos del slice
  const data = useSelector((state: RootState) => {
    return (state as any)[tabla]?.[tabla];
  });

  //Cargar la Grilla
  const paginationModels = { page: 0, pageSize: 5 };
  const columns: GridColDef[] =
    data && data.length > 0
      ? [
          ...columnas
            .filter((x: any) => !x.relacion)
            .map((key: any) => ({
              field: key.campo,
              headerName: key.nombre,
              flex: 1,
              valueGetter: key.valueGetter || undefined,
            })),

          // Columna Acciones
          {
            field: "acciones",
            headerName: "Acciones",
            flex: 0.8,
            sortable: false,
            filterable: false,

            renderCell: (params: any) => (
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
                      setDeleteId(params.row.id);
                      setOpenDialog(true);
                    }}
                  >
                    <Delete fontSize="small" />
                  </Fab>
                </Tooltip>
              </div>
            ),
          },
        ]
      : [];

  // Agregar - Modificar
  const [modalAbrir, setModalAbrir] = useState(false);
  const [editState, setEditState] = useState(null);

  //Borrar
  const [deleteId, setDeleteId] = useState<number | null>(null); // ID a eliminar
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogClose = (confirmDelete: boolean) => {
    if (confirmDelete && deleteId !== null) {
      dispatch(deleted(tabla, actionCreatorMap, deleteId, relaciones))
        .then(() => toast.error("Elemento eliminado"))
        .catch(() => toast.error("Error al eliminar el elemento"));
    }
    setDeleteId(null);
    setOpenDialog(false);
  };

  return (
    <>
      {data && (
        <>
          <div style={{ margin: "5px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                // backgroundColor: "#008F9E",
                marginBottom: "1%",
                paddingLeft: "3%",
                paddingRight: "3%",
                borderRadius: "20px",
                // color: "white",
              }}
            >
              <h2>{tabla.charAt(0).toUpperCase() + tabla.slice(1)}</h2>
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
                rows={data}
                columns={columns}
                initialState={{
                  pagination: { paginationModel: paginationModels },
                }}
                pageSizeOptions={[5, 10, 50, 100]}
                // onRowSelectionModelChange={handleRowSelection}
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
          <GeneralForm
            open={modalAbrir}
            onClose={() => {
              setModalAbrir(false);
              setEditState(null);
            }}
            editState={editState}
            tabla={tabla}
            relaciones={relaciones}
            campos={columnas.filter(
              (x: any) =>
                x.campo !== "id" &&
                x.campo !== "fechacreacion" &&
                x.campo !== "fechamodificacion" &&
                !x.valueGetter
            )}
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
