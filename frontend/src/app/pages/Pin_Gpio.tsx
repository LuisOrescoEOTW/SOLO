import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { Fab, Paper, Tooltip, useTheme } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useState } from "react";
import type { Ipin_gpio } from "../models/Itablas";
import { deletedFisico } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";
import { Leer } from "../hooks/Leer";
import AlertDialog from "../hooks/AlertDialog";
import { Pin_GpioForm } from "../components/Pin_GpioForm";

export const Pin_Gpio = () => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const pines_gpios = useSelector(
    (state: RootState) => state.pin_gpio.pin_gpio,
  );

  // Columnas
  const columns: GridColDef[] = [
    {
      field: "selector.nombre",
      headerName: "Selector",
      flex: 1,
      renderCell: (params) => (
        <>{params.row?.selector?.nombre ?? "Sin selector"}</>
      ),
    },
    { field: "pin_ms", headerName: "Pin MS", flex: 1 },
    { field: "pin_rb", headerName: "Pin RB", flex: 1 },
    { field: "gpio_rb", headerName: "Gpio RB", flex: 1 },
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
  const [editState, setEditState] = useState<Ipin_gpio | null>(null);

  //Borrar
  const [Id, setId] = useState<number | null>(null); // ID a eliminar o blanquear
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogClose = (confirmDelete: boolean) => {
    if (confirmDelete && Id !== null) {
      dispatch(deletedFisico("pin_gpio", actionCreatorMap, Id, true, true))
        .then(() => toast.error("Elemento eliminado"))
        .catch(() => toast.error("Error al eliminar el elemento"));
    }
    setId(null);
    setOpenDialog(false);
  };

  return (
    <>
      <Leer tabla="pin_gpio" conRelaciones={true} otrasTablas={["selector"]} />
      {pines_gpios && (
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
              <h2>Pin Gpio</h2>
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
                rows={pines_gpios}
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
          <Pin_GpioForm
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
