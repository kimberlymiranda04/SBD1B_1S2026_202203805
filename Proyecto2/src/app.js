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





// DELETE - Eliminar TABLAS
app.delete('/api/eliminar-tablas', async (req, res) => {
    const data = req.body;
    
    // ORDEN INVERSO para eliminar tablas (respetar FK)
    // Primero tablas que dependen de otras (hijas), luego las padres
    const ordenEliminacion = [
        'RESPUESTA_PRACTICO_USUARIO',
        'RESPUESTA_USUARIO',
        'EXAMEN',
        'CORRELATIVO',
        'REGISTRO',
        'UBICACION',
        'ESCUELA',
        'CENTRO',
        'MUNICIPIO',
        'DEPARTAMENTO',
        'PREGUNTAS',
        'PREGUNTAS_PRACTICO'
    ];

    let eliminadas = 0;
    let fallidas = [];
    let warnings = [];

    try {
        // Verificar que se enviaron tablas para eliminar
        if (!data.tablas || !Array.isArray(data.tablas) || data.tablas.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Debe enviar un arreglo de nombres de tablas en el campo "tablas"'
            });
        }

        const tablasAEliminar = data.tablas.map(t => t.toUpperCase());
        
        // Validar que todas las tablas existen antes de empezar
        const tablasValidas = ordenEliminacion.filter(t => tablasAEliminar.includes(t));
        const tablasInvalidas = tablasAEliminar.filter(t => !ordenEliminacion.includes(t));
        
        if (tablasInvalidas.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Las siguientes tablas no son válidas: ${tablasInvalidas.join(', ')}`,
                tablasValidas: ordenEliminacion
            });
        }

        console.log(`Eliminando tablas: ${tablasValidas.join(', ')}`);

        // Eliminar en el orden correcto (respetando FK)
        for (const tabla of ordenEliminacion) {
            if (tablasValidas.includes(tabla)) {
                try {
                    // Verificar si la tabla existe antes de intentar eliminarla
                    const checkSql = `SELECT table_name FROM user_tables WHERE table_name = :tabla`;
                    const checkResult = await db.execute(checkSql, { tabla: tabla });
                    
                    if (checkResult.rows.length === 0) {
                        warnings.push(`Tabla ${tabla} no existe, se omite`);
                        continue;
                    }
                    
                    // Deshabilitar restricciones FK si es necesario
                    const disableFkSql = `
                        BEGIN
                            FOR c IN (SELECT constraint_name FROM user_constraints 
                                      WHERE table_name = :tabla AND constraint_type = 'R') LOOP
                                EXECUTE IMMEDIATE 'ALTER TABLE ${tabla} DISABLE CONSTRAINT ' || c.constraint_name;
                            END LOOP;
                        END;
                    `;
                    
                    try {
                        await db.execute(disableFkSql, { tabla: tabla });
                    } catch (fkError) {
                        // Si no se pueden deshabilitar, continuar igual
                        console.log(`No se pudieron deshabilitar FK para ${tabla}: ${fkError.message}`);
                    }
                    
                    // Ejecutar DROP TABLE
                    const sql = `DROP TABLE ${tabla} CASCADE CONSTRAINTS`;
                    await db.execute(sql);
                    
                    eliminadas++;
                    console.log(`Tabla eliminada: ${tabla}`);
                    
                } catch (errorItem) {
                    const errorMsg = `Error al eliminar tabla ${tabla}: ${errorItem.message}`;
                    console.error(` ${errorMsg}`);
                    fallidas.push(errorMsg);
                }
            }
        }

        res.status(200).json({ 
            success: true,
            message: 'Proceso de eliminación de tablas finalizado',
            tablasEliminadas: eliminadas,
            tablasNoEncontradas: warnings,
            errores: fallidas,
            detalle: {
                eliminadas: tablasValidas.filter(t => !fallidas.some(f => f.includes(t))),
                fallidas: fallidas.map(f => f.split(':')[0].replace('Error al eliminar tabla ', ''))
            }
        });

    } catch (errorGeneral) {
        console.error('Error crítico:', errorGeneral);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor',
            detalles: errorGeneral.message 
        });
    }
});
// CONSULTAS ESTADÍSTICAS 

// CONSULTA 1: Estadísticas de evaluaciones por centro y escuela 
// Muestra: Total de exámenes, promedio teórico, promedio práctico y aprobados

app.get('/api/estadisticas/centro-escuela', async (req, res) => {
    try {
        const sql = `
            WITH 
            -- 1. Calcular el puntaje máximo teórico por examen (cada pregunta vale 100%)
            puntaje_teorico_por_examen AS (
                SELECT 
                    ex.id_examen,
                    COUNT(DISTINCT ru.pregunta_id_pregunta) AS total_preguntas_teoricas,
                    SUM(CASE WHEN ru.respuesta = p.respuesta_correcta THEN 100 ELSE 0 END) AS puntaje_teorico_total
                FROM EXAMEN ex
                LEFT JOIN RESPUESTA_USUARIO ru ON ru.examen_id_examen = ex.id_examen
                LEFT JOIN PREGUNTAS p ON ru.pregunta_id_pregunta = p.id_pregunta
                GROUP BY ex.id_examen
            ),
            
            -- 2. Calcular el puntaje máximo práctico por examen
            puntaje_practico_por_examen AS (
                SELECT 
                    ex.id_examen,
                    SUM(pp.punteo) AS puntaje_maximo_practico,
                    SUM(rpu.nota) AS puntaje_practico_obtenido
                FROM EXAMEN ex
                LEFT JOIN RESPUESTA_PRACTICO_USUARIO rpu ON rpu.examen_id_examen = ex.id_examen
                LEFT JOIN PREGUNTAS_PRACTICO pp ON rpu.pregunta_practico_id_pregunta_practico = pp.id_pregunta_practico
                GROUP BY ex.id_examen
            )
            
            -- Consulta principal por centro y escuela
            SELECT 
                c.id_centro,
                c.nombre AS centro_nombre,
                e.id_escuela,
                e.nombre AS escuela_nombre,
                
                -- Totales
                COUNT(DISTINCT ex.id_examen) AS total_examenes,
                
                -- PROMEDIO TEÓRICO REAL (suma de porcentajes / número de exámenes)
                ROUND(AVG(pte.puntaje_teorico_total / NULLIF(pte.total_preguntas_teoricas, 0)), 2) AS promedio_teorico,
                
                -- PROMEDIO PRÁCTICO REAL (suma de puntajes obtenidos / puntaje máximo * 100)
                ROUND(AVG((ppe.puntaje_practico_obtenido / NULLIF(ppe.puntaje_maximo_practico, 0)) * 100), 2) AS promedio_practico,
                
                -- NOTA FINAL (promedio de teoría y práctica)
                ROUND(
                    (ROUND(AVG(pte.puntaje_teorico_total / NULLIF(pte.total_preguntas_teoricas, 0)), 2) +
                     ROUND(AVG((ppe.puntaje_practico_obtenido / NULLIF(ppe.puntaje_maximo_practico, 0)) * 100), 2)) / 2, 2
                ) AS nota_final,
                
                -- APROBADO (nota final >= 61%)
                CASE 
                    WHEN (ROUND(AVG(pte.puntaje_teorico_total / NULLIF(pte.total_preguntas_teoricas, 0)), 2) +
                          ROUND(AVG((ppe.puntaje_practico_obtenido / NULLIF(ppe.puntaje_maximo_practico, 0)) * 100), 2)) / 2 >= 61 
                    THEN 'APROBADO'
                    ELSE 'NO APROBADO'
                END AS estado
                
            FROM CENTRO c
            INNER JOIN UBICACION u ON c.id_centro = u.centro_id_centro
            INNER JOIN ESCUELA e ON u.escuela_id_escuela = e.id_escuela
            INNER JOIN REGISTRO r ON r.ubicacion_escuela_id_escuela = e.id_escuela 
                                  AND r.ubicacion_centro_id_centro = c.id_centro
            INNER JOIN EXAMEN ex ON ex.registro_id_registro = r.id_registro
            LEFT JOIN puntaje_teorico_por_examen pte ON pte.id_examen = ex.id_examen
            LEFT JOIN puntaje_practico_por_examen ppe ON ppe.id_examen = ex.id_examen
            GROUP BY c.id_centro, c.nombre, e.id_escuela, e.nombre
            ORDER BY c.nombre, e.nombre
        `;
        
        const result = await db.execute(sql);
        
        // Verificar si hay resultados
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos de evaluaciones',
                data: []
            });
        }
        
        // Enviar respuesta exitosa
        res.json({
            success: true,
            message: 'Estadísticas obtenidas correctamente',
            nota_aprobatoria: '61%',
            totalRegistros: result.rows.length,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error en consulta de estadísticas centro-escuela:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            detalles: error.message
        });
    }
});

// CONSULTA 2: Ranking de evaluados por resultado final
// Muestra: Puesto, evaluado, género, tipo de licencia, centro, escuela,
//          total exámenes, promedios, nota final y estado
// Ordenado por nota final (mayor a menor, NULLs al final)

app.get('/api/estadisticas/ranking-evaluados', async (req, res) => {
    try {
        const sql = `
            WITH 
            -- 1. Calcular el puntaje máximo teórico por examen (cada pregunta vale 100%)
            puntaje_teorico_por_examen AS (
                SELECT 
                    ex.id_examen,
                    COUNT(DISTINCT ru.pregunta_id_pregunta) AS total_preguntas_teoricas,
                    SUM(CASE WHEN ru.respuesta = p.respuesta_correcta THEN 100 ELSE 0 END) AS puntaje_teorico_total
                FROM EXAMEN ex
                LEFT JOIN RESPUESTA_USUARIO ru ON ru.examen_id_examen = ex.id_examen
                LEFT JOIN PREGUNTAS p ON ru.pregunta_id_pregunta = p.id_pregunta
                GROUP BY ex.id_examen
            ),

            -- 2. Calcular el puntaje máximo práctico por examen
            puntaje_practico_por_examen AS (
                SELECT 
                    ex.id_examen,
                    SUM(pp.punteo) AS puntaje_maximo_practico,
                    SUM(rpu.nota) AS puntaje_practico_obtenido
                FROM EXAMEN ex
                LEFT JOIN RESPUESTA_PRACTICO_USUARIO rpu ON rpu.examen_id_examen = ex.id_examen
                LEFT JOIN PREGUNTAS_PRACTICO pp ON rpu.pregunta_practico_id_pregunta_practico = pp.id_pregunta_practico
                GROUP BY ex.id_examen
            ),

            -- 3. Calcular nota final por examen (usando el mismo método que Consulta 1)
            nota_final_por_examen AS (
                SELECT 
                    ex.id_examen,
                    ex.registro_id_registro,
                    ROUND(COALESCE(pte.puntaje_teorico_total, 0) / NULLIF(pte.total_preguntas_teoricas, 0), 2) AS promedio_teorico,
                    ROUND((COALESCE(ppe.puntaje_practico_obtenido, 0) / NULLIF(ppe.puntaje_maximo_practico, 0)) * 100, 2) AS promedio_practico,
                    ROUND(
                        (ROUND(COALESCE(pte.puntaje_teorico_total, 0) / NULLIF(pte.total_preguntas_teoricas, 0), 2) +
                         ROUND((COALESCE(ppe.puntaje_practico_obtenido, 0) / NULLIF(ppe.puntaje_maximo_practico, 0)) * 100, 2)) / 2, 2
                    ) AS nota_final
                FROM EXAMEN ex
                LEFT JOIN puntaje_teorico_por_examen pte ON pte.id_examen = ex.id_examen
                LEFT JOIN puntaje_practico_por_examen ppe ON ppe.id_examen = ex.id_examen
            )

            -- 4. Ranking final: NULL al final
            SELECT 
                ROW_NUMBER() OVER (ORDER BY 
                    CASE WHEN AVG(nfe.nota_final) IS NULL THEN 1 ELSE 0 END,
                    AVG(nfe.nota_final) DESC NULLS LAST
                ) AS puesto,
                r.nombre_completo AS evaluado,
                r.genero,
                r.tipo_licencia,
                c.nombre AS centro,
                e.nombre AS escuela,
                COUNT(DISTINCT nfe.id_examen) AS total_examenes,
                ROUND(AVG(nfe.promedio_teorico), 2) AS promedio_teorico,
                ROUND(AVG(nfe.promedio_practico), 2) AS promedio_practico,
                ROUND(AVG(nfe.nota_final), 2) AS nota_final,
                CASE 
                    WHEN AVG(nfe.nota_final) >= 61 THEN 'APROBADO'
                    WHEN AVG(nfe.nota_final) IS NULL THEN 'SIN DATOS'
                    ELSE 'NO APROBADO'
                END AS estado
            FROM REGISTRO r
            INNER JOIN EXAMEN ex ON ex.registro_id_registro = r.id_registro
            INNER JOIN nota_final_por_examen nfe ON nfe.id_examen = ex.id_examen
            INNER JOIN CENTRO c ON r.ubicacion_centro_id_centro = c.id_centro
            INNER JOIN ESCUELA e ON r.ubicacion_escuela_id_escuela = e.id_escuela
            GROUP BY r.nombre_completo, r.genero, r.tipo_licencia, c.nombre, e.nombre
            ORDER BY 
                CASE WHEN AVG(nfe.nota_final) IS NULL THEN 1 ELSE 0 END,
                AVG(nfe.nota_final) DESC NULLS LAST
        `;
        
        const result = await db.execute(sql);
        
        // Verificar si hay resultados
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos de evaluados',
                data: []
            });
        }
        
        // Enviar respuesta exitosa
        res.json({
            success: true,
            message: 'Ranking de evaluados obtenido correctamente',
            nota_aprobatoria: '61%',
            totalEvaluados: result.rows.length,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error en consulta de ranking de evaluados:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            detalles: error.message
        });
    }
});
// 3. Análisis de dificultad de preguntas
app.get('/api/estadisticas/dificultad-preguntas', async (req, res) => {
    try {
        const sql = `
            WITH 
            estadisticas_preguntas AS (
                SELECT 
                    p.id_pregunta,
                    p.pregunta_texto,
                    p.respuesta_a,
                    p.respuesta_b,
                    p.respuesta_c,
                    p.respuesta_d,
                    p.respuesta_correcta,
                    COUNT(ru.id_resp_user) AS total_respuestas,
                    SUM(CASE WHEN ru.respuesta = p.respuesta_correcta THEN 1 ELSE 0 END) AS respuestas_correctas,
                    ROUND(
                        (SUM(CASE WHEN ru.respuesta = p.respuesta_correcta THEN 1 ELSE 0 END) * 100.0) / 
                        NULLIF(COUNT(ru.id_resp_user), 0), 2
                    ) AS porcentaje_aciertos
                FROM PREGUNTAS p
                LEFT JOIN RESPUESTA_USUARIO ru ON ru.pregunta_id_pregunta = p.id_pregunta
                GROUP BY p.id_pregunta, p.pregunta_texto, p.respuesta_a, p.respuesta_b, p.respuesta_c, p.respuesta_d, p.respuesta_correcta
            )
            SELECT 
                ep.id_pregunta,
                ep.pregunta_texto,
                ep.respuesta_a,
                ep.respuesta_b,
                ep.respuesta_c,
                ep.respuesta_d,
                ep.respuesta_correcta,
                ep.total_respuestas,
                ep.respuestas_correctas,
                ep.porcentaje_aciertos,
                CASE 
                    WHEN ep.porcentaje_aciertos >= 80 THEN 'MUY FÁCIL'
                    WHEN ep.porcentaje_aciertos >= 60 THEN 'FÁCIL'
                    WHEN ep.porcentaje_aciertos >= 40 THEN 'MEDIO'
                    WHEN ep.porcentaje_aciertos >= 20 THEN 'DIFÍCIL'
                    ELSE 'MUY DIFÍCIL'
                END AS nivel_dificultad
            FROM estadisticas_preguntas ep
            WHERE ep.total_respuestas > 0
            ORDER BY ep.porcentaje_aciertos ASC NULLS LAST
        `;
        
        const result = await db.execute(sql);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos de preguntas',
                data: []
            });
        }
        
        // Calcular la pregunta más difícil
        const menorPorcentaje = result.rows[0]?.PORCENTAJE_ACIERTOS;
        const preguntasMasDificiles = result.rows.filter(row => row.PORCENTAJE_ACIERTOS === menorPorcentaje);
        
        res.json({
            success: true,
            message: 'Análisis de dificultad de preguntas obtenido correctamente',
            totalPreguntas: result.rows.length,
            preguntaMasDificil: {
                id_pregunta: preguntasMasDificiles[0].ID_PREGUNTA,
                pregunta_texto: preguntasMasDificiles[0].PREGUNTA_TEXTO,
                respuesta_correcta: preguntasMasDificiles[0].RESPUESTA_CORRECTA,
                porcentaje_aciertos: preguntasMasDificiles[0].PORCENTAJE_ACIERTOS,
                nivel_dificultad: preguntasMasDificiles[0].NIVEL_DIFICULTAD
            },
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            detalles: error.message
        });
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