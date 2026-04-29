-- CONSULTA 2: Ranking de evaluados por resultado final
-- mayor a menor Los NULL van al final del ranking
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

-- 3. Calcular nota final por examen 
nota_final_por_examen AS (
    SELECT 
        ex.id_examen,
        ex.registro_id_registro,
        -- PROMEDIO TEÓRICO del examen 
        ROUND(COALESCE(pte.puntaje_teorico_total, 0) / NULLIF(pte.total_preguntas_teoricas, 0), 2) AS promedio_teorico,
        
        -- PROMEDIO PRÁCTICO del examen 
        ROUND((COALESCE(ppe.puntaje_practico_obtenido, 0) / NULLIF(ppe.puntaje_maximo_practico, 0)) * 100, 2) AS promedio_practico,
        
        -- NOTA FINAL del examen 
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
    AVG(nfe.nota_final) DESC NULLS LAST;