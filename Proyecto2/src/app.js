const express = require('express');
const db = require('./config/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CRUD 
//CREAR O INSERTAR
app.post('/api/insertar-datos', async (req, res) => {
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

// ACTUALIZAR
app.put('/api/actualizar-datos', async (req, res) => {
    const data = req.body;
    
    // Función para convertir strings a números
    const toNumber = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const num = parseInt(value, 10);
            return isNaN(num) ? null : num;
        }
        return null;
    };

    // Orden de procesamiento (mismo orden que la carga)
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

    let actualizados = 0;
    let fallidos = [];

    try {
        for (const tabla of ordenCorrecto) {
            if (data[tabla] && Array.isArray(data[tabla]) && data[tabla].length > 0) {
                console.log(`Actualizando tabla: ${tabla} - ${data[tabla].length} registros`);
                
                for (const registro of data[tabla]) {
                    try {
                        let sql = '';
                        let binds = {};

                        // TABLA: DEPARTAMENTO
                        // Actualiza por codigo (PK)
                        if (tabla === 'DEPARTAMENTO') {
                            if (!registro.codigo) {
                                throw new Error('Falta campo obligatorio: codigo');
                            }
                            const codigoNum = toNumber(registro.codigo);
                            sql = `UPDATE DEPARTAMENTO SET nombre = :nombre WHERE codigo = :codigo`;
                            binds = {
                                codigo: codigoNum,
                                nombre: registro.nombre
                            };
                        }
                        
                        // TABLA: MUNICIPIO
                        // Actualiza por codigo (PK)
                        else if (tabla === 'MUNICIPIO') {
                            if (!registro.codigo) {
                                throw new Error('Falta campo obligatorio: codigo');
                            }
                            const codigoNum = toNumber(registro.codigo);
                            const deptoNum = registro.departamento_codigo ? toNumber(registro.departamento_codigo) : 
                                              (registro.departamento_id_departamento ? toNumber(registro.departamento_id_departamento) : null);
                            
                            sql = `UPDATE MUNICIPIO SET nombre = :nombre, departamento_codigo = :depto_codigo WHERE codigo = :codigo`;
                            binds = {
                                codigo: codigoNum,
                                nombre: registro.nombre,
                                depto_codigo: deptoNum
                            };
                        }
                        
                        // TABLA: CENTRO
                        // Actualiza por id_centro
                        else if (tabla === 'CENTRO') {
                            if (!registro.id_centro && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_centro o id');
                            }
                            const idCentro = registro.id_centro || registro.id;
                            sql = `UPDATE CENTRO SET nombre = :nombre WHERE id_centro = :id_centro`;
                            binds = {
                                id_centro: idCentro,
                                nombre: registro.nombre
                            };
                        }
                        
                        // TABLA: ESCUELA
                        // Actualiza por id_escuela
                        else if (tabla === 'ESCUELA') {
                            if (!registro.id_escuela && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_escuela o id');
                            }
                            const idEscuela = registro.id_escuela || registro.id;
                            sql = `UPDATE ESCUELA SET nombre = :nombre, direccion = :direccion, acuerdo = :acuerdo WHERE id_escuela = :id_escuela`;
                            binds = {
                                id_escuela: idEscuela,
                                nombre: registro.nombre,
                                direccion: registro.direccion || null,
                                acuerdo: registro.acuerdo || null
                            };
                        }
                        // TABLA: UBICACION
                        // Actualiza por combinación de llaves
                        else if (tabla === 'UBICACION') {
                            if (!registro.escuela_id_escuela || !registro.centro_id_centro) {
                                throw new Error('Faltan campos obligatorios: escuela_id_escuela y centro_id_centro');
                            }
                            // Para actualizar ubicación, normalmente se necesita la combinación completa
                            // Esta actualización permite cambiar centro_id_centro
                            if (registro.nuevo_centro_id_centro) {
                                sql = `UPDATE UBICACION SET centro_id_centro = :nuevo_centro WHERE escuela_id_escuela = :escuela_id AND centro_id_centro = :centro_id`;
                                binds = {
                                    escuela_id: registro.escuela_id_escuela,
                                    centro_id: registro.centro_id_centro,
                                    nuevo_centro: registro.nuevo_centro_id_centro
                                };
                            } else {
                                // Si no hay cambios, solo verificamos que existe
                                sql = `SELECT 1 FROM UBICACION WHERE escuela_id_escuela = :escuela_id AND centro_id_centro = :centro_id`;
                                binds = {
                                    escuela_id: registro.escuela_id_escuela,
                                    centro_id: registro.centro_id_centro
                                };
                                const exists = await db.execute(sql, binds);
                                if (exists.rows.length === 0) {
                                    throw new Error('Ubicación no encontrada');
                                }
                                actualizados++;
                                continue; // No hacer UPDATE, solo verificar
                            }
                        }
                        
                        // TABLA: REGISTRO
                        // Actualiza por id_registro
                        else if (tabla === 'REGISTRO') {
                            if (!registro.id_registro && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_registro o id');
                            }
                            const idRegistro = registro.id_registro || registro.id;
                            sql = `UPDATE REGISTRO SET 
                                    ubicacion_escuela_id_escuela = :escuela_id,
                                    ubicacion_centro_id_centro = :centro_id,
                                    municipio_id_municipio = :municipio_id,
                                    municipio_departamento_id_departamento = :depto_id,
                                    fecha = TO_DATE(:fecha, 'YYYY-MM-DD'),
                                    tipo_tramite = :tipo_tramite,
                                    tipo_licencia = :tipo_licencia,
                                    nombre_completo = :nombre,
                                    genero = :genero
                                WHERE id_registro = :id_registro`;
                            binds = {
                                id_registro: idRegistro,
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
                        // Actualiza por id_correlativo
                        else if (tabla === 'CORRELATIVO') {
                            if (!registro.id_correlativo && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_correlativo o id');
                            }
                            const idCorrelativo = registro.id_correlativo || registro.id;
                            sql = `UPDATE CORRELATIVO SET fecha = TO_DATE(:fecha, 'YYYY-MM-DD'), no_examen = :no_examen WHERE id_correlativo = :id_correlativo`;
                            binds = {
                                id_correlativo: idCorrelativo,
                                fecha: registro.fecha,
                                no_examen: registro.no_examen
                            };
                        }
                        
                        // TABLA: EXAMEN
                        // Actualiza por id_examen
                        else if (tabla === 'EXAMEN') {
                            if (!registro.id_examen && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_examen o id');
                            }
                            const idExamen = registro.id_examen || registro.id;
                            sql = `UPDATE EXAMEN SET 
                                    registro_id_registro = :registro_id,
                                    correlativo_id_correlativo = :correlativo_id,
                                    registro_id_escuela = :escuela_id,
                                    registro_id_centro = :centro_id,
                                    registro_municipio_id_municipio = :municipio_id,
                                    registro_muni_depto_id_depto = :depto_id
                                WHERE id_examen = :id_examen`;
                            binds = {
                                id_examen: idExamen,
                                registro_id: registro.registro_id_registro,
                                correlativo_id: registro.correlativo_id_correlativo,
                                escuela_id: registro.registro_id_escuela,
                                centro_id: registro.registro_id_centro,
                                municipio_id: registro.registro_municipio_id_municipio,
                                depto_id: registro.registro_municipio_departamento_id_departamento
                            };
                        }
                        
                        // TABLA: PREGUNTAS
                        // Actualiza por id_pregunta
                        else if (tabla === 'PREGUNTAS') {
                            if (!registro.id_pregunta && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_pregunta o id');
                            }
                            const idPregunta = registro.id_pregunta || registro.id;
                            sql = `UPDATE PREGUNTAS SET 
                                    pregunta_texto = :texto,
                                    respuesta_a = :a,
                                    respuesta_b = :b,
                                    respuesta_c = :c,
                                    respuesta_d = :d,
                                    respuesta_correcta = :correcta
                                WHERE id_pregunta = :id_pregunta`;
                            binds = {
                                id_pregunta: idPregunta,
                                texto: registro.pregunta_texto,
                                a: registro.respuesta_a,
                                b: registro.respuesta_b,
                                c: registro.respuesta_c,
                                d: registro.respuesta_d,
                                correcta: registro.respuesta_correcta
                            };
                        }
                        
                        // TABLA: PREGUNTAS_PRACTICO
                        // Actualiza por id_pregunta_practico
                        else if (tabla === 'PREGUNTAS_PRACTICO') {
                            if (!registro.id_pregunta_practico && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_pregunta_practico o id');
                            }
                            const idPreguntaPractico = registro.id_pregunta_practico || registro.id;
                            sql = `UPDATE PREGUNTAS_PRACTICO SET pregunta_texto = :texto, punteo = :punteo WHERE id_pregunta_practico = :id_pregunta_practico`;
                            binds = {
                                id_pregunta_practico: idPreguntaPractico,
                                texto: registro.pregunta_texto,
                                punteo: registro.punteo
                            };
                        }
                        
                        // TABLA: RESPUESTA_USUARIO
                        // Actualiza por id_resp_user
                        else if (tabla === 'RESPUESTA_USUARIO') {
                            if (!registro.id_resp_user && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_resp_user o id');
                            }
                            const idRespUser = registro.id_resp_user || registro.id;
                            sql = `UPDATE RESPUESTA_USUARIO SET 
                                    pregunta_id_pregunta = :pregunta_id,
                                    examen_id_examen = :examen_id,
                                    respuesta = :respuesta
                                WHERE id_resp_user = :id_resp_user`;
                            binds = {
                                id_resp_user: idRespUser,
                                pregunta_id: registro.pregunta_id_pregunta,
                                examen_id: registro.examen_id_examen,
                                respuesta: registro.respuesta
                            };
                        }
                        
                        // TABLA: RESPUESTA_PRACTICO_USUARIO
                        // Actualiza por id_resp_pract_user
                        
                        else if (tabla === 'RESPUESTA_PRACTICO_USUARIO') {
                            if (!registro.id_resp_pract_user && !registro.id) {
                                throw new Error('Falta campo obligatorio: id_resp_pract_user o id');
                            }
                            const idRespPractUser = registro.id_resp_pract_user || registro.id;
                            sql = `UPDATE RESPUESTA_PRACTICO_USUARIO SET 
                                    pregunta_practico_id_pregunta_practico = :pregunta_id,
                                    examen_id_examen = :examen_id,
                                    nota = :nota
                                WHERE id_resp_pract_user = :id_resp_pract_user`;
                            binds = {
                                id_resp_pract_user: idRespPractUser,
                                pregunta_id: registro.pregunta_practico_id_pregunta_practico,
                                examen_id: registro.examen_id_examen,
                                nota: registro.nota
                            };
                        }

                        // Ejecutar la actualización
                        const result = await db.execute(sql, binds);
                        
                        if (result.rowsAffected === 0) {
                            throw new Error('No se encontró el registro para actualizar');
                        }
                        
                        actualizados++;
                        console.log(`Actualizado en ${tabla}`);

                    } catch (errorItem) {
                        const errorMsg = `Error en ${tabla}: ${errorItem.message} | Datos: ${JSON.stringify(registro)}`;
                        console.error(`${errorMsg}`);
                        fallidos.push(errorMsg);
                    }
                }
            }
        }

        res.status(200).json({ 
            message: 'Proceso de actualización finalizado',
            totalActualizados: actualizados,
            totalFallidos: fallidos.length,
            detallesErrores: fallidos
        });

    } catch (errorGeneral) {
        console.error('Error crítico:', errorGeneral);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// GET O MOSTRAR
app.get('/api/mostrar-datos', async (req, res) => {
    // Si se envían parámetros por query string (modo simple)
    const { tabla, id } = req.query;
    
    // Función para convertir strings a números
    const toNumber = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const num = parseInt(value, 10);
            return isNaN(num) ? null : num;
        }
        return null;
    };

    // Mapeo de tablas con sus respectivas columnas ID
    const tablasInfo = {
        'DEPARTAMENTO': {
            idColumn: 'codigo',
            columnas: ['codigo', 'nombre'],
            nombreTabla: 'DEPARTAMENTO'
        },
        'MUNICIPIO': {
            idColumn: 'codigo',
            columnas: ['codigo', 'nombre', 'departamento_codigo'],
            nombreTabla: 'MUNICIPIO'
        },
        'CENTRO': {
            idColumn: 'id_centro',
            columnas: ['id_centro', 'nombre'],
            nombreTabla: 'CENTRO'
        },
        'ESCUELA': {
            idColumn: 'id_escuela',
            columnas: ['id_escuela', 'nombre', 'direccion', 'acuerdo'],
            nombreTabla: 'ESCUELA'
        },
        'UBICACION': {
            idColumn: null,
            columnas: ['escuela_id_escuela', 'centro_id_centro'],
            nombreTabla: 'UBICACION',
            isComposite: true
        },
        'REGISTRO': {
            idColumn: 'id_registro',
            columnas: ['id_registro', 'ubicacion_escuela_id_escuela', 'ubicacion_centro_id_centro', 
                       'municipio_id_municipio', 'municipio_departamento_id_departamento', 
                       'fecha', 'tipo_tramite', 'tipo_licencia', 'nombre_completo', 'genero'],
            nombreTabla: 'REGISTRO'
        },
        'CORRELATIVO': {
            idColumn: 'id_correlativo',
            columnas: ['id_correlativo', 'fecha', 'no_examen'],
            nombreTabla: 'CORRELATIVO'
        },
        'EXAMEN': {
            idColumn: 'id_examen',
            columnas: ['id_examen', 'registro_id_registro', 'correlativo_id_correlativo', 
                       'registro_id_escuela', 'registro_id_centro', 'registro_municipio_id_municipio', 
                       'registro_muni_depto_id_depto'],
            nombreTabla: 'EXAMEN'
        },
        'PREGUNTAS': {
            idColumn: 'id_pregunta',
            columnas: ['id_pregunta', 'pregunta_texto', 'respuesta_a', 'respuesta_b', 
                       'respuesta_c', 'respuesta_d', 'respuesta_correcta'],
            nombreTabla: 'PREGUNTAS'
        },
        'PREGUNTAS_PRACTICO': {
            idColumn: 'id_pregunta_practico',
            columnas: ['id_pregunta_practico', 'pregunta_texto', 'punteo'],
            nombreTabla: 'PREGUNTAS_PRACTICO'
        },
        'RESPUESTA_USUARIO': {
            idColumn: 'id_resp_user',
            columnas: ['id_resp_user', 'pregunta_id_pregunta', 'examen_id_examen', 'respuesta'],
            nombreTabla: 'RESPUESTA_USUARIO'
        },
        'RESPUESTA_PRACTICO_USUARIO': {
            idColumn: 'id_resp_pract_user',
            columnas: ['id_resp_pract_user', 'pregunta_practico_id_pregunta_practico', 'examen_id_examen', 'nota'],
            nombreTabla: 'RESPUESTA_PRACTICO_USUARIO'
        }
    };

    // MODO 1: Consulta por query string (simple)
    if (tabla) {
        const tablaInfo = tablasInfo[tabla.toUpperCase()];
        
        if (!tablaInfo) {
            return res.status(400).json({ error: `Tabla '${tabla}' no válida` });
        }

        try {
            const idNumber = id ? toNumber(id) : null;
            
            let sql = '';
            let binds = {};
            
            if (idNumber && tablaInfo.idColumn) {
                sql = `SELECT * FROM ${tablaInfo.nombreTabla} WHERE ${tablaInfo.idColumn} = :id`;
                binds = { id: idNumber };
            } else {
                sql = `SELECT * FROM ${tablaInfo.nombreTabla}`;
            }
            
            const result = await db.execute(sql, binds);
            
            if (idNumber && result.rows.length === 0) {
                return res.status(404).json({ 
                    message: `No se encontró registro con ${tablaInfo.idColumn} = ${idNumber} en ${tabla}` 
                });
            }
            
            return res.json({
                tabla: tabla,
                totalRegistros: result.rows.length,
                datos: result.rows
            });
            
        } catch (error) {
            console.error('Error en consulta:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    // MODO 2: Consulta por JSON en el cuerpo (múltiples tablas)
    
    try {
        // Obtener el cuerpo de la petición
        const data = req.body;
        
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ 
                error: 'Debe enviar un JSON en el cuerpo de la petición o usar ?tabla=NOMBRE&id=VALOR en la URL' 
            });
        }
        
        let resultados = {};
        let errores = [];

        // Recorrer cada tabla solicitada en el JSON
        for (const [tablaNombre, consultaData] of Object.entries(data)) {
            const tablaInfo = tablasInfo[tablaNombre.toUpperCase()];
            
            if (!tablaInfo) {
                errores.push(`Tabla '${tablaNombre}' no válida`);
                resultados[tablaNombre] = { error: `Tabla '${tablaNombre}' no válida` };
                continue;
            }
            
            try {
                // Obtener el ID del objeto de consulta
                // El objeto puede tener 'id', 'id_centro', 'id_registro', etc.
                let idValue = null;
                
                if (consultaData.id !== undefined) {
                    idValue = consultaData.id;
                } else if (consultaData[tablaInfo.idColumn] !== undefined) {
                    idValue = consultaData[tablaInfo.idColumn];
                }
                
                // Si no hay ID y no es llave compuesta, error
                if (!idValue && !tablaInfo.isComposite) {
                    resultados[tablaNombre] = {
                        error: `Falta el campo 'id' o '${tablaInfo.idColumn}' en la consulta`,
                        consulta: consultaData
                    };
                    continue;
                }
                
                let sql = '';
                let binds = {};
                
                // Construir la consulta según el tipo de tabla
                if (tablaInfo.isComposite) {
                    // Para UBICACION (llave compuesta)
                    const escuelaId = consultaData.escuela_id_escuela || consultaData.escuela_id;
                    const centroId = consultaData.centro_id_centro || consultaData.centro_id;
                    
                    if (!escuelaId || !centroId) {
                        resultados[tablaNombre] = {
                            error: 'Faltan campos para UBICACION: escuela_id_escuela y centro_id_centro',
                            consulta: consultaData
                        };
                        continue;
                    }
                    
                    sql = `SELECT * FROM ${tablaInfo.nombreTabla} 
                           WHERE escuela_id_escuela = :escuela_id AND centro_id_centro = :centro_id`;
                    binds = {
                        escuela_id: toNumber(escuelaId),
                        centro_id: toNumber(centroId)
                    };
                } else {
                    // Para tablas con ID simple
                    const idNumero = toNumber(idValue);
                    sql = `SELECT * FROM ${tablaInfo.nombreTabla} WHERE ${tablaInfo.idColumn} = :id`;
                    binds = { id: idNumero };
                }
                
                // Ejecutar la consulta
                const result = await db.execute(sql, binds);
                
                // Guardar resultado
                resultados[tablaNombre] = {
                    consulta: consultaData,
                    encontrado: result.rows.length > 0,
                    datos: result.rows.length > 0 ? result.rows[0] : null,
                    mensaje: result.rows.length === 0 ? `No se encontró registro con ID ${idValue || JSON.stringify(binds)}` : null
                };
                
            } catch (error) {
                console.error(`Error consultando ${tablaNombre}:`, error);
                errores.push(`Error en ${tablaNombre}: ${error.message}`);
                resultados[tablaNombre] = {
                    error: error.message,
                    consulta: consultaData
                };
            }
        }
        
        res.json({
            message: 'Consulta finalizada',
            totalConsultas: Object.keys(data).length,
            totalExitosas: Object.values(resultados).filter(r => r.encontrado === true).length,
            resultados: resultados,
            errores: errores.length > 0 ? errores : null
        });
        
    } catch (errorGeneral) {
        console.error('Error crítico:', errorGeneral);
        res.status(500).json({ error: 'Error interno del servidor', detalles: errorGeneral.message });
    }
});





// DELETE - Eliminar un registro
app.delete('/api/aspirantes/:id', async (req, res) => {
    try {
        await db.execute(`DELETE FROM aspirantes WHERE id = :id`, { id: req.params.id });
        res.json({ message: 'Eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CONSULTAS ESTADÍSTICAS 

// 1. Promedios de puntajes por examen
app.get('/api/estadisticas/promedios', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT e.id, e.nombre, AVG(er.puntaje) as promedio
            FROM examenes e
            JOIN examenes_realizados er ON e.id = er.examen_id
            GROUP BY e.id, e.nombre
            ORDER BY promedio DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Rankings de evaluados
app.get('/api/estadisticas/rankings', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT a.id, a.nombre, AVG(er.puntaje) as promedio_puntaje,
                   COUNT(er.id) as examenes_presentados,
                   RANK() OVER (ORDER BY AVG(er.puntaje) DESC) as ranking
            FROM aspirantes a
            JOIN examenes_realizados er ON a.id = er.aspirante_id
            GROUP BY a.id, a.nombre
            ORDER BY ranking
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Análisis de dificultad de preguntas
app.get('/api/estadisticas/dificultad', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT p.id, p.texto, 
                   AVG(CASE WHEN rp.respuesta_correcta = 1 THEN 100 ELSE 0 END) as porcentaje_aciertos,
                   COUNT(rp.id) as veces_respondida
            FROM preguntas p
            JOIN respuestas_preguntas rp ON p.id = rp.pregunta_id
            GROUP BY p.id, p.texto
            ORDER BY porcentaje_aciertos ASC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
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