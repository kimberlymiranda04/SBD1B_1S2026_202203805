-- CONSULTA 1
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
ORDER BY c.nombre, e.nombre;