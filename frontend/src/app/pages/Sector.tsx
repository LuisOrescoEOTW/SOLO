import { General } from "./General";

export const Sector = () => {
  return (
    <>
    Sector
      {/* <General
        tabla="sector"
        columnas={[
          { campo: "id", nombre: "Id" },
          { campo: "nombre", nombre: "Nombre" },
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
              value ? new Date(value).toLocaleDateString("es-AR") : "",
          },
        ]}
        relaciones={false}
      /> */}
    </>
  );
};
