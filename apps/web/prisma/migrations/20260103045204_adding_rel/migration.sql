/*
  Warnings:

  - A unique constraint covering the columns `[ordenReparacionId,controlMecanicoId]` on the table `ControlEnReparacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ControlEnReparacion_ordenReparacionId_controlMecanicoId_key` ON `ControlEnReparacion`(`ordenReparacionId`, `controlMecanicoId`);
