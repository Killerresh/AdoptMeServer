#!/bin/bash

set -euo pipefail

echo "Iniciando SQL Server en segundo plano para inicialización..."

/opt/mssql/bin/sqlservr &

until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1;" &> /dev/null;
do
    echo "Aún no está listo SQL Server o el SA_PASSWORD no es válido. Reintentando en 5 segundos..."
    sleep 10
done

echo "SQL Server está listo. Iniciando configuración de base de datos..."

# Crear base de datos solo si no existe
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'$DB_NAME')
    CREATE DATABASE [$DB_NAME];"
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -d "$DB_NAME" -i /tmp/esquema-base.sql

/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'$DB_PRUEBA_NAME')
    CREATE DATABASE [$DB_PRUEBA_NAME];"
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -d "$DB_PRUEBA_NAME" -i /tmp/esquema-base.sql

# Crear LOGIN solo si no existe (a nivel de servidor)
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'$DB_USER')
    CREATE LOGIN [$DB_USER] WITH PASSWORD = N'$DB_PASSWORD';"

# Crear USER en $DB_NAME solo si no existe
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -d "$DB_NAME" -Q "
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'$DB_USER')
BEGIN
    CREATE USER [$DB_USER] FOR LOGIN [$DB_USER];
    EXEC sp_addrolemember 'db_owner', '$DB_USER';
END;"

# Crear USER en $DB_PRUEBA_NAME solo si no existe
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -d $DB_PRUEBA_NAME -Q "
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'$DB_USER')
BEGIN
    CREATE USER [$DB_USER] FOR LOGIN [$DB_USER];
    EXEC sp_addrolemember 'db_owner', '$DB_USER';
END;"

echo "Inicialización completada. Manteniendo SQL Server en primer plano..."

touch /var/opt/mssql/data/setup.done

/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "PRINT 'Inicialización completada';"

wait