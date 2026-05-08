# Guía de Migración de WSL y Docker a Disco Secundario

Este documento detalla el procedimiento seguro para mover tu entorno de desarrollo (Ubuntu/WSL y contenedores de Docker) desde el disco principal (habitualmente `C:`) a un disco secundario (por ejemplo, `D:`), garantizando cero pérdida de datos, especialmente de la base de datos PostgreSQL.

## Fase 1: Copias de Seguridad (Paracaídas)

Antes de tocar la infraestructura, aseguramos los datos críticos.

### 1. Backup Lógico de PostgreSQL (Volcado de SQL)
Con el contenedor de la base de datos encendido, ejecutaremos un volcado completo (`pg_dump`). Esto crea un archivo con todos tus artículos y vectores.
```bash
# Desde la raíz de tu proyecto
docker exec -it <nombre_contenedor_db> pg_dump -U postgres -d postgres > db_backup_completo.sql
```
*(Guarda este archivo `db_backup_completo.sql` en tu disco Windows de forma segura).*

### 2. Backup Físico del Volumen (Opcional pero recomendado)
Por doble seguridad, podemos comprimir la carpeta física temporalmente.
```bash
# Apagar contenedores para que no haya escrituras
docker compose down

# Copiar la carpeta física del volumen en caso de que esté mapeada a WSL localmente
# (Omitir si dependemos exclusivamente del .sql)
```

---

## Fase 2: Apagar todos los servicios

Asegúrate de que no hay ningún proceso corriendo que pueda corromper la exportación.
1. Detener Docker Desktop en Windows (clic derecho en el icono de la ballena cerca del reloj -> *Quit Docker Desktop*).
2. Apagar la máquina virtual de WSL completamente. Abre una terminal de Powershell (en Windows) y ejecuta:
```powershell
wsl --shutdown
```

---

## Fase 3: Exportar WSL y Docker

WSL suele tener varias distribuciones (tu Ubuntu, y dos de soporte de Docker llamadas `docker-desktop` y `docker-desktop-data`).
En la misma consola de Powershell, verifica cuáles tienes:
```powershell
wsl --list -v
```

Exporta cada una de ellas a un archivo `.tar` en tu disco secundario (supongamos que es el disco `D:`):
```powershell
wsl --export Ubuntu D:\UbuntuBackup.tar
wsl --export docker-desktop D:\DockerDesktopBackup.tar
wsl --export docker-desktop-data D:\DockerDesktopDataBackup.tar
```
*Gana paciencia, este paso puede tardar varios minutos dependiendo del tamaño de los archivos y la velocidad de los discos.*

---

## Fase 4: Desregistrar (Borrar de C:)

Una vez garantizado que tienes los archivos `.tar` en el disco secundario (puedes comprobar que pesan varios GBs), toca liberar el espacio de `C:`.
```powershell
wsl --unregister Ubuntu
wsl --unregister docker-desktop
wsl --unregister docker-desktop-data
```
*(En este exacto momento, has recuperado todo el espacio en C:)*

---

## Fase 5: Importar al Nuevo Disco

Creamos las carpetas de destino en el disco secundario:
```powershell
mkdir D:\WSL\Ubuntu
mkdir D:\WSL\docker-desktop
mkdir D:\WSL\docker-desktop-data
```

Importamos los archivos `.tar` hacia esas nuevas ubicaciones:
```powershell
wsl --import Ubuntu D:\WSL\Ubuntu D:\UbuntuBackup.tar
wsl --import docker-desktop D:\WSL\docker-desktop D:\DockerDesktopBackup.tar
wsl --import docker-desktop-data D:\WSL\docker-desktop-data D:\DockerDesktopDataBackup.tar
```

---

## Fase 6: Comprobación y Limpieza

1. Inicia tu WSL normal (`wsl -d Ubuntu` o abriendo tu terminal de Ubuntu). *Nota: puede que te loguee como root temporalmente, puedes configurarlo de vuelta escribiendo `ubuntu config --default-user alevi`*.
2. Inicia Docker Desktop; reconocerá automáticamente las distribuciones que acabas de importar.
3. Levanta el proyecto:
```bash
cd /home/alevi/proyecto
docker compose up -d
```
4. Todo debería estar exactamente como lo dejaste, con todos tus artículos y vectores intactos.
5. Puedes **borrar** los archivos `.tar` de respaldo que dejaste en `D:\` y tu `db_backup_completo.sql` cuando compruebes que el sistema funciona.