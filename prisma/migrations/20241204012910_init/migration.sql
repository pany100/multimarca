-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(150) NOT NULL,
    `username` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(300) NOT NULL,
    `reset_password_token` VARCHAR(255) NULL,
    `reset_password_token_expired` DATETIME(3) NULL,
    `rolId` INTEGER NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_fullName_idx`(`fullName`),
    INDEX `Usuario_username_idx`(`username`),
    INDEX `Usuario_rolId_fkey`(`rolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permiso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Permiso_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `Rol_name_key`(`name`),
    INDEX `Rol_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NULL,
    `fullName` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NULL,
    `birthday` DATETIME(3) NULL,
    `address` VARCHAR(200) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `postal_code` VARCHAR(10) NULL,
    `tax_status` VARCHAR(50) NULL,
    `dni` VARCHAR(20) NULL,
    `can_receive_notifications` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Cliente_dni_key`(`dni`),
    INDEX `Cliente_fullName_idx`(`fullName`),
    INDEX `Cliente_email_idx`(`email`),
    INDEX `Cliente_dni_idx`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Auto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patent` VARCHAR(150) NOT NULL,
    `model` VARCHAR(150) NULL,
    `brand` VARCHAR(150) NULL,
    `color` VARCHAR(50) NULL,
    `year` INTEGER NULL,
    `kms` INTEGER NULL,
    `valves` INTEGER NULL,
    `ownerId` INTEGER NOT NULL,
    `chassis_number` VARCHAR(150) NULL,
    `engine_number` VARCHAR(150) NULL,
    `observations` VARCHAR(255) NULL,
    `transmission_type` VARCHAR(20) NULL,
    `cedulaVerdePath` VARCHAR(1000) NULL,

    UNIQUE INDEX `Auto_patent_key`(`patent`),
    INDEX `Auto_patent_idx`(`patent`),
    INDEX `Auto_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlMecanico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `type` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `ControlMecanico_name_key`(`name`),
    INDEX `ControlMecanico_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ManoDeObra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(250) NOT NULL,
    `sellPrice` DECIMAL(10, 2) NULL,

    UNIQUE INDEX `ManoDeObra_name_key`(`name`),
    INDEX `ManoDeObra_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `address` VARCHAR(150) NULL,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(150) NULL,
    `mobile` VARCHAR(150) NULL,
    `iva` VARCHAR(150) NULL,
    `cuit` VARCHAR(150) NULL,
    `numeroProveedor` INTEGER NOT NULL,

    UNIQUE INDEX `Proveedor_name_key`(`name`),
    INDEX `Proveedor_name_idx`(`name`),
    INDEX `Proveedor_cuit_idx`(`cuit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empleado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `start_date` DATETIME(3) NULL,
    `dni` VARCHAR(191) NULL,
    `address` VARCHAR(150) NULL,
    `city` VARCHAR(150) NULL,
    `state` VARCHAR(150) NULL,
    `postal_code` VARCHAR(10) NULL,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(150) NULL,
    `birthday` DATETIME(3) NULL,
    `tipo` ENUM('Mecanico', 'Administrativo') NOT NULL DEFAULT 'Mecanico',
    `dniImagePath` VARCHAR(1000) NULL,

    UNIQUE INDEX `Empleado_name_key`(`name`),
    INDEX `Empleado_name_idx`(`name`),
    INDEX `Empleado_dni_idx`(`dni`),
    INDEX `Mecanico_dni_idx`(`dni`),
    INDEX `Mecanico_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenReparacionMecanico` (
    `ordenReparacionId` INTEGER NOT NULL,
    `mecanicoId` INTEGER NOT NULL,

    INDEX `OrdenReparacionMecanico_mecanicoId_fkey`(`mecanicoId`),
    PRIMARY KEY (`ordenReparacionId`, `mecanicoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(250) NOT NULL,
    `brand` VARCHAR(250) NOT NULL,
    `buyPrice` DECIMAL(10, 2) NOT NULL,
    `units` INTEGER NULL,
    `restockValue` INTEGER NULL,
    `markup` DOUBLE NULL,
    `proveedorId` INTEGER NOT NULL,
    `label` VARCHAR(250) NULL,

    INDEX `Stock_name_idx`(`name`),
    INDEX `Stock_brand_idx`(`brand`),
    INDEX `Stock_proveedorId_idx`(`proveedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenDeCompra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `precioTotal` DECIMAL(10, 2) NOT NULL,
    `proveedorId` INTEGER NOT NULL,

    INDEX `OrdenDeCompra_proveedorId_idx`(`proveedorId`),
    INDEX `OrdenDeCompra_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenDeCompraItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cantidad` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `ordenDeCompraId` INTEGER NOT NULL,

    INDEX `OrdenDeCompraItem_stockId_idx`(`stockId`),
    INDEX `OrdenDeCompraItem_ordenDeCompraId_idx`(`ordenDeCompraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Extraccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `motivo` VARCHAR(150) NOT NULL,
    `tipoExtraccion` ENUM('EFECTIVO', 'TRANSFERENCIA') NOT NULL,

    INDEX `Extraccion_usuarioId_idx`(`usuarioId`),
    INDEX `Extraccion_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `mecanicoId` INTEGER NULL,
    `detalle` TEXT NULL,
    `proveedorId` INTEGER NULL,

    INDEX `Gasto_categoriaId_idx`(`categoriaId`),
    INDEX `Gasto_mecanicoId_idx`(`mecanicoId`),
    INDEX `Gasto_proveedorId_idx`(`proveedorId`),
    INDEX `Gasto_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaGasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `CategoriaGasto_nombre_key`(`nombre`),
    INDEX `CategoriaGasto_nombre_idx`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` INTEGER NULL,
    `total` DECIMAL(10, 2) NOT NULL,

    INDEX `Venta_clienteId_idx`(`clienteId`),
    INDEX `Venta_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VentaItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ventaId` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,

    INDEX `VentaItem_ventaId_idx`(`ventaId`),
    INDEX `VentaItem_stockId_idx`(`stockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacionWhatsapp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(250) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `whatsappKey` VARCHAR(250) NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `informacion` TEXT NULL,

    INDEX `NotificacionWhatsapp_date_idx`(`date`),
    INDEX `NotificacionWhatsapp_processed_idx`(`processed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenReparacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autoId` INTEGER NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaEntradaReparacion` DATETIME(3) NULL,
    `fechaSalidaReparacion` DATETIME(3) NULL,
    `kilometros` INTEGER NULL,
    `observacionesCliente` TEXT NOT NULL,
    `observacionesEntrada` TEXT NOT NULL,
    `observacionesSalida` TEXT NOT NULL,
    `estado` ENUM('Presupuestado', 'EnProgreso', 'Aceptado', 'Terminado') NOT NULL DEFAULT 'Presupuestado',
    `pdfPath` VARCHAR(255) NULL,
    `manoDeObra` DECIMAL(10, 2) NOT NULL,

    INDEX `OrdenReparacion_autoId_idx`(`autoId`),
    INDEX `OrdenReparacion_fechaCreacion_idx`(`fechaCreacion`),
    INDEX `OrdenReparacion_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepuestoUsado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NULL,
    `stockId` INTEGER NOT NULL,
    `precioCompra` DECIMAL(10, 2) NOT NULL,
    `precioVenta` DECIMAL(10, 2) NOT NULL,
    `unidadesConsumidas` INTEGER NOT NULL,
    `plantillaPresupuestoId` INTEGER NULL,

    INDEX `RepuestoUsado_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `RepuestoUsado_stockId_idx`(`stockId`),
    INDEX `RepuestoUsado_plantillaPresupuestoId_fkey`(`plantillaPresupuestoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReparacionDeTercero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(250) NOT NULL,
    `precioCompra` DECIMAL(10, 2) NOT NULL,
    `precioVenta` DECIMAL(10, 2) NOT NULL,
    `proveedorId` INTEGER NOT NULL,
    `ordenReparacionId` INTEGER NULL,
    `plantillaPresupuestoId` INTEGER NULL,

    INDEX `ReparacionDeTercero_nombre_idx`(`nombre`),
    INDEX `ReparacionDeTercero_proveedorId_idx`(`proveedorId`),
    INDEX `ReparacionDeTercero_ordenReparacionId_fkey`(`ordenReparacionId`),
    INDEX `ReparacionDeTercero_plantillaPresupuestoId_fkey`(`plantillaPresupuestoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrabajoRealizado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `diasParaRecordatorio` INTEGER NULL,
    `plantillaPresupuestoId` INTEGER NULL,

    INDEX `TrabajoRealizado_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `TrabajoRealizado_plantillaPresupuestoId_fkey`(`plantillaPresupuestoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlantillaPresupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `manoDeObra` DECIMAL(10, 2) NOT NULL,

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
CREATE TABLE `PagoAMecanico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NULL,
    `fechaPago` DATETIME(3) NULL,

    INDEX `PagoAMecanico_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `PagoAMecanico_fechaPago_idx`(`fechaPago`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IngresoPorReparacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `ordenReparacionId` INTEGER NOT NULL,
    `reciboEnviado` BOOLEAN NOT NULL DEFAULT false,

    INDEX `IngresoPorReparacion_fecha_idx`(`fecha`),
    INDEX `IngresoPorReparacion_clienteId_idx`(`clienteId`),
    INDEX `IngresoPorReparacion_ordenReparacionId_idx`(`ordenReparacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dolar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oficial` DECIMAL(10, 2) NOT NULL,
    `blue` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `Dolar_fecha_key`(`fecha`),
    INDEX `Dolar_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacionInterna` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `titulo` VARCHAR(255) NOT NULL,
    `texto` TEXT NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `tipo` ENUM('REPOSICION_STOCK', 'REPARACION_TERMINADA') NOT NULL,
    `stockId` INTEGER NULL,
    `ordenReparacionId` INTEGER NULL,

    INDEX `NotificacionInterna_fecha_idx`(`fecha`),
    INDEX `NotificacionInterna_leida_idx`(`leida`),
    INDEX `NotificacionInterna_tipo_idx`(`tipo`),
    INDEX `NotificacionInterna_stockId_idx`(`stockId`),
    INDEX `NotificacionInterna_ordenReparacionId_idx`(`ordenReparacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversacionWhatsApp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `iniciada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimoMensaje` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('Activa', 'Cerrada') NOT NULL DEFAULT 'Activa',

    INDEX `ConversacionWhatsApp_clienteId_idx`(`clienteId`),
    INDEX `ConversacionWhatsApp_iniciada_idx`(`iniciada`),
    INDEX `ConversacionWhatsApp_ultimoMensaje_idx`(`ultimoMensaje`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MensajeWhatsApp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` VARCHAR(50) NOT NULL,
    `body` TEXT NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `conversacionId` INTEGER NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `to` VARCHAR(50) NOT NULL,

    INDEX `MensajeWhatsApp_from_idx`(`from`),
    INDEX `MensajeWhatsApp_timestamp_idx`(`timestamp`),
    INDEX `MensajeWhatsApp_conversacionId_idx`(`conversacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermisoToRol` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermisoToRol_AB_unique`(`A`, `B`),
    INDEX `_PermisoToRol_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Auto` ADD CONSTRAINT `Auto_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenReparacionMecanico` ADD CONSTRAINT `OrdenReparacionMecanico_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenReparacionMecanico` ADD CONSTRAINT `OrdenReparacionMecanico_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenDeCompra` ADD CONSTRAINT `OrdenDeCompra_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenDeCompraItem` ADD CONSTRAINT `OrdenDeCompraItem_ordenDeCompraId_fkey` FOREIGN KEY (`ordenDeCompraId`) REFERENCES `OrdenDeCompra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenDeCompraItem` ADD CONSTRAINT `OrdenDeCompraItem_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `CategoriaGasto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenReparacion` ADD CONSTRAINT `OrdenReparacion_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_controlMecanicoId_fkey` FOREIGN KEY (`controlMecanicoId`) REFERENCES `ControlMecanico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagoAMecanico` ADD CONSTRAINT `PagoAMecanico_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversacionWhatsApp` ADD CONSTRAINT `ConversacionWhatsApp_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MensajeWhatsApp` ADD CONSTRAINT `MensajeWhatsApp_conversacionId_fkey` FOREIGN KEY (`conversacionId`) REFERENCES `ConversacionWhatsApp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToRol` ADD CONSTRAINT `_PermisoToRol_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permiso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToRol` ADD CONSTRAINT `_PermisoToRol_B_fkey` FOREIGN KEY (`B`) REFERENCES `Rol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

