const express = require('express');
const db = require('./config/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/api/carga-masiva', async (req, res) => {
    const data = req.body;
    
    // Orden correcto de inserción (respetando llaves foráneas)
    const ordenCorrecto = [
        'DEPARTAMENTO',
        'MUNICIPIO', 
        'CENTRO',
        'ESCUELA',
        'UBICACION',
        'REGISTRO',
        'CORRELATIVO',
        'EXAMEN',
        'PREGUNTAS',
        'PREGUNTAS_PRACTICO',
        'RESPUESTA_USUARIO',
        'RESPUESTA_PRACTICO_USUARIO'
    ];

    let exitosos = 0;
    let fallidos = [];

    try {
        for (const tabla of ordenCorrecto) {
            if (data[tabla] && Array.isArray(data[tabla])) {
                console.log(`Procesando tabla: ${tabla} - ${data[tabla].length} registros`);
                
                for (const registro of data[tabla]) {
                    try {
                        let sql = '';
                        let binds = {};

                        // TABLA: DEPARTAMENTO
                        if (tabla === 'DEPARTAMENTO') {
                            // Convertir codigo de string a número
                            const codigoNum = parseInt(registro.codigo, 10);
                            sql = `INSERT INTO DEPARTAMENTO (codigo, nombre) VALUES (:codigo, :nombre)`;
                            binds = {
                                codigo: codigoNum,
                                nombre: registro.nombre
                            };
                        }
                        
                        // TABLA: MUNICIPIO
                        else if (tabla === 'MUNICIPIO') {
                            const codigoNum = parseInt(registro.codigo, 10);
                            const deptoNum = parseInt(registro.departamento_id_departamento, 10);
                            sql = `INSERT INTO MUNICIPIO (codigo, nombre, departamento_codigo) VALUES (:codigo, :nombre, :depto_codigo)`;
                            binds = {
                                codigo: codigoNum,
                                nombre: registro.nombre,
                                depto_codigo: deptoNum
                            };
                        }
                        
                        // TABLA: CENTRO (ID auto-generado)
                        else if (tabla === 'CENTRO') {
                            sql = `INSERT INTO CENTRO (nombre) VALUES (:nombre)`;
                            binds = { nombre: registro.nombre };
                        }
                        
                        // TABLA: ESCUELA (ID auto-generado)
                        else if (tabla === 'ESCUELA') {
                            sql = `INSERT INTO ESCUELA (nombre, direccion, acuerdo) VALUES (:nombre, :direccion, :acuerdo)`;
                            binds = {
                                nombre: registro.nombre,
                                direccion: registro.direccion || null,
                                acuerdo: registro.acuerdo || null
                            };
                        }
                        
                        // TABLA: UBICACION
                        else if (tabla === 'UBICACION') {
                            sql = `INSERT INTO UBICACION (escuela_id_escuela, centro_id_centro) VALUES (:escuela_id, :centro_id)`;
                            binds = {
                                escuela_id: registro.escuela_id_escuela,
                                centro_id: registro.centro_id_centro
                            };
                        }
                        
                        // TABLA: REGISTRO

                        else if (tabla === 'REGISTRO') {
                            sql = `INSERT INTO REGISTRO (ubicacion_escuela_id_escuela, ubicacion_centro_id_centro, municipio_id_municipio, municipio_departamento_id_departamento, fecha, tipo_tramite, tipo_licencia, nombre_completo, genero) VALUES (:escuela_id, :centro_id, :municipio_id, :depto_id, TO_DATE(:fecha, 'YYYY-MM-DD'), :tipo_tramite, :tipo_licencia, :nombre, :genero)`;
                            binds = {
                                escuela_id: registro.ubicacion_escuela_id_escuela,
                                centro_id: registro.ubicacion_centro_id_centro,
                                municipio_id: registro.municipio_id_municipio,
                                depto_id: registro.municipio_departamento_id_departamento,
                                fecha: registro.fecha,
                                tipo_tramite: registro.tipo_tramite,
                                tipo_licencia: registro.tipo_licencia,
                                nombre: registro.nombre_completo,
                                genero: registro.genero
                            };
                        }
                        
                        // TABLA: CORRELATIVO
                        else if (tabla === 'CORRELATIVO') {
                            sql = `INSERT INTO CORRELATIVO (fecha, no_examen) VALUES (TO_DATE(:fecha, 'YYYY-MM-DD'), :no_examen)`;
                            binds = {
                                fecha: registro.fecha,
                                no_examen: registro.no_examen
                            };
                        }
                        
                        // TABLA: EXAMEN
                        else if (tabla === 'EXAMEN') {
                            sql = `INSERT INTO EXAMEN (registro_id_registro, correlativo_id_correlativo, registro_id_escuela, registro_id_centro, registro_municipio_id_municipio, registro_muni_depto_id_depto) VALUES (:registro_id, :correlativo_id, :escuela_id, :centro_id, :municipio_id, :depto_id)`;
                            binds = {
                                registro_id: registro.registro_id_registro,
                                correlativo_id: registro.correlativo_id_correlativo,
                                escuela_id: registro.registro_id_escuela,
                                centro_id: registro.registro_id_centro,
                                municipio_id: registro.registro_municipio_id_municipio,
                                depto_id: registro.registro_municipio_departamento_id_departamento
                            };
                        }
                        
                        // TABLA: PREGUNTAS
                        else if (tabla === 'PREGUNTAS') {
                            sql = `INSERT INTO PREGUNTAS (pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d, respuesta_correcta) VALUES (:texto, :a, :b, :c, :d, :correcta)`;
                            binds = {
                                texto: registro.pregunta_texto,
                                a: registro.respuesta_a,
                                b: registro.respuesta_b,
                                c: registro.respuesta_c,
                                d: registro.respuesta_d,
                                correcta: registro.respuesta_correcta
                            };
                        }
                        
                        // TABLA: PREGUNTAS_PRACTICO
                        else if (tabla === 'PREGUNTAS_PRACTICO') {
                            sql = `INSERT INTO PREGUNTAS_PRACTICO (pregunta_texto, punteo) VALUES (:texto, :punteo)`;
                            binds = {
                                texto: registro.pregunta_texto,
                                punteo: registro.punteo
                            };
                        }
                        
                        // TABLA: RESPUESTA_USUARIO
                        else if (tabla === 'RESPUESTA_USUARIO') {
                            sql = `INSERT INTO RESPUESTA_USUARIO (pregunta_id_pregunta, examen_id_examen, respuesta) VALUES (:pregunta_id, :examen_id, :respuesta)`;
                            binds = {
                                pregunta_id: registro.pregunta_id_pregunta,
                                examen_id: registro.examen_id_examen,
                                respuesta: registro.respuesta
                            };
                        }
                        
                        // TABLA: RESPUESTA_PRACTICO_USUARIO
                        else if (tabla === 'RESPUESTA_PRACTICO_USUARIO') {
                            sql = `INSERT INTO RESPUESTA_PRACTICO_USUARIO (pregunta_practico_id_pregunta_practico, examen_id_examen, nota) VALUES (:pregunta_id, :examen_id, :nota)`;
                            binds = {
                                pregunta_id: registro.pregunta_practico_id_pregunta_practico,
                                examen_id: registro.examen_id_examen,
                                nota: registro.nota
                            };
                        }

                        // Ejecutar la inserción
                        await db.execute(sql, binds);
                        exitosos++;
                        console.log(`Insertado en ${tabla}`);

                    } catch (errorItem) {
                        const errorMsg = `Error en ${tabla}: ${errorItem.message} | Datos: ${JSON.stringify(registro)}`;
                        console.error(` ${errorMsg}`);
                        fallidos.push(errorMsg);
                    }
                }
            }
        }

        res.status(200).json({ 
            message: 'Proceso de carga finalizado',
            totalExitosos: exitosos,
            totalFallidos: fallidos.length,
            detallesErrores: fallidos
        });

    } catch (errorGeneral) {
        console.error('Error crítico:', errorGeneral);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



// Endpoint de prueba para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Iniciar el servidor
async function startServer() {
    try {
        await db.initialize();
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();