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
    `activo` BOOLEAN NOT NULL DEFAULT true,

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
    `valves` VARCHAR(255) NULL,
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
    `ordenEnPdf` INTEGER NULL,
    `pdfName` VARCHAR(191) NULL,
    `parentId` INTEGER NULL,

    UNIQUE INDEX `ControlMecanico_name_key`(`name`),
    INDEX `ControlMecanico_name_idx`(`name`),
    INDEX `ControlMecanico_parentId_idx`(`parentId`),
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
    `detalle` TEXT NULL,

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
    `tipoOperacionId` INTEGER NULL,
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,
    `chequeId` INTEGER NULL,

    INDEX `Extraccion_usuarioId_idx`(`usuarioId`),
    INDEX `Extraccion_fecha_idx`(`fecha`),
    INDEX `Extraccion_dolarId_fkey`(`dolarId`),
    INDEX `Extraccion_chequeId_fkey`(`chequeId`),
    INDEX `Extraccion_tipoOperacionId_fkey`(`tipoOperacionId`),
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
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,
    `tipoOperacionId` INTEGER NULL,
    `chequeId` INTEGER NULL,

    INDEX `Gasto_categoriaId_idx`(`categoriaId`),
    INDEX `Gasto_mecanicoId_idx`(`mecanicoId`),
    INDEX `Gasto_proveedorId_idx`(`proveedorId`),
    INDEX `Gasto_fecha_idx`(`fecha`),
    INDEX `Gasto_dolarId_fkey`(`dolarId`),
    INDEX `Gasto_chequeId_fkey`(`chequeId`),
    INDEX `Gasto_tipoOperacionId_fkey`(`tipoOperacionId`),
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
    `informacionCliente` TEXT NULL,
    `dolarId` INTEGER NULL,
    `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionDescuento` VARCHAR(255) NULL,
    `incremento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionIncremento` VARCHAR(255) NULL,
    `porcentajeRecargo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `estado` ENUM('Presupuestado', 'Preparado', 'Entregado', 'Cerrado') NOT NULL DEFAULT 'Presupuestado',

    INDEX `Venta_clienteId_idx`(`clienteId`),
    INDEX `Venta_fecha_idx`(`fecha`),
    INDEX `Venta_dolarId_fkey`(`dolarId`),
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
    `observacionesOcultas` TEXT NULL,
    `detallesDeTrabajo` TEXT NULL,
    `estado` ENUM('Presupuestado', 'EnProgreso', 'Aceptado', 'Terminado', 'SeRetira') NOT NULL DEFAULT 'Presupuestado',
    `pdfPath` VARCHAR(255) NULL,
    `recibos` LONGTEXT NULL,
    `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `dolarId` INTEGER NULL,
    `detalleControles` TEXT NULL,
    `porcentajeRecargo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionDescuento` VARCHAR(255) NULL,
    `incrementoInterno` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `incremento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionIncremento` VARCHAR(255) NULL,
    `revisadoPorId` INTEGER NULL,

    INDEX `OrdenReparacion_autoId_idx`(`autoId`),
    INDEX `OrdenReparacion_fechaCreacion_idx`(`fechaCreacion`),
    INDEX `OrdenReparacion_estado_idx`(`estado`),
    INDEX `OrdenReparacion_dolarId_fkey`(`dolarId`),
    INDEX `OrdenReparacion_revisadoPorId_fkey`(`revisadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tempPath` VARCHAR(255) NOT NULL,
    `finalPath` VARCHAR(255) NULL,
    `status` ENUM('Pendiente', 'Listo', 'Error', 'Borrado') NOT NULL DEFAULT 'Pendiente',
    `promotedAt` DATETIME(3) NULL,
    `ordenReparacionId` INTEGER NULL,
    `reciboORepId` INTEGER NULL,
    `reparacionDeTerceroId` INTEGER NULL,

    UNIQUE INDEX `CustomFile_ordenReparacionId_key`(`ordenReparacionId`),
    UNIQUE INDEX `CustomFile_reparacionDeTerceroId_key`(`reparacionDeTerceroId`),
    INDEX `CustomFile_status_idx`(`status`),
    INDEX `CustomFile_reciboORepId_fkey`(`reciboORepId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autoId` INTEGER NULL,
    `informacionAuto` TEXT NULL,
    `informacionCliente` TEXT NULL,
    `administrativoId` INTEGER NULL,
    `creadorId` INTEGER NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaEnvio` DATETIME(3) NULL,
    `fechaRespuesta` DATETIME(3) NULL,
    `observacionesCliente` TEXT NOT NULL,
    `detallesDeTrabajo` TEXT NULL,
    `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionDescuento` VARCHAR(255) NULL,
    `dolarId` INTEGER NULL,
    `porcentajeRecargo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `incrementoInterno` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `incremento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionIncremento` VARCHAR(255) NULL,
    `estado` ENUM('EnPreparacion', 'Terminado', 'Enviado', 'ADefinir', 'Aceptado', 'Rechazado', 'Descartado') NOT NULL DEFAULT 'EnPreparacion',

    INDEX `Presupuesto_autoId_idx`(`autoId`),
    INDEX `Presupuesto_fecha_idx`(`fecha`),
    INDEX `Presupuesto_estado_idx`(`estado`),
    INDEX `Presupuesto_dolarId_fkey`(`dolarId`),
    INDEX `Presupuesto_administrativoId_fkey`(`administrativoId`),
    INDEX `Presupuesto_creadorId_fkey`(`creadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepuestoUsado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NULL,
    `ventaId` INTEGER NULL,
    `presupuestoId` INTEGER NULL,
    `stockId` INTEGER NOT NULL,
    `precioCompra` DECIMAL(10, 2) NOT NULL,
    `precioVenta` DECIMAL(10, 2) NOT NULL,
    `unidadesConsumidas` INTEGER NOT NULL,
    `plantillaPresupuestoId` INTEGER NULL,

    INDEX `RepuestoUsado_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `RepuestoUsado_ventaId_fkey`(`ventaId`),
    INDEX `RepuestoUsado_stockId_idx`(`stockId`),
    INDEX `RepuestoUsado_plantillaPresupuestoId_fkey`(`plantillaPresupuestoId`),
    INDEX `RepuestoUsado_presupuestoId_fkey`(`presupuestoId`),
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
    `ventaId` INTEGER NULL,
    `presupuestoId` INTEGER NULL,
    `plantillaPresupuestoId` INTEGER NULL,
    `recibo` VARCHAR(255) NULL,

    INDEX `ReparacionDeTercero_nombre_idx`(`nombre`),
    INDEX `ReparacionDeTercero_proveedorId_idx`(`proveedorId`),
    INDEX `ReparacionDeTercero_ordenReparacionId_fkey`(`ordenReparacionId`),
    INDEX `ReparacionDeTercero_ventaId_fkey`(`ventaId`),
    INDEX `ReparacionDeTercero_plantillaPresupuestoId_fkey`(`plantillaPresupuestoId`),
    INDEX `ReparacionDeTercero_presupuestoId_fkey`(`presupuestoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrabajoRealizado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NULL,
    `ventaId` INTEGER NULL,
    `presupuestoId` INTEGER NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `diasParaRecordatorio` INTEGER NULL,
    `plantillaPresupuestoId` INTEGER NULL,

    INDEX `TrabajoRealizado_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `TrabajoRealizado_ventaId_fkey`(`ventaId`),
    INDEX `TrabajoRealizado_plantillaPresupuestoId_fkey`(`plantillaPresupuestoId`),
    INDEX `TrabajoRealizado_presupuestoId_fkey`(`presupuestoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlantillaPresupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,

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
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,
    `tipoOperacionId` INTEGER NULL,
    `chequeId` INTEGER NULL,

    INDEX `IngresoPorReparacion_fecha_idx`(`fecha`),
    INDEX `IngresoPorReparacion_clienteId_idx`(`clienteId`),
    INDEX `IngresoPorReparacion_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `IngresoPorReparacion_dolarId_fkey`(`dolarId`),
    INDEX `IngresoPorReparacion_chequeId_fkey`(`chequeId`),
    INDEX `IngresoPorReparacion_tipoOperacionId_fkey`(`tipoOperacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IngresoPorVenta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` INTEGER NULL,
    `informacionCliente` TEXT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `ventaId` INTEGER NOT NULL,
    `reciboEnviado` BOOLEAN NOT NULL DEFAULT false,
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,
    `tipoOperacionId` INTEGER NULL,
    `chequeId` INTEGER NULL,

    INDEX `IngresoPorVenta_fecha_idx`(`fecha`),
    INDEX `IngresoPorVenta_clienteId_idx`(`clienteId`),
    INDEX `IngresoPorVenta_ventaId_idx`(`ventaId`),
    INDEX `IngresoPorVenta_dolarId_fkey`(`dolarId`),
    INDEX `IngresoPorVenta_chequeId_fkey`(`chequeId`),
    INDEX `IngresoPorVenta_tipoOperacionId_fkey`(`tipoOperacionId`),
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
    `tipo` ENUM('REPOSICION_STOCK', 'REPARACION_TERMINADA', 'CHEQUE_POR_VENCER', 'TURNOS_DEL_DIA', 'RECORDATORIOS_MANO_DE_OBRA', 'CHEQUE_RECHAZADO', 'EVENTO_AGENDA') NOT NULL,
    `stockId` INTEGER NULL,
    `ordenReparacionId` INTEGER NULL,
    `userId` INTEGER NULL,

    INDEX `NotificacionInterna_fecha_idx`(`fecha`),
    INDEX `NotificacionInterna_leida_idx`(`leida`),
    INDEX `NotificacionInterna_tipo_idx`(`tipo`),
    INDEX `NotificacionInterna_stockId_idx`(`stockId`),
    INDEX `NotificacionInterna_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `NotificacionInterna_userId_idx`(`userId`),
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
CREATE TABLE `IngresoManualDeDinero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `descripcion` TEXT NULL,
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,
    `tipoOperacionId` INTEGER NULL,
    `usuarioId` INTEGER NOT NULL,
    `chequeId` INTEGER NULL,

    INDEX `IngresoManualDeDinero_usuarioId_idx`(`usuarioId`),
    INDEX `IngresoManualDeDinero_dolarId_fkey`(`dolarId`),
    INDEX `IngresoManualDeDinero_chequeId_fkey`(`chequeId`),
    INDEX `IngresoManualDeDinero_tipoOperacionId_fkey`(`tipoOperacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cheque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(255) NOT NULL,
    `fechaEmision` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaCobro` DATETIME(3) NOT NULL,
    `banco` VARCHAR(255) NOT NULL,
    `importe` DECIMAL(10, 2) NOT NULL,
    `owner` VARCHAR(255) NOT NULL,
    `picturePath` VARCHAR(255) NOT NULL,
    `rechazado` BOOLEAN NOT NULL DEFAULT false,
    `fechaRechazo` DATETIME(3) NULL,
    `gastosAdministrativos` DECIMAL(10, 2) NULL,
    `observaciones` TEXT NULL,

    UNIQUE INDEX `Cheque_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoDeOperacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(100) NOT NULL,
    `esIngreso` BOOLEAN NOT NULL DEFAULT true,
    `esGasto` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `TipoDeOperacion_label_key`(`label`),
    INDEX `TipoDeOperacion_label_idx`(`label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feriado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,

    INDEX `Feriado_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turno` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hora` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `problema` TEXT NOT NULL,
    `autoId` INTEGER NOT NULL,

    INDEX `Turno_fecha_idx`(`fecha`),
    INDEX `Turno_autoId_idx`(`autoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecordatorioAgenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hecho` BOOLEAN NOT NULL DEFAULT false,

    INDEX `RecordatorioAgenda_fecha_idx`(`fecha`),
    INDEX `RecordatorioAgenda_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TareaAdministrativa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` TEXT NOT NULL,
    `presupuestoId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    INDEX `TareaAdministrativa_presupuestoId_idx`(`presupuestoId`),
    INDEX `TareaAdministrativa_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TareaDiaria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` TEXT NOT NULL,
    `realizado` BOOLEAN NOT NULL DEFAULT false,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NULL,

    INDEX `TareaDiaria_fecha_idx`(`fecha`),
    INDEX `TareaDiaria_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Perdidas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,

    INDEX `Perdidas_dolarId_fkey`(`dolarId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recuperacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `monto` DECIMAL(10, 2) NOT NULL,
    `perdidaId` INTEGER NOT NULL,
    `detalle` VARCHAR(255) NULL,

    INDEX `Recuperacion_perdidaId_fkey`(`perdidaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermisoToRol` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermisoToRol_AB_unique`(`A`, `B`),
    INDEX `_PermisoToRol_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CategoriaGastoToRol` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CategoriaGastoToRol_AB_unique`(`A`, `B`),
    INDEX `_CategoriaGastoToRol_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Auto` ADD CONSTRAINT `Auto_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlMecanico` ADD CONSTRAINT `ControlMecanico_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ControlMecanico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `CategoriaGasto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenReparacion` ADD CONSTRAINT `OrdenReparacion_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenReparacion` ADD CONSTRAINT `OrdenReparacion_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenReparacion` ADD CONSTRAINT `OrdenReparacion_revisadoPorId_fkey` FOREIGN KEY (`revisadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_reciboORepId_fkey` FOREIGN KEY (`reciboORepId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_reparacionDeTerceroId_fkey` FOREIGN KEY (`reparacionDeTerceroId`) REFERENCES `ReparacionDeTercero`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_administrativoId_fkey` FOREIGN KEY (`administrativoId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_creadorId_fkey` FOREIGN KEY (`creadorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_controlMecanicoId_fkey` FOREIGN KEY (`controlMecanicoId`) REFERENCES `ControlMecanico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagoAMecanico` ADD CONSTRAINT `PagoAMecanico_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversacionWhatsApp` ADD CONSTRAINT `ConversacionWhatsApp_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MensajeWhatsApp` ADD CONSTRAINT `MensajeWhatsApp_conversacionId_fkey` FOREIGN KEY (`conversacionId`) REFERENCES `ConversacionWhatsApp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Turno` ADD CONSTRAINT `Turno_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecordatorioAgenda` ADD CONSTRAINT `RecordatorioAgenda_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaAdministrativa` ADD CONSTRAINT `TareaAdministrativa_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaAdministrativa` ADD CONSTRAINT `TareaAdministrativa_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaDiaria` ADD CONSTRAINT `TareaDiaria_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Perdidas` ADD CONSTRAINT `Perdidas_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recuperacion` ADD CONSTRAINT `Recuperacion_perdidaId_fkey` FOREIGN KEY (`perdidaId`) REFERENCES `Perdidas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToRol` ADD CONSTRAINT `_PermisoToRol_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permiso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToRol` ADD CONSTRAINT `_PermisoToRol_B_fkey` FOREIGN KEY (`B`) REFERENCES `Rol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaGastoToRol` ADD CONSTRAINT `_CategoriaGastoToRol_A_fkey` FOREIGN KEY (`A`) REFERENCES `CategoriaGasto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaGastoToRol` ADD CONSTRAINT `_CategoriaGastoToRol_B_fkey` FOREIGN KEY (`B`) REFERENCES `Rol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

