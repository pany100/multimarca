export default function generateReciboHtml(ingresoPorReparacion: any): string {
  return `
  <!DOCTYPE html>

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @page {
        size: A4;
        /* Change from the default size of A4 */
        margin: 0mm;
        /* Set margin on each page */
      }
    </style>
  </head>
  <html>
  
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="text-align: center;">Recibo de Pago</h1>
      <p style="text-align: right;">Fecha: ${new Date(
        ingresoPorReparacion.fecha
      ).toLocaleDateString("es-AR")}</p>
      <p>Recibido de: <strong>${
        ingresoPorReparacion.cliente.fullName
      }</strong></p>
      <p>La suma de: <strong>$${Number(
        ingresoPorReparacion.monto
      ).toLocaleString("es-AR")}</strong></p>
      <p>En concepto de la reparación: <strong>#${
        ingresoPorReparacion.ordenReparacionId
      } - ${ingresoPorReparacion.ordenReparacion.auto.brand} ${
    ingresoPorReparacion.ordenReparacion.auto.model
  } (${ingresoPorReparacion.ordenReparacion.auto.patent})</strong></p>
      <p>Descripción: ${ingresoPorReparacion.descripcion}</p>
      <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; text-align: center;">
        <p>Gracias por su pago</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
