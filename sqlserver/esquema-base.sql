----------------------------------------------------
-- Creación de Tablas
----------------------------------------------------

-- Tabla Ubicacion
CREATE TABLE [dbo].[Ubicacion] (
    [UbicacionID] INT IDENTITY(1,1) NOT NULL,
    [Longitud] DECIMAL(19, 13) NULL,
    [Latitud] DECIMAL(19, 13) NULL,
    [Ciudad] VARCHAR(100) NULL,
    [Estado] VARCHAR(100) NULL,
    [Pais] VARCHAR(100) NULL,
    CONSTRAINT [PK_Ubicacion] PRIMARY KEY CLUSTERED ([UbicacionID] ASC)
);
GO

-- Tabla Usuario
CREATE TABLE [dbo].[Usuario] (
    [UsuarioID] INT IDENTITY(1,1) NOT NULL,
    [Nombre] VARCHAR(100) NOT NULL,
    [FechaRegistro] DATETIME NULL DEFAULT GETDATE(),
    [Telefono] VARCHAR(15) NULL,
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
    [Edad] VARCHAR(100) NOT NULL,
    [Sexo] VARCHAR(10) NOT NULL,
    [Tamaño] VARCHAR(10) NOT NULL,
    [Descripcion] VARCHAR(MAX) NULL,
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
    CONSTRAINT [PK_Mensaje] PRIMARY KEY CLUSTERED ([MensajeID] ASC)
);
GO

-- Tabla SolicitudAdopcion
CREATE TABLE [dbo].[SolicitudAdopcion] (
    [SolicitudAdopcionID] INT IDENTITY(1,1) NOT NULL,
    [FechaSolicitud] DATETIME NULL DEFAULT GETDATE(),
    [Estado] BIT NOT NULL DEFAULT 0,
    [MascotaID] INT NOT NULL,
    [AdoptanteID] INT NULL,
    [PublicadorID] INT NOT NULL,
    [UbicacionID] INT NOT NULL,
    CONSTRAINT [PK_SolicitudAdopcion] PRIMARY KEY CLUSTERED ([SolicitudAdopcionID] ASC)
);
GO

-- Tabla FotoUsuario
CREATE TABLE [dbo].[FotoUsuario] (
    [FotoUsuarioID] INT IDENTITY(1,1) NOT NULL,
    [UsuarioID] INT NOT NULL UNIQUE,
    [UrlFoto] VARCHAR(255) NOT NULL,
    CONSTRAINT [PK_FotoUsuario] PRIMARY KEY CLUSTERED ([FotoUsuarioID] ASC)
);
GO

-- Tabla FotoMascota
CREATE TABLE [dbo].[FotoMascota] (
    [FotoID] INT IDENTITY(1,1) NOT NULL,
    [MascotaID] INT NOT NULL,
    [UrlFoto] VARCHAR(255) NOT NULL,
    CONSTRAINT [PK_FotoMascota] PRIMARY KEY CLUSTERED ([FotoID] ASC)
);
GO

-- Tabla VideoMascota
CREATE TABLE [dbo].[VideoMascota] (
    [VideoID] INT IDENTITY(1,1) NOT NULL,
    [MascotaID] INT NOT NULL,
    [UrlVideo] VARCHAR(255) NOT NULL,
    CONSTRAINT [PK_VideoMascota] PRIMARY KEY CLUSTERED ([VideoID] ASC)
);
GO

-- Tabla Notificacion
CREATE TABLE [dbo].[Notificacion] (
    [NotificacionID] INT IDENTITY(1,1) NOT NULL,
    [UsuarioID] INT NOT NULL,
    [Tipo] VARCHAR(50) NOT NULL,
    [Contenido] VARCHAR(MAX) NOT NULL,
    [FechaCreacion] DATETIME NOT NULL DEFAULT GETDATE(),
    [Leida] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_Notificacion] PRIMARY KEY CLUSTERED ([NotificacionID] ASC)
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
ON DELETE SET NULL
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

-- FKs para SolicitudAdopcion (MascotaID, AdoptanteID)
ALTER TABLE [dbo].[SolicitudAdopcion]
ADD CONSTRAINT [FK_SolicitudAdopcion_Mascota] FOREIGN KEY ([MascotaID])
REFERENCES [dbo].[Mascota] ([MascotaID]);
GO

ALTER TABLE [dbo].[SolicitudAdopcion]
ADD CONSTRAINT [FK_SolicitudAdopcion_Adoptante] FOREIGN KEY ([AdoptanteID])
REFERENCES [dbo].[Usuario] ([UsuarioID]);
GO

ALTER TABLE [dbo].[SolicitudAdopcion]
ADD CONSTRAINT [FK_SolicitudAdopcion_Publicador] FOREIGN KEY ([PublicadorID])
REFERENCES [dbo].[Usuario] ([UsuarioID]);
GO

ALTER TABLE [dbo].[SolicitudAdopcion]
ADD CONSTRAINT [FK_SolicitudAdopcion_Ubicacion] FOREIGN KEY ([UbicacionID])
REFERENCES [dbo].[Ubicacion] ([UbicacionID]);
GO

-- FK para FotoUsuario
ALTER TABLE [dbo].[FotoUsuario]
ADD CONSTRAINT [FK_FotoUsuario_Usuario] FOREIGN KEY ([UsuarioID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
ON DELETE CASCADE;
GO

-- FK para FotoMascota
ALTER TABLE [dbo].[FotoMascota]
ADD CONSTRAINT [FK_FotoMascota_Mascota] FOREIGN KEY ([MascotaID])
REFERENCES [dbo].[Mascota] ([MascotaID])
ON DELETE CASCADE;
GO

-- FK para VideoMascota
ALTER TABLE [dbo].[VideoMascota]
ADD CONSTRAINT [FK_VideoMascota_Mascota] FOREIGN KEY ([MascotaID])
REFERENCES [dbo].[Mascota] ([MascotaID])
ON DELETE CASCADE;
GO

-- FK para Notificacion (UsuarioID)
ALTER TABLE [dbo].[Notificacion]
ADD CONSTRAINT [FK_Notificacion_Usuario] FOREIGN KEY ([UsuarioID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
ON DELETE CASCADE;
GO

PRINT 'Esquema de la base de datos (tablas y claves) creado exitosamente.';