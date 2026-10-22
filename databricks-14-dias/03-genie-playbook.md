# 03 · Genie Playbook

Genie (AI/BI Genie) traduce preguntas en lenguaje natural a SQL sobre tablas de Unity Catalog.
**No "entiende tu negocio" por arte de magia: entiende tu metadata.** Por eso es el centro de los proyectos:
obliga a hacer bien todo lo de abajo (modelado, nombres, documentación, calidad).

---

## 1. Anatomía de un espacio de Genie

| Componente | Qué es | Cómo usarlo bien |
|---|---|---|
| **Tablas / vistas / metric views** | Fuente de datos | Pocas y curadas (idealmente < 10; hay un límite máximo por espacio). Solo gold. |
| **SQL warehouse** | Donde corren las consultas | Serverless `2X-Small` con auto-stop |
| **Instrucciones generales** | Texto con reglas de negocio | Definiciones, unidades, zona horaria, sinónimos, qué NO hacer |
| **Ejemplos de SQL** | Pares pregunta → SQL correcto | Los cálculos difíciles (venta neta, cohortes, YoY) |
| **Funciones SQL (trusted assets)** | UC functions parametrizadas | Respuestas "certificadas" para métricas críticas |
| **Relaciones / joins** | Cómo se unen las tablas | PK/FK en las tablas o definidas en el espacio |
| **Preguntas de ejemplo** | Lo que ve el usuario al entrar | 4–6 preguntas que funcionan perfecto |
| **Benchmarks** | Set de evaluación pregunta → SQL esperado | Medir precisión antes y después de cada cambio |
| **Feedback / monitoreo** | 👍/👎 y conversaciones de usuarios | Fuente de nuevos ejemplos y benchmarks |

---

## 2. Preparar los datos para Genie (se hace en el pipeline, no en Genie)

1. **Nombres de negocio**: `fct_sales.net_amount_usd`, no `t_vta.mto2`.
2. **COMMENT en cada tabla y columna** explicando significado, unidad y valores posibles.
   ```sql
   COMMENT ON COLUMN ma_dev.ventas_gold.fct_sales.net_amount_usd IS
     'Venta neta en USD: precio - descuentos - devoluciones, convertida con fx del día de la orden. Excluye impuestos.';
   ```
3. **PK/FK declaradas** → Genie infiere joins correctos.
4. **Valores categóricos limpios y consistentes** (`'AR'`, no `'Argentina'`, `'arg'` y `'AR '` mezclados).
5. **Tablas anchas y desnormalizadas** o **metric views** para las métricas → menos joins = menos errores.
6. **Fechas como `DATE`/`TIMESTAMP`**, montos como `DECIMAL`, nunca strings.
7. Columnas técnicas (`_ingested_at`, `_file_name`) fuera de las vistas que usa Genie.

## 3. Instrucciones: plantilla

```text
Contexto: Mercado Austral es un marketplace que opera en AR, CL, UY, MX y CO.
Definiciones:
- "Ventas" o "facturación" = SUM(net_amount_usd) salvo que pidan moneda local.
- "Cliente activo" = cliente con al menos 1 compra en los últimos 90 días.
- "Hot Sale", "CyberMonday", "Black Friday": usar dim_date.event_name.
Reglas:
- Fechas en zona horaria del país de la orden.
- Si no se indica período, usar los últimos 30 días y decirlo.
- Excluir órdenes con status = 'CANCELLED' salvo pedido explícito.
- Redondear montos a 2 decimales.
Sinónimos: "seller" = "vendedor"; "SKU" = "producto".
```

## 4. Ciclo de mejora (lo que se documenta y se postea)

```
Escribir 20–30 benchmarks  →  correr  →  precisión X%
        ↑                                     │
        │                                     ▼
 agregar benchmark          analizar fallas: ¿falta metadata? ¿definición ambigua?
 por cada falla real        ¿join incorrecto? ¿métrica compleja?
        ↑                                     │
        └──────── aplicar UNA corrección ◄────┘
                  (comment / instrucción / ejemplo SQL / función / metric view)
```

Registrá en el README de cada proyecto una tabla así:

| Iteración | Cambio | Precisión benchmark |
|---|---|---|
| v0 | Tablas gold sin comentarios | 9/20 |
| v1 | COMMENT en columnas | 13/20 |
| v2 | Instrucciones de negocio | 16/20 |
| v3 | Metric view + 2 ejemplos SQL | 19/20 |

*(números ilustrativos: usá los tuyos)*

## 5. Tipos de benchmark que siempre tenés que incluir

- Agregación simple ("ventas totales de ayer")
- Filtro por dimensión con sinónimos ("facturación en Méjico")
- Ranking ("top 5 vendedores")
- Comparación temporal (YoY, MoM, evento vs evento)
- Métrica compuesta (margen, ticket promedio, tasa)
- Pregunta ambigua (Genie debería pedir aclaración o explicitar supuestos)
- Pregunta fuera de alcance (no debería inventar)
- Pregunta en "lenguaje de usuario real" con errores de tipeo

## 6. Genie fuera de la UI: Conversation API

Usada en los días 12 y 13. Flujo:
1. Iniciar conversación en un espacio (`space_id`) con una pregunta.
2. Consultar el mensaje hasta que esté completo.
3. Leer el SQL generado y el resultado de la consulta.
4. Hacer preguntas de seguimiento en la misma conversación.

Mantené un archivo `genie/spaces.yaml` con el `space_id` de cada espacio para que el agente y la app los encuentren.

## 7. Qué versionar en el repo por cada espacio

```
genie/
├── instructions.md        # instrucciones generales
├── example_queries.sql    # ejemplos pregunta → SQL
├── functions.sql          # UC functions usadas como trusted assets
├── sample_questions.md    # preguntas de ejemplo
├── benchmarks.yaml        # pregunta + SQL esperado
└── results.md             # tabla de precisión por iteración + capturas
```

> Si en tu workspace está disponible la exportación/importación de espacios por API, guardá también el JSON
> exportado. Si no, estos archivos son la fuente de verdad para recrear el espacio.
