#!/bin/bash

# 🗓️ Fecha actual para el nombre del backup
DATE=$(date +"%Y-%m-%d_%H-%M")

# 🛡️ Credenciales de MySQL (ajustá según tu XAMPP)
DB_NAME="consultasmedicasonline"
DB_USER="root"
DB_PASS=""
DB_HOST="localhost"

# 📁 Carpetas de respaldo
BACKUP_DIR="./backups"
MEDIA_DIR="./profile_pictures"

# 🧰 Crear carpeta de respaldo si no existe
mkdir -p $BACKUP_DIR

# 🧾 Respaldar la base de datos
mysqldump -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 📦 Comprimir archivos media
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz $MEDIA_DIR

echo "✅ Backup completado: $BACKUP_DIR"
