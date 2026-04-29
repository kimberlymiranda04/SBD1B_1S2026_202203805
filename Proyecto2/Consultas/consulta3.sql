--consulta 3
-- CONSULTA 3: Identificación de la pregunta con menor aciertos
-- Muestra: ID, pregunta, texto, total de respuestas, aciertos, porcentaje de aciertos
-- Ordenado de menor a mayor porcentaje de aciertos (pregunta más difícil primero)

WITH 
-- Calcular estadísticas por pregunta
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
        SUM(CASE WHEN ru.respuesta = p.respuesta_correcta THEN 1 ELSE 0 END) AS respuestas_correctas
    FROM PREGUNTAS p
    LEFT JOIN RESPUESTA_USUARIO ru ON ru.pregunta_id_pregunta = p.id_pregunta
    GROUP BY p.id_pregunta, p.pregunta_texto, p.respuesta_a, p.respuesta_b, p.respuesta_c, p.respuesta_d, p.respuesta_correcta
)

-- Seleccionar todas las preguntas con sus porcentajes
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
    ROUND(
        (ep.respuestas_correctas / NULLIF(ep.total_respuestas, 0)) * 100, 2
    ) AS porcentaje_aciertos,
    -- Nivel de dificultad basado en el porcentaje de aciertos
    CASE 
        WHEN (ep.respuestas_correctas / NULLIF(ep.total_respuestas, 0)) * 100 >= 80 THEN 'MUY FÁCIL'
        WHEN (ep.respuestas_correctas / NULLIF(ep.total_respuestas, 0)) * 100 >= 60 THEN 'FÁCIL'
        WHEN (ep.respuestas_correctas / NULLIF(ep.total_respuestas, 0)) * 100 >= 40 THEN 'MEDIO'
        WHEN (ep.respuestas_correctas / NULLIF(ep.total_respuestas, 0)) * 100 >= 20 THEN 'DIFÍCIL'
        ELSE 'MUY DIFÍCIL'
    END AS nivel_dificultad
FROM estadisticas_preguntas ep
ORDER BY porcentaje_aciertos ASC NULLS LAST;