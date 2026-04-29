# Proyecto 2 
Kimberly Alejandra Miranda Macario, 202203805

## Descripción del Proyecto

Este proyecto es la evolución de un sistema de gestión para los Centros de Evaluación de Manejo de Guatemala. Transforma una base de datos estática en un ecosistema dinámico y portable utilizando Docker y una API REST.

La solución dockeriza una base de datos Oracle XE (con el esquema DDL de la Práctica 1 cargado automáticamente) y expone sus datos mediante un API REST desarrollado en Node.js/Express. Esto permite centralizar todas las operaciones CRUD y consultas estadísticas, eliminando la manipulación directa de tablas y garantizando un entorno reproducible.

### Tecnologías utilizadas
- Docker & Docker Compose
- Oracle Database XE
- Node.js + Express
- DBeaver (administración/verificación)
- Postman (pruebas de endpoints)
- Git & GitHub

---

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (que incluye Docker Compose)
2. [Git](https://git-scm.com/) (opcional, para clonar el repositorio)
3. [DBeaver](https://dbeaver.io/) (para verificar la base de datos)
4. [Postman](https://www.postman.com/) (para probar los endpoints)

---

## Guía paso a paso para el despliegue con Docker

```
//levantar con docker compose tener docker-compose.yml con la imagen oracle-xe
docker-compose up -d

//verificar contendores levantados
docker ps

//para ejecutar las apis en node js
node src/app.js

// crear nueva conexion en DBeaver para visualizar los datos 

// limpieza
# Detener y eliminar contenedor
docker-compose down

# Eliminar el volumen (borra todos los datos)
docker volume rm proyecto2_oracle-data

# Verificar que no quede nada
docker ps -a | findstr oracle

# levantar
docker-compose up -d

# Ver logs para saber cuándo está listo
docker-compose logs -f oracle-db


# Copiar tu script al contenedor
docker cp scripts/01-DDLPRACTICA1.sql oracle-container:/tmp/ddl.sql

# Ejecutar el script como usuario BD1
docker exec -it oracle-container sqlplus BD1/123@XEPDB1 "@/tmp/ddl.sql"

docker-compose stop

docker-compose start


```

### 1. Evidencia de funcionamiento
Insertar de Datos masivo
<img width="1909" height="953" alt="image" src="https://github.com/user-attachments/assets/717dd97c-d59f-4a3a-9b9b-fb862856ccef" />
<img width="1902" height="1009" alt="image" src="https://github.com/user-attachments/assets/f15f6ad9-9fb3-4db4-a006-259b0373bd7d" />

Actualizar datos masivo
<img width="1898" height="1032" alt="image" src="https://github.com/user-attachments/assets/a70941ed-7938-41e6-9458-3796d40c11bf" />
<img width="1912" height="1012" alt="image" src="https://github.com/user-attachments/assets/72b37293-d68b-419f-9a60-3474438dc227" />

Mostrar datos con id y tabla 
<img width="1908" height="1038" alt="image" src="https://github.com/user-attachments/assets/64966beb-84d3-4571-b01d-2ee93fc26720" />
<img width="1916" height="1022" alt="image" src="https://github.com/user-attachments/assets/971a8c92-f83d-480f-a774-3a3d002b15c3" />

Eliminar tablas
<img width="1919" height="986" alt="image" src="https://github.com/user-attachments/assets/caf2d545-1345-4582-90a0-e1df434099c1" />
<img width="1755" height="907" alt="image" src="https://github.com/user-attachments/assets/a961abfc-1987-4053-9661-c7d4ef7af0f0" />

Consulta 1
<img width="1887" height="981" alt="image" src="https://github.com/user-attachments/assets/c6afabf3-b3fe-4ea5-87ab-fdd08a6238f0" />
<img width="1581" height="270" alt="image" src="https://github.com/user-attachments/assets/26da8862-0e8d-4a0d-966d-c9f4eb120769" />

Consulta 2
<img width="1893" height="973" alt="image" src="https://github.com/user-attachments/assets/a855e2a1-eb71-4b3c-96b5-eb9d311bc480" />
<img width="1571" height="272" alt="image" src="https://github.com/user-attachments/assets/63057a7b-a2ba-4fe1-ae44-f1e9bae8141a" />

Consulta 3
<img width="1574" height="247" alt="image" src="https://github.com/user-attachments/assets/430dbe39-7efa-4e23-8778-737f05c86314" />
<img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/06c4b5ec-591f-46b9-9ec8-558ff595a518" />





