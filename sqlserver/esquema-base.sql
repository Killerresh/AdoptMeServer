----------------------------------------------------
-- Creación de Tablas
----------------------------------------------------

-- Tabla Ubicacion
CREATE TABLE [dbo].[Ubicacion] (
    [UbicacionID] INT IDENTITY(1,1) NOT NULL,
    [Longitud] DECIMAL(9, 6) NOT NULL,
    [Latitud] DECIMAL(9, 6) NOT NULL,
    CONSTRAINT [PK_Ubicacion] PRIMARY KEY CLUSTERED ([UbicacionID] ASC)
);
GO

-- Tabla Usuario
CREATE TABLE [dbo].[Usuario] (
    [UsuarioID] INT IDENTITY(1,1) NOT NULL,
    [Nombre] VARCHAR(100) NOT NULL,
    [FechaRegistro] DATETIME NULL DEFAULT GETDATE(),
    [Telefono] VARCHAR(15) NULL,
    [Ciudad] VARCHAR(100) NULL,
    [UbicacionID] INT NULL,
    [AccesoID] INT NOT NULL,
    CONSTRAINT [PK_Usuario] PRIMARY KEY CLUSTERED ([UsuarioID] ASC)
);
GO

-- Tabla Acceso 
CREATE TABLE [dbo].[Acceso] (
	[AccesoID] INT IDENTITY(1,1) NOT NULL,
	[Correo] VARCHAR(100) NOT NULL,
	[ContrasenaHash] VARCHAR(255) NOT NULL,
	[EsAdmin] BIT NOT NULL DEFAULT 0,
	CONSTRAINT [PK_Acceso] PRIMARY KEY CLUSTERED ([AccesoID] ASC)
)

-- Tabla Mascota
CREATE TABLE [dbo].[Mascota] (
    [MascotaID] INT IDENTITY(1,1) NOT NULL,
    [Nombre] VARCHAR(45) NOT NULL,
    [Especie] VARCHAR(50) NOT NULL,
    [Raza] VARCHAR(100) NOT NULL,
    [Edad] TINYINT NOT NULL,
    [Sexo] VARCHAR(10) NOT NULL,
    [Tamaño] VARCHAR(10) NOT NULL,
    [Descripcion] VARCHAR(MAX) NULL,
    [PublicadorID] INT NOT NULL,
    [UbicacionID] INT NOT NULL,
    CONSTRAINT [PK_Mascota] PRIMARY KEY CLUSTERED ([MascotaID] ASC)
);
GO

-- Tabla Mensaje
CREATE TABLE [dbo].[Mensaje] (
    [MensajeID] INT IDENTITY(1,1) NOT NULL,
    [RemitenteID] INT NOT NULL,
    [ReceptorID] INT NOT NULL,
    [FechaEnvio] DATETIME NULL DEFAULT GETDATE(),
    [Contenido] VARCHAR(MAX) NOT NULL,
    [Leido] BIT NULL DEFAULT 0,
    CONSTRAINT [PK_Mensaje] PRIMARY KEY CLUSTERED ([MensajeID] ASC)
);
GO

-- Tabla Multimedia
CREATE TABLE [dbo].[Multimedia] (
    [FotoID] INT IDENTITY(1,1) NOT NULL,
    [MascotaID] INT NOT NULL,
    [UrlFoto] VARCHAR(255) NULL,
    [UrlVideo] VARCHAR(255) NULL,
    CONSTRAINT [PK_Multimedia] PRIMARY KEY CLUSTERED ([FotoID] ASC)
);
GO

-- Tabla SolicitudAdopcion
CREATE TABLE [dbo].[SolicitudAdopcion] (
    [SolicitudAdopcionID] INT IDENTITY(1,1) NOT NULL,
    [MascotaID] INT NOT NULL,
    [AdoptanteID] INT NOT NULL,
    [FechaSolicitud] DATETIME NULL DEFAULT GETDATE(),
    [Estado] VARCHAR(20) NULL,
    CONSTRAINT [PK_SolicitudAdopcion] PRIMARY KEY CLUSTERED ([SolicitudAdopcionID] ASC)
);
GO

----------------------------------------------------
-- Creación de Claves Foráneas (Foreign Keys - FKs)
----------------------------------------------------

-- FK para Usuario (AccesoID)
ALTER TABLE [dbo].[Usuario]
ADD CONSTRAINT [FK_Usuario_Acceso] FOREIGN KEY ([AccesoID])
REFERENCES [dbo].[Acceso] ([AccesoID]);
GO

-- FK para Usuario (UbicacionID)
ALTER TABLE [dbo].[Usuario]
ADD CONSTRAINT [FK_Usuario_Ubicacion] FOREIGN KEY ([UbicacionID])
REFERENCES [dbo].[Ubicacion] ([UbicacionID]);
GO

-- FKs para Mascota (PublicadorID, UbicacionID)
ALTER TABLE [dbo].[Mascota]
ADD CONSTRAINT [FK_Mascota_Usuario] FOREIGN KEY ([PublicadorID])
REFERENCES [dbo].[Usuario] ([UsuarioID]);
GO

ALTER TABLE [dbo].[Mascota]
ADD CONSTRAINT [FK_Mascota_Ubicacion] FOREIGN KEY ([UbicacionID])
REFERENCES [dbo].[Ubicacion] ([UbicacionID]);
GO

-- FKs para Mensaje (RemitenteID, ReceptorID)
ALTER TABLE [dbo].[Mensaje]
ADD CONSTRAINT [FK_Mensaje_Remitente] FOREIGN KEY ([RemitenteID])
REFERENCES [dbo].[Usuario] ([UsuarioID]);
GO

ALTER TABLE [dbo].[Mensaje]
ADD CONSTRAINT [FK_Mensaje_Receptor] FOREIGN KEY ([ReceptorID])
REFERENCES [dbo].[Usuario] ([UsuarioID]);
GO

-- FK para Multimedia (MascotaID)
ALTER TABLE [dbo].[Multimedia]
ADD CONSTRAINT [FK_Multimedia_Mascota] FOREIGN KEY ([MascotaID])
REFERENCES [dbo].[Mascota] ([MascotaID]);
GO

-- FKs para SolicitudAdopcion (MascotaID, AdoptanteID)
ALTER TABLE [dbo].[SolicitudAdopcion]
ADD CONSTRAINT [FK_SolicitudAdopcion_Mascota] FOREIGN KEY ([MascotaID])
REFERENCES [dbo].[Mascota] ([MascotaID]);
GO

ALTER TABLE [dbo].[SolicitudAdopcion]
ADD CONSTRAINT [FK_SolicitudAdopcion_Adoptante] FOREIGN KEY ([AdoptanteID])
REFERENCES [dbo].[Usuario] ([UsuarioID]);
GO

PRINT 'Esquema de la base de datos (tablas y claves) creado exitosamente.';