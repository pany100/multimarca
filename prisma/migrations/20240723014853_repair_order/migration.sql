-- CreateTable
CREATE TABLE `OrdenReparacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autoId` INTEGER NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaEntradaReparacion` DATETIME(3) NULL,
    `fechaSalidaReparacion` DATETIME(3) NULL,
    `kilometros` INTEGER NOT NULL,
    `observacionesCliente` TEXT NOT NULL,
    `observacionesEntrada` TEXT NOT NULL,
    `observacionesSalida` TEXT NOT NULL,
    `estado` VARCHAR(20) NOT NULL,
    `precioManoObra` DECIMAL(10, 2) NOT NULL,
    `pdfPath` VARCHAR(255) NULL,
    `montoTotalCliente` DECIMAL(10, 2) NOT NULL,

    INDEX `OrdenReparacion_autoId_idx`(`autoId`),
    INDEX `OrdenReparacion_fechaCreacion_idx`(`fechaCreacion`),
    INDEX `OrdenReparacion_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepuestoUsado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `precioCompra` DECIMAL(10, 2) NOT NULL,
    `precioVenta` DECIMAL(10, 2) NOT NULL,
    `unidadesConsumidas` INTEGER NOT NULL,

    INDEX `RepuestoUsado_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `RepuestoUsado_stockId_idx`(`stockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReparacionDeTercero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(250) NOT NULL,
    `precioCompra` DECIMAL(10, 2) NOT NULL,
    `precioVenta` DECIMAL(10, 2) NOT NULL,
    `proveedorId` INTEGER NOT NULL,

    INDEX `ReparacionDeTercero_nombre_idx`(`nombre`),
    INDEX `ReparacionDeTercero_proveedorId_idx`(`proveedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrabajoRealizado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NOT NULL,
    `manoDeObraId` INTEGER NOT NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,

    INDEX `TrabajoRealizado_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `TrabajoRealizado_manoDeObraId_idx`(`manoDeObraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlEnReparacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NOT NULL,
    `controlMecanicoId` INTEGER NOT NULL,
    `valor` VARCHAR(255) NOT NULL,

    INDEX `ControlEnReparacion_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `ControlEnReparacion_controlMecanicoId_idx`(`controlMecanicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PagoReparacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PagoReparacion_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `PagoReparacion_fechaPago_idx`(`fechaPago`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OrdenReparacionMecanicos` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OrdenReparacionMecanicos_AB_unique`(`A`, `B`),
    INDEX `_OrdenReparacionMecanicos_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OrdenReparacionReparacionTercero` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OrdenReparacionReparacionTercero_AB_unique`(`A`, `B`),
    INDEX `_OrdenReparacionReparacionTercero_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenReparacion` ADD CONSTRAINT `OrdenReparacion_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_manoDeObraId_fkey` FOREIGN KEY (`manoDeObraId`) REFERENCES `ManoDeObra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_controlMecanicoId_fkey` FOREIGN KEY (`controlMecanicoId`) REFERENCES `ControlMecanico`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagoReparacion` ADD CONSTRAINT `PagoReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrdenReparacionMecanicos` ADD CONSTRAINT `_OrdenReparacionMecanicos_A_fkey` FOREIGN KEY (`A`) REFERENCES `Mecanico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrdenReparacionMecanicos` ADD CONSTRAINT `_OrdenReparacionMecanicos_B_fkey` FOREIGN KEY (`B`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrdenReparacionReparacionTercero` ADD CONSTRAINT `_OrdenReparacionReparacionTercero_A_fkey` FOREIGN KEY (`A`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrdenReparacionReparacionTercero` ADD CONSTRAINT `_OrdenReparacionReparacionTercero_B_fkey` FOREIGN KEY (`B`) REFERENCES `ReparacionDeTercero`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
