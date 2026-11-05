import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Autocomplete,
  Box,
  Paper,
  TextField,
  Typography,
  useTheme,
  Button,
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Stop,
  SaveAlt,
  CheckCircle,
  Contactless,
  FileDownload,
} from "@mui/icons-material";
import { useCargaInicial } from "../hooks/useCargaInicial";
import { useEffect, useState, useRef } from "react";
import { getByCampoValor, multipost, vaciar } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";
import { toast } from "react-toastify";
import type { Imedicion } from "../models/Itablas";
import { useExcelExport } from "../hooks/useExcelExport";

export const Play = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  useCargaInicial(["metodo", { tabla: "configuracion", conRelaciones: true }]);

  const metodos = useSelector((state: RootState) => state.metodo.metodo);
  const canales = useSelector((state: RootState) => state.canal.canal);
  const configuraciones = useSelector(
    (state: RootState) => state.configuracion.configuracion,
  );

  // Filtro Canales por Método
  const [filtroCanales, setFiltroCanales] = useState<any>(null);
  useEffect(() => {
    if (metodos.length > 0 && !filtroCanales) {
      setFiltroCanales(metodos[0]);
    }
    if (filtroCanales?.id) {
      dispatch(vaciar("canal", actionCreatorMap) as any);
      dispatch(vaciar("medicion", actionCreatorMap) as any);
      dispatch(
        getByCampoValor(
          "canal",
          actionCreatorMap,
          "metodo_id",
          filtroCanales.id,
        ) as any,
      );
    }
  }, [metodos, filtroCanales]);

  const [configuracionSeleccionada, setConfiguracionSeleccionada] =
    useState<any>(null);
  useEffect(() => {
    if (configuraciones.length > 0 && !configuracionSeleccionada) {
      setConfiguracionSeleccionada(configuraciones[0]);
    }
  }, [configuraciones, configuracionSeleccionada]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Id", flex: 1 },
    { field: "valor", headerName: "Valor", flex: 1 },
    { field: "complemento", headerName: "Complemento", flex: 1 },
    { field: "estado", headerName: "Estado", flex: 1 },
    { field: "rango", headerName: "Rango", flex: 1 },
    { field: "frecuencia", headerName: "Frecuencia", flex: 1 },
    { field: "canal", headerName: "Canal", flex: 1 },
    { field: "inyeccion1", headerName: "I1", flex: 1 },
    { field: "inyeccion2", headerName: "I2", flex: 1 },
    { field: "medicion1", headerName: "M1", flex: 1 },
    { field: "medicion2", headerName: "M2", flex: 1 },
  ];
  const paginationModels = { page: 0, pageSize: 5 };

  useEffect(() => {
    dispatch(vaciar("medicion", actionCreatorMap) as any);
    dispatch(vaciar("canal", actionCreatorMap) as any);
  }, []);

  const [medicionesTomadas, setMedicionesTomadas] = useState<any[]>([]);
  const [corriendo, setCorriendo] = useState(false);
  const [pausado, setPausado] = useState(false);

  const abortarRef = useRef<AbortController | null>(null);
  const pausaRef = useRef(false);
  const indiceRef = useRef(0);

  const total = canales.length || 0;
  const actual = medicionesTomadas.length;

  // Recorrido con el indice guardado
  const correr = async (startIndex: number) => {
    for (let i = startIndex; i < canales.length; i++) {
      if (abortarRef.current?.signal.aborted) break;

      // Si está pausado, esperar
      while (pausaRef.current) {
        if (abortarRef.current?.signal.aborted) break;
        await new Promise((r) => setTimeout(r, 200));
      }
      if (abortarRef.current?.signal.aborted) break;

      const canal = canales[i];
      const data = {
        id: i,
        valor: Number((Math.random() * 9999).toFixed(2)),
        complemento: 89657.34,
        estado: 1,
        rango: 0,
        frecuencia: 20,
        canal_id: canal.id,
        canal: canal.nombre,
        inyeccion1: canal.inyeccion1,
        inyeccion2: canal.inyeccion2,
        medicion1: canal.medicion1,
        medicion2: canal.medicion2,
      };

      await new Promise((r) => setTimeout(r, 150));
      setMedicionesTomadas((prev) => [...prev, data]);
      indiceRef.current = i + 1;

      if (indiceRef.current >= canales.length) {
        break; // llegamos al final, no seguir
      }
    }
    setCorriendo(false);
    setPausado(false);
    pausaRef.current = false;
  };

  // Iniciar
  const handleIniciar = () => {
    if (!canales.length) return;
    if (corriendo && !pausado) return; // ya está corriendo

    // Si estaba pausado reanudar
    if (pausado) {
      pausaRef.current = false;
      setPausado(false);
      setCorriendo(true);
      return;
    }
    // Si ya terminó todo, reiniciar
    if (indiceRef.current >= canales.length) {
      indiceRef.current = 0;
      setMedicionesTomadas([]);
    }

    setCorriendo(true);
    setPausado(false);
    pausaRef.current = false;
    abortarRef.current = new AbortController();
    correr(indiceRef.current);
  };

  // Pausar
  const handleTogglePause = () => {
    if (!corriendo && !pausado) return;
    const nuevoEstado = !pausado;
    pausaRef.current = nuevoEstado;
    setPausado(nuevoEstado);
  };

  // Parar
  const handleParar = () => {
    abortarRef.current?.abort();
    pausaRef.current = false;
    setCorriendo(false);
    setPausado(false);
    indiceRef.current = 0;
    setMedicionesTomadas([]);
  };

  // Guardar
  const handleGuardar = () => {
    const data: Imedicion[] = medicionesTomadas.map((m) => ({
      canal_id: m.canal_id,
      configuracion_id: configuracionSeleccionada?.id,
      valor: m.valor,
      complemento: m.complemento,
      estado: m.estado,
      rango: m.rango,
      frecuencia: m.frecuencia,
    }));
    dispatch(multipost("medicion", actionCreatorMap, data, false, false))
      .then(() => {
        toast.success("Mediciones guardadas");
        handleParar();
      })
      .catch(() => toast.error("Error al agregar. Posible duplicado"));
  };

  //Enviar Excel
  const { exportFromArrays } = useExcelExport();
  const enviarExcel = () => {
    // 1. Encabezado
    const headers = [
      "Id",
      "Valor",
      "Complemento",
      "Estado",
      "Rango",
      "Frecuencia",
      "Canal",
      "Inyeccion1",
      "Inyeccion2",
      "Medicion1",
      "Medicion2",
      "Método",
      "Configuración",
      "Frecuencia",
      "Bias",
      "Función",
      "Frecuencia Inicial",
      "Frecuencia Final",
      "Frecuencia Cantidad",
      "Voltaje",
      "Fecha",
    ];
    // 2. Filas
    const dia = new Date().toLocaleDateString("es-AR");
    const rows = (medicionesTomadas || []).map((r: any) => [
      r.id ?? "-",
      r.valor ?? "-",
      r.complemento ?? "-",
      r.estado ?? "-",
      r.rango ?? "-",
      r.frecuencia ?? "-",
      r.canal ?? "-",
      r.inyeccion1 ?? "-",
      r.inyeccion2 ?? "-",
      r.medicion1 ?? "-",
      r.medicion2 ?? "-",
      filtroCanales.nombre ?? "-",
      configuracionSeleccionada.nombre ?? "-",
      configuracionSeleccionada.frecuencia.nombre ?? "-",
      configuracionSeleccionada.bias.valor ?? "-",
      configuracionSeleccionada.funcion.nombre ?? "-",
      configuracionSeleccionada.frecuencia_inicial ?? "-",
      configuracionSeleccionada.frecuencia_final ?? "-",
      configuracionSeleccionada.frecuencia_cantidad ?? "-",
      configuracionSeleccionada.voltaje ?? "-",
      dia,
    ]);

    exportFromArrays(headers, rows, "Mediciones");
  };

  useEffect(() => {
    handleParar();
  }, [filtroCanales?.id]);

  const cardStyle = {
    borderRadius: `${theme.shape.borderRadius}px`,
    border: "1px solid" as const,
    borderColor: "grey.200",
    overflow: "hidden" as const,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: theme.palette.primary.main,
          color: "white",
          borderRadius: `${theme.shape.borderRadius}px`,
          py: 1.5,
          px: 2.5,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Contactless fontSize="small" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Realizar Mediciones
          </Typography>
        </Box>

        <Typography variant="h6">{new Date().toLocaleDateString()}</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <Box
          sx={{ width: 320, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Paper sx={cardStyle}>
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                px: 2,
                py: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>Método</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Autocomplete
                options={metodos || []}
                getOptionLabel={(o: any) => o.nombre}
                value={filtroCanales}
                onChange={(_, v) => {
                  if (v) setFiltroCanales(v);
                }}
                size="small"
                sx={{ minWidth: 180 }}
                renderInput={(params) => (
                  <TextField {...params} label="Método" />
                )}
              />
            </Box>
          </Paper>

          <Paper sx={cardStyle}>
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                px: 2,
                py: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>Configuración</Typography>
            </Box>
            <Box
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <Autocomplete
                options={configuraciones || []}
                getOptionLabel={(o: any) => o.nombre}
                value={configuracionSeleccionada}
                onChange={(_, v) => {
                  if (v) setConfiguracionSeleccionada(v);
                }}
                size="small"
                sx={{ minWidth: 180 }}
                renderInput={(params) => (
                  <TextField {...params} label="Configuración" />
                )}
              />
              <Divider />
              <TextField
                label="Frecuencia"
                disabled
                size="small"
                value={configuracionSeleccionada?.frecuencia?.nombre ?? ""}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  mt: 1,
                }}
              >
                <TextField
                  label="Bias"
                  disabled
                  size="small"
                  value={configuracionSeleccionada?.bias?.valor ?? ""}
                />
                <TextField
                  label="Función"
                  disabled
                  size="small"
                  value={configuracionSeleccionada?.funcion?.nombre ?? ""}
                />
                <TextField
                  label="Frecuencia Inicial"
                  disabled
                  size="small"
                  value={configuracionSeleccionada?.frecuencia_inicial ?? ""}
                />
                <TextField
                  label="Frecuencia Final"
                  disabled
                  size="small"
                  value={configuracionSeleccionada?.frecuencia_final ?? ""}
                />
                <TextField
                  label="Frecuencia Cantidad"
                  disabled
                  size="small"
                  value={configuracionSeleccionada?.frecuencia_cantidad ?? ""}
                />
                <TextField
                  label="Voltaje"
                  disabled
                  size="small"
                  value={configuracionSeleccionada?.voltaje ?? ""}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Paper
            sx={{
              ...cardStyle,
              p: 1.2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {corriendo && !pausado ? (
                <CircularProgress size={22} />
              ) : (
                <CheckCircle color="success" />
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                justifyContent: "center",
                mt: 1,
              }}
            >
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrow />}
                onClick={handleIniciar}
                disabled={corriendo && !pausado}
              >
                {pausado ? "Continuar" : "Iniciar"}
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<Pause />}
                onClick={handleTogglePause}
                disabled={!corriendo && !pausado}
              >
                {pausado ? "Reanudando..." : "Pausar"}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleParar}
                disabled={!corriendo && !pausado && actual === 0}
              >
                Parar
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Guardar Datos">
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<SaveAlt />}
                onClick={handleGuardar}
                disabled={!actual}
              >
                Guardar
              </Button>
            </Tooltip>
            <Tooltip title="Exportar a Excel">
              <Button
                variant="outlined"
                color="success"
                startIcon={<FileDownload />}
                onClick={() => enviarExcel()}
                disabled={!actual}
              >
                Excel
              </Button>
            </Tooltip>
          </Paper>

          <Paper sx={cardStyle}>
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                px: 2,
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ fontWeight: 700 }}
              >{`Mediciones ${actual} / ${total}`}</Typography>
            </Box>
            <DataGrid
              rows={medicionesTomadas}
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
        </Box>
      </Box>
    </Box>
  );
};
