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
  IconButton,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Stop,
  SaveAlt,
  CheckCircle,
  Contactless,
} from "@mui/icons-material";
import { useCargaInicial } from "../hooks/useCargaInicial";
import { useEffect, useState, useRef } from "react";
import { getByCampoValor, vaciar } from "../../redux/slices/thunks";
import { actionCreatorMap } from "../../redux/actionCreatorMap";

export const Play = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  //Leer
  useCargaInicial(["metodo", { tabla: "configuracion", conRelaciones: true }]);

  //Leer
  useCargaInicial(["metodo", { tabla: "configuracion", conRelaciones: true }]);

  // Tabla General
  const mediciones = useSelector((state: RootState) => state.medicion.medicion);

  // Tablas Relacionadas. De selección
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
      dispatch(vaciar("canal", actionCreatorMap) as any); // Vaciar la tabla de canales antes de buscar nuevos
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

  useEffect(() => {
    console.log("Canales actualizados:", canales);
  }, [canales]);

  // Selecciono Configuración por defecto
  const [configuracionSeleccionada, setConfiguracionSeleccionada] =
    useState<any>(null);
  useEffect(() => {
    if (configuraciones.length > 0 && !configuracionSeleccionada) {
      setConfiguracionSeleccionada(configuraciones[0]);
    }
  }, [configuraciones, configuracionSeleccionada]);

  useEffect(() => {
    console.log("Configuración seleccionada:", configuracionSeleccionada);
  }, [configuracionSeleccionada]);

  // Columnas
  const columns: GridColDef[] = [
    {
      field: "canal",
      headerName: "Canal",
      flex: 1,
      renderCell: (params) => <>{params.row?.canal?.nombre ?? "-"}</>,
    },
    { field: "valor", headerName: "Valor", flex: 1 },
    { field: "complemento", headerName: "Complemento", flex: 1 },
    { field: "estado", headerName: "Estado", flex: 1 },
    { field: "rango", headerName: "Rango", flex: 1 },
    { field: "frecuencia", headerName: "Frecuencia", flex: 1 },
  ];
  const paginationModels = { page: 0, pageSize: 50 };

  useEffect(() => {
    dispatch(vaciar("medicion", actionCreatorMap) as any);
    dispatch(vaciar("canal", actionCreatorMap) as any);
  }, []);

  //Configuración

  const [medicionesLive, setMedicionesLive] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const pausedRef = useRef(false);

  const total = canales.length || 0;
  const actual = medicionesLive.length;

  const handleIniciar = async () => {
    if (!canales.length) return;
    setIsPlaying(true);
    setIsPaused(false);
    pausedRef.current = false;
    abortRef.current = new AbortController();

    for (let i = 0; i < canales.length; i++) {
      if (abortRef.current.signal.aborted) break;
      while (pausedRef.current) await new Promise((r) => setTimeout(r, 300));

      const canal = canales[i];
      const data = {
        id: Date.now() + i,
        canal: canal.nombre ?? `Canal ${canal.id}`,
        valor: (Math.random() * 9999).toFixed(2),
        complemento: "89657.34",
        estado: 1,
        rango: 0,
        frecuencia: 20,
        inyeccion_1: 1,
        inyeccion_2: i + 1,
        medicion_1: 1,
        medicion_2: i + 1,
      };
      await new Promise((r) => setTimeout(r, 150));
      setMedicionesLive((prev) => [...prev, data]);
    }
    setIsPlaying(false);
  };

  const handleDetener = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  };

  const handleParar = () => {
    abortRef.current?.abort();
    setIsPlaying(false);
    setIsPaused(false);
  };

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
        }}
      >
        <Contactless fontSize="small" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Realizar Mediciones
        </Typography>
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
              {isPlaying && !isPaused ? (
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
                disabled={isPlaying && !isPaused}
              >
                Iniciar
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<Pause />}
                onClick={handleDetener}
                disabled={!isPlaying}
              >
                Detener
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleParar}
                disabled={!isPlaying && !isPaused}
              >
                Parar
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<SaveAlt />}
              disabled={!actual}
            >
              Guardar
            </Button>
            <IconButton
              size="small"
              sx={{ border: "1px solid", borderColor: "grey.300" }}
            >
              X
            </IconButton>
            <Typography variant="caption">
              {new Date().toLocaleDateString()}
            </Typography>
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
              rows={medicionesLive}
              columns={columns}
              autoHeight
              hideFooter
              paginationModel={{ page: 0, pageSize: 100 }}
              disableRowSelectionOnClick
              density="compact"
            />
          </Paper>

          {/* FIX del Stack: uso Box flex para evitar el error de overload */}
        </Box>
      </Box>
    </Box>
  );
};
