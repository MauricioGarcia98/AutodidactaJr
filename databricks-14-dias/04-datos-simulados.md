# 04 · Datos simulados realistas

"Datos simulados reales" = datos falsos que **se comportan** como datos reales:
tienen estacionalidad, desigualdad, relaciones coherentes, errores y eventos raros.
Si tus datos son uniformes y limpios, tu proyecto parece de juguete aunque la arquitectura sea buena.

---

## 1. El universo: Mercado Austral

| Parámetro | Valor sugerido |
|---|---|
| Países | AR (40%), MX (25%), CO (15%), CL (12%), UY (8%) |
| Monedas | ARS, MXN, COP, CLP, UYU + tabla `fx_rates` diaria a USD (ARS con tendencia inflacionaria) |
| Período | 18 meses de historia + "presente" simulado durante el trial |
| Clientes | ~200k |
| Productos | ~20k en ~40 categorías |
| Vendedores | ~5k |
| Órdenes | ~2M órdenes / ~5M ítems |
| Empleados | ~8k |
| Tickets | ~50k |

Todos los datasets comparten claves (`customer_id`, `product_id`, `seller_id`, `order_id`, `shipment_id`),
así los proyectos se cruzan entre sí.

## 2. Reglas de realismo (implementarlas en el generador)

| Fenómeno real | Cómo simularlo |
|---|---|
| Pocos clientes compran mucho | Distribución Pareto / lognormal para frecuencia y monto |
| Pocos productos venden mucho | Popularidad Zipf por producto |
| Estacionalidad | Multiplicadores por día de semana, mes, quincena/aguinaldo, eventos (Hot Sale, CyberMonday, Black Friday, Buen Fin en MX, Navidad) |
| Horario | Más órdenes 12–14 h y 20–23 h (hora local) |
| Crecimiento | Tendencia mensual +2–4% |
| Precios | Precio por producto con variación, descuentos en eventos, inflación en ARS |
| Geografía | Ciudades reales con pesos por población; coordenadas para H3 |
| Logística | Tiempo de entrega según distancia y país; peor en eventos |
| Churn | Probabilidad de abandono que sube con entregas tarde y tickets negativos (así el modelo del día 9 tiene señal real) |
| Fraude | Patrones específicos inyectados y etiquetados (~1%) |

## 3. Suciedad controlada (y documentada)

Cada problema se inyecta **a propósito, con una tasa conocida**, para poder demostrar que el pipeline lo detecta:

| Problema | Tasa | Lo detecta |
|---|---|---|
| Duplicados exactos | 1–2% | Día 2 (dedupe) |
| Schema drift (columna nueva) | desde mes 12 | Día 2 (Auto Loader) |
| Valores inválidos (montos negativos, monedas raras, fechas futuras) | 3% | Día 3 (expectations) |
| Eventos CDC fuera de orden | 5% | Día 3 (`AUTO CDC` con `sequence_num`) |
| Eventos tardíos | 8% | Día 5 (watermarks) |
| Sensores congelados | 0,5% de sensores | Día 5 |
| Categorías inconsistentes (`"AR"`, `"arg"`, `"Argentina "`) | 2% | Día 2/6 (estandarización para Genie) |
| PII en texto libre (emails/teléfonos en tickets) | 5% de tickets | Día 7/8 |

Guardá un archivo `datagen/ground_truth.yaml` con las tasas reales: después comparás *lo inyectado* vs *lo detectado*
→ excelente contenido para README y LinkedIn.

## 4. Herramientas

- **Python + Faker** (`es_AR`, `es_MX`, `es_CO`, `es_CL`) para nombres, direcciones, empresas.
- **NumPy** para distribuciones (Pareto, lognormal, Poisson para llegadas).
- **dbldatagen** (Databricks Labs) para generar volumen grande directamente en Spark.
- **LLM** (en Databricks: `ai_query` / Foundation Model APIs; o fuera) para texto: tickets, transcripciones, documentos de políticas. Usar plantillas + variables (producto, país, problema, tono) para que haya diversidad y que la "verdad" (categoría real) quede guardada para evaluar.
- **Semilla fija** (`seed=42`) en todo → reproducible.

## 5. Estructura del generador (paquete compartido)

```
datagen/
├── config.yaml              # países, tamaños, fechas, tasas de suciedad
├── ground_truth.yaml        # lo que se inyectó (se genera)
├── mercado_austral/
│   ├── masters.py           # customers, products, sellers, calendar, fx_rates
│   ├── sales.py             # orders, order_items (estacionalidad, Pareto)
│   ├── cdc.py               # feed CDC de payments / order_status
│   ├── streaming.py         # productor de transacciones (archivos o Kafka)
│   ├── iot.py               # telemetría de camiones
│   ├── hr.py                # empleados, nómina, evaluaciones
│   ├── text.py              # tickets, transcripciones, políticas
│   └── dirty.py             # funciones de inyección de suciedad
└── cli.py                   # python -m datagen.cli generate --dataset sales --out ./out
```

## 6. Dónde generar

- **Antes del trial**: maestros, ventas históricas, CDC, RRHH, documentos → archivos Parquet/JSON/CSV listos para subir al Volume.
- **Durante el trial**: solo los productores de streaming (días 4 y 5) y el texto si lo generás con `ai_query`.
- **Formato de llegada**: imitá sistemas reales — JSON del e-commerce, CSV de RRHH (con `;` y coma decimal en AR), CDC en JSON tipo Debezium.

## 7. Aviso de honestidad para los READMEs

Todos los README incluyen: *"Los datos son 100% sintéticos, generados con [generador], con patrones y errores
inyectados intencionalmente. No representan a ninguna empresa real."* Es transparente y además muestra criterio.
