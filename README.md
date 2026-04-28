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


```

### 1. Evidencia de funcionamiento
Carga de Datos
<img width="1909" height="953" alt="image" src="https://github.com/user-attachments/assets/717dd97c-d59f-4a3a-9b9b-fb862856ccef" />
<img width="1902" height="1009" alt="image" src="https://github.com/user-attachments/assets/f15f6ad9-9fb3-4db4-a006-259b0373bd7d" />

