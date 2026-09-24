import { useDispatch, useSelector } from "react-redux";
import { Leer } from "../hooks/Leer";
import type { AppDispatch, RootState } from "../../redux/store";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Fab, Paper, Tooltip, useTheme } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { deletedFisicoCompuesto } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";
import AlertDialog from "../hooks/AlertDialog";
import type { Iitem_perfil } from "../models/Iitem_perfil";
import { Item_PerfilForm } from "../components/Item_PerfilForm";

export const Item_Perfil = () => {
  //Leer
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const items_perfiles = useSelector(
    (state: RootState) => state.item_perfil.item_perfil,
  );

  // Columnas
  const columns: GridColDef[] = [
    {
      field: "perfil",
      headerName: "Perfil",
      renderCell: (params) => <>{params.row?.perfil.nombre || "-"}</>,
      flex: 1,
    },
    {
      field: "item",
      headerName: "Item",
      renderCell: (params) => <>{params.row?.item.nombre || "-"}</>,
      flex: 1,
    },
    { field: "nivel", headerName: "Nivel", flex: 1 },

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
                setPk1(params.row.item_id);
                setPk2(params.row.perfil_id);
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
  const [editState, setEditState] = useState<Iitem_perfil | null>(null);

  //Borrar
  const [Pk1, setPk1] = useState<number | null>(null); // ID a eliminar o blanquear Item
  const [Pk2, setPk2] = useState<number | null>(null); // ID a eliminar o blanquear Perfil
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogClose = (confirmDelete: boolean) => {
    if (confirmDelete && Pk1 !== null && Pk2 !== null) {
      dispatch(
        deletedFisicoCompuesto(
          "item_perfil",
          actionCreatorMap,
          Pk1,
          Pk2,
          true,
          true,
        ),
      )
        .then(() => toast.error("Elemento eliminado"))
        .catch(() => toast.error("Error al eliminar el elemento"));
    }
    setPk1(null);
    setPk2(null);
    setOpenDialog(false);
  };

  //Otras Tablas
  const otrasTablas = useMemo(() => ["perfil", "item"], []);

  return (
    <>
      <Leer
        tabla="item_perfil"
        conRelaciones={true}
        otrasTablas={otrasTablas}
      />
      {items_perfiles && (
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
              <h2>Item - Perfil</h2>
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
                rows={items_perfiles}
                columns={columns}
                getRowId={(row) => `${row.item_id}-${row.perfil_id}`}
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
          <Item_PerfilForm
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
