import * as XLSX from "xlsx-js-style";

export const useExcelExport = () => {
  const pintarEncabezadoAzul = (worksheet: XLSX.WorkSheet) => {
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        fill: { patternType: "solid", fgColor: { rgb: "FF18067C" } },
        font: { color: { rgb: "FFFFFFFF" }, bold: true },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  };

  const exportFromArrays = (
    headers: string[],
    rows: any[][],
    fileName: string = "export",
  ) => {
    if (!rows || rows.length === 0) return;

    // Une encabezado + filas
    const aoa = [headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    pintarEncabezadoAzul(worksheet);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Articulos");
    XLSX.writeFile(
      workbook,
      `${fileName}_${new Date().toLocaleDateString("es-AR")}.xlsx`,
    );
  };

  const exportToExcel = (data: any[], fileName: string = "export") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    pintarEncabezadoAzul(worksheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Articulos");
    XLSX.writeFile(
      workbook,
      `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return { exportFromArrays, exportToExcel };
};
