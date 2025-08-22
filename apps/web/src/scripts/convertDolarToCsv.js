const fs = require("fs");

// Leer el archivo JSON
const jsonData = JSON.parse(fs.readFileSync("../../data/dolar.json", "utf8"));

// Crear un objeto para almacenar los datos por fecha
const dataByDate = {};

// Iterar sobre cada elemento del JSON
jsonData.forEach((item) => {
  const fecha = item.fecha;
  const casa = item.casa;
  const venta = item.venta;

  if (!dataByDate[fecha]) {
    dataByDate[fecha] = {};
  }

  dataByDate[fecha][casa] = venta;
});

// Crear el contenido del CSV
let csvContent = "fecha,oficial,blue\n";

Object.keys(dataByDate)
  .sort()
  .forEach((fecha) => {
    const oficial = dataByDate[fecha].oficial || "";
    const blue = dataByDate[fecha].blue || "";
    csvContent += `${fecha},${oficial},${blue}\n`;
  });

// Escribir el archivo CSV
fs.writeFileSync("dolar_data.csv", csvContent);

console.log("El archivo CSV ha sido creado exitosamente.");
