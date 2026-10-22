# 02 · Los 14 proyectos

Cada ficha tiene: **problema de negocio**, **datos**, **arquitectura**, **features de Databricks**,
**Genie**, **MVP** (obligatorio), **extras** (si sobra tiempo), **certificación** y **gancho para LinkedIn**.

Convención de nombres: catálogo `ma_dev` (y `ma_prod` el día 14), esquemas `<dominio>_<capa>`.

---

## Día 1 · Fundación del Lakehouse gobernado

**Problema.** Mercado Austral tiene datos dispersos en sistemas fuente; necesita una plataforma única, gobernada y reproducible.

**Datos.** Maestros: `customers` (~200k), `products` (~20k), `sellers` (~5k), `stores/warehouses` (~50), `calendar` (con feriados por país y eventos: Hot Sale, CyberMonday, Black Friday, Navidad), `fx_rates` diarios.

**Arquitectura.** ADLS Gen2 → Access Connector → Storage Credential → External Locations → catálogos `ma_dev`/`ma_prod` → esquemas por dominio/capa → Volume `landing`.

**Features.** Unity Catalog, managed vs external, Volumes, grupos y `GRANT`, comentarios en tablas/columnas, tags, Databricks Asset Bundles (esqueleto del monorepo), Git folders conectados a GitHub.

**Genie — "Catálogo maestro".** Tablas maestras. Preguntas: *"¿Cuántos vendedores activos hay por país?"*, *"¿Qué categorías tienen más productos?"*. Objetivo del día: entender que **Genie es tan bueno como la metadata** (comentarios, nombres, tipos).

**MVP.** Infra creada, permisos funcionando, maestros cargados con comentarios, bundle desplegando un job trivial, Genie respondiendo 5 preguntas.
**Extras.** Infra en Terraform/Bicep; script que valida permisos por grupo.
**Certificación.** DE Associate (UC, permisos, workspace).
**Gancho.** *"Antes de escribir una sola línea de ETL, diseñé el gobierno. Este es el porqué."*

---

## Día 2 · Ventas e-commerce con arquitectura Medallion

**Problema.** Las órdenes llegan como archivos JSON/CSV desde el e-commerce, con cambios de esquema y duplicados. Negocio quiere ventas diarias confiables.

**Datos.** `orders` y `order_items` (~5M filas, 18 meses), llegan en lotes por hora al Volume; en el mes 12 se agrega una columna nueva (schema drift); 1–2% duplicados; clientes que cambian de dirección (para SCD2).

**Arquitectura.** Volume `landing/orders` → Auto Loader → `bronze` (raw + metadata de archivo) → `silver` (tipado, dedupe, MERGE) → `gold` (`fct_sales`, `dim_customer` SCD2, `agg_sales_daily`).

**Features.** Auto Loader con schema evolution y `_rescued_data`, `MERGE INTO`, SCD2 manual, liquid clustering, `OPTIMIZE`, time travel para auditar, Job con trigger `availableNow`.

**Genie — "Ventas v1".** Tablas gold. Preguntas: *"Ventas netas por país el último Hot Sale vs el anterior"*, *"Top 10 productos por margen en Chile"*. Escribí las primeras **instrucciones** (definición de venta neta, moneda, zona horaria).

**MVP.** Pipeline bronze→gold idempotente (correrlo 2 veces da el mismo resultado), SCD2 probado, Genie v1.
**Extras.** Comparar tiempos con/sin liquid clustering; tests con `pytest` sobre funciones de transformación.
**Certificación.** DE Associate.
**Gancho.** *"Corrí mi pipeline dos veces a propósito. Si los números cambian, no es un pipeline: es una lotería."*

---

## Día 3 · Pipeline declarativo con calidad de datos y CDC

**Problema.** La base operacional de pagos/órdenes publica un **feed CDC** (insert/update/delete). Hay registros inválidos que hoy contaminan los reportes.

**Datos.** Feed CDC de `payments` y `order_status` con columnas `op` (`I/U/D`), `sequence_num`, `event_ts`; eventos fuera de orden; 3% de registros inválidos (montos negativos, monedas inexistentes, fechas futuras).

**Arquitectura.** Lakeflow Declarative Pipeline: streaming table bronze → `AUTO CDC` a silver (SCD1 para estado actual, SCD2 para historial) → materialized views gold; tabla de cuarentena.

**Features.** Lakeflow Declarative Pipelines (SQL o Python), expectations (`warn`, `drop`, `fail`), `AUTO CDC`/`APPLY CHANGES`, event log del pipeline, modo development vs production, serverless pipelines.

**Genie — "Calidad de datos".** Sobre el *event log* + cuarentena. Preguntas: *"¿Qué regla de calidad descartó más registros esta semana?"*, *"¿Qué porcentaje de pagos de MX falló validación?"*. → Genie para el equipo de **Data Ops** (tu perfil).

**MVP.** Pipeline con ≥5 expectations, CDC funcionando con eventos desordenados y deletes, tabla de métricas de calidad, Genie.
**Extras.** Alerta SQL cuando la tasa de descarte supere un umbral.
**Certificación.** DE Associate / Professional.
**Gancho.** *"Mi pipeline rechaza datos. Y eso es lo mejor que hace."*

---

## Día 4 · Detección de fraude en tiempo (casi) real

**Problema.** Fintech de Mercado Austral necesita marcar transacciones sospechosas en minutos, no al día siguiente.

**Datos.** Stream de `card_transactions` (productor Python que emite eventos: por archivos al Volume o a **Event Hubs con endpoint Kafka**). Patrones de fraude inyectados: muchas transacciones en ventana corta, país imposible (dos países en 10 min), montos atípicos, comercio de alto riesgo. ~1% fraude etiquetado.

**Arquitectura.** Fuente → Structured Streaming → bronze → enriquecimiento (join con `dim_customer`) → ventanas con watermark → reglas → `fraud_alerts` (gold) → Genie.

**Features.** Structured Streaming, watermarks, ventanas tumbling/sliding, stream-static join, stream-stream join (transacción ↔ confirmación), `foreachBatch` + MERGE, checkpoints, triggers.

**Genie — "Riesgo y fraude".** Preguntas: *"¿Cuántas alertas por regla en la última hora?"*, *"Clientes con más de 3 alertas este mes"*, *"Tasa de falsos positivos por regla"*. Trusted asset: función SQL `fraud_rate(country, from, to)`.

**MVP.** Stream corriendo, 3 reglas, tabla de alertas, Genie.
**Extras.** Event Hubs real; comparar latencia `availableNow` vs `processingTime`; dashboard que se refresca.
**Certificación.** DE Professional.
**Gancho.** *"Un fraude detectado mañana es un fraude que ya pasó."*

---

## Día 5 · Logística y cadena de frío (IoT)

**Problema.** Envíos con productos refrigerados: hay que detectar quiebres de temperatura y medir el cumplimiento de SLA de entrega.

**Datos.** `shipments`, `shipment_events` (estados) y telemetría de sensores (`gps`, `temperature`) cada 30–60 s por camión. Eventos que llegan **tarde** (camión sin señal), duplicados, sensores que fallan (valores congelados).

**Arquitectura.** Telemetría → bronze streaming → silver (dedupe con watermark, interpolación, detección de sensor congelado) → gold: `sla_daily`, `cold_chain_breaches`, `delivery_performance` por zona H3.

**Features.** Manejo de *late data*, `dropDuplicatesWithinWatermark`, funciones H3 nativas de Databricks SQL, window functions, `availableNow` incremental.

**Genie — "Operaciones logísticas".** Preguntas: *"¿Qué zonas de Santiago tienen peor cumplimiento de SLA?"*, *"Envíos con quiebre de frío de más de 15 min ayer"*. Instrucción clave: definición exacta de "SLA cumplido".

**MVP.** SLA y quiebres de frío calculados correctamente con datos tardíos, Genie.
**Extras.** Mapa en AI/BI Dashboard por hexágono H3.
**Certificación.** DE Professional.
**Gancho.** *"El 8% de mis eventos llegó tarde. Así hice que no me mintieran los KPIs."*

---

## Día 6 · Capa semántica, Dashboards y Genie de nivel experto

**Problema.** Cada área calcula "ventas" distinto. Hace falta **una sola definición** y que Genie la use.

**Datos.** Reutiliza gold de días 2–5.

**Arquitectura.** Modelo estrella (`fct_sales`, `dim_customer`, `dim_product`, `dim_date`, `dim_seller`) con **PK/FK** declaradas → **Metric Views** (venta neta, margen, ticket promedio, conversión, GMV) → AI/BI Dashboard + Genie sobre metric views.

**Features.** Constraints PK/FK, Metric Views en UC, AI/BI Dashboards (filtros, parámetros, drill), **Genie benchmarks**.

**Genie — "Ventas v2".** Este es el día de **medir Genie**: correr los benchmarks de Ventas v1 → ajustar (metric views, instrucciones, ejemplos, funciones) → volver a correr. Documentar la precisión **antes / después**.

**MVP.** Metric views con ≥6 métricas, dashboard de 1 página, benchmark con ≥20 preguntas y la mejora documentada.
**Extras.** Alertas SQL; versión del dashboard para ejecutivos.
**Certificación.** Data Analyst Associate.
**Gancho.** *"Mi Genie acertaba 12 de 20 preguntas. Cambié 3 cosas y pasó a 19 de 20."* (con tus números reales)

---

## Día 7 · Gobierno y seguridad de datos sensibles (RRHH)

**Problema.** RRHH quiere analítica de nómina y rotación, pero salarios y datos personales no pueden verlos todos.

**Datos.** `employees` (~8k), `payroll` mensual, `performance_reviews`, `terminations`. PII: DNI/RUT/CURP, email, salario, dirección.

**Arquitectura.** Silver/gold de RRHH con **column masks** (PII), **row filters** (cada gerente ve su país/área), tags `pii`/`confidential`, vistas para analistas → Genie.

**Features.** Row filters, column masks, funciones `is_account_group_member`, tags, ABAC/políticas por tags (si está disponible), lineage, `system.access.audit`.

**Genie — "RRHH".** Demostración clave: **la misma pregunta hecha por dos usuarios distintos devuelve respuestas distintas** (Genie respeta los permisos de UC). Preguntas: *"Rotación anual por área"*, *"Salario promedio por seniority"*.

**MVP.** 2 masks + 1 row filter, prueba con 2 usuarios/grupos, consulta de auditoría, Genie.
**Extras.** Reporte automático de "quién accedió a PII" desde system tables.
**Certificación.** DE Professional (seguridad y gobierno).
**Gancho.** *"Le pregunté lo mismo a Genie con dos usuarios. Respondió distinto. Y está perfecto."*

---

## Día 8 · Voz del cliente con AI Functions

**Problema.** Miles de tickets y transcripciones de llamadas sin leer. Negocio quiere saber **por qué** se quejan los clientes.

**Datos.** `support_tickets` (~50k, texto libre en español con modismos de cada país), `call_transcripts` (~5k). Generados con plantillas + LLM (ver `04-datos-simulados.md`).

**Arquitectura.** Texto crudo → silver → enriquecimiento batch con AI Functions (categoría, sentimiento, producto mencionado, urgencia, resumen) → gold `ticket_insights` unido a ventas/logística → Genie.

**Features.** `ai_classify`, `ai_analyze_sentiment`, `ai_extract`, `ai_summarize`, `ai_query` con salida estructurada, batch inference, control de costo (probar con muestra antes de todo el volumen).

**Genie — "Voz del cliente".** Preguntas: *"Principales motivos de queja por país este mes"*, *"¿Los clientes con envíos tarde tienen peor sentimiento?"* (cruce con día 5).

**MVP.** 4 enriquecimientos, validación manual de 50 tickets (precisión de la clasificación), Genie.
**Extras.** Comparar dos modelos en `ai_query` (calidad vs costo).
**Certificación.** GenAI Engineer Associate.
**Gancho.** *"Clasifiqué 50.000 tickets con SQL. Sin entrenar un modelo."*

---

## Día 9 · Predicción de churn

**Problema.** Marketing necesita saber qué clientes están por irse para actuar antes.

**Datos.** Features derivadas de ventas, soporte, logística: recencia, frecuencia, monto (RFM), tickets abiertos, sentimiento promedio, entregas tarde. Etiqueta: sin compras en 90 días.

**Arquitectura.** Feature tables en UC (point-in-time correctas) → entrenamiento con MLflow (baseline + LightGBM/XGBoost) → modelo registrado en UC con alias `@champion` → scoring batch → `customer_churn_scores` → Genie.

**Features.** Feature Engineering en UC, `FeatureLookup`, MLflow tracking, autolog, Model Registry en UC, aliases, AutoML como baseline.

**Genie — "Retención".** Preguntas: *"Clientes de alto valor con riesgo de churn > 70% en Buenos Aires"*, *"¿Qué segmento concentra más riesgo?"*.

**MVP.** Modelo registrado, métricas documentadas (AUC, precision@k), scores en gold, Genie.
**Extras.** SHAP para explicar el top 3 de factores.
**Certificación.** ML Associate.
**Gancho.** *"Mi modelo no termina en un notebook: termina en una pregunta que cualquier gerente puede hacer."*

---

## Día 10 · Forecast de demanda y MLOps

**Problema.** Abastecimiento necesita forecast por SKU y depósito para no quedarse sin stock en eventos.

**Datos.** Ventas diarias por SKU × depósito (de día 2), stock, eventos de calendario.

**Arquitectura.** Many-models (un modelo por serie con `applyInPandas`) → MLflow → modelo en UC → **Model Serving** (endpoint con scale-to-zero) + scoring batch → **monitoreo** (Lakehouse Monitoring: drift y calidad de predicción) → job de reentrenamiento.

**Features.** Pandas UDF / `applyInPandas`, MLflow, Model Serving, inference tables, Lakehouse Monitoring, Lakeflow Jobs condicionales.

**Genie — "Abastecimiento".** Preguntas: *"SKUs con riesgo de quiebre de stock para el próximo Black Friday"*, *"Error del forecast por categoría (MAPE)"*.

**MVP.** Forecast de ~200 series, endpoint funcionando, monitor creado, Genie.
**Extras.** Reentrenamiento automático si el MAPE supera un umbral.
**Certificación.** ML Professional.
**Gancho.** *"Entrenar el modelo fue el 20% del trabajo. Este es el otro 80%."*

---

## Día 11 · Asistente RAG de políticas internas

**Problema.** Atención al cliente pierde tiempo buscando políticas (devoluciones, garantías, envíos por país).

**Datos.** ~40 documentos internos ficticios (PDF/Markdown): políticas de devolución por país, términos de envío, garantías, FAQ, manual de procedimientos. Con contradicciones intencionales entre versiones (para probar el manejo de versiones).

**Arquitectura.** Volume `docs` → parsing y chunking → tabla Delta con CDF → **Vector Search** (Delta Sync index) → agente con retriever (Agent Framework) → evaluación con MLflow (jueces LLM + set de evaluación propio) → endpoint.

**Features.** Vector Search, embeddings (Foundation Model APIs), Agent Framework, MLflow 3 evaluation y tracing, Review App; Agent Bricks *Knowledge Assistant* como alternativa no-code (si está disponible).

**Genie.** Este día no es Genie: es la **pieza no estructurada** que el supervisor del día 12 va a combinar con los Genie spaces.

**MVP.** Índice, agente con citas a la fuente, set de evaluación de 25 preguntas con métricas.
**Extras.** Comparar 2 estrategias de chunking con métricas.
**Certificación.** GenAI Engineer Associate.
**Gancho.** *"Mi RAG respondía con seguridad cosas falsas. Así lo medí y lo corregí."*

---

## Día 12 · Agente supervisor multi-Genie (el centro de todo)

**Problema.** Un ejecutivo pregunta *"¿Por qué cayeron las ventas en Chile la semana pasada?"*. La respuesta está repartida: ventas, logística, soporte, fraude, políticas.

**Arquitectura.** Supervisor → tools:
- Genie Ventas (día 6), Genie Logística (día 5), Genie Fraude (día 4), Genie Voz del cliente (día 8), Genie Retención (día 9)
- Agente RAG de políticas (día 11)
- UC functions como herramientas determinísticas (ej. `get_kpi(metric, country, period)`)

Dos caminos (elegí uno según disponibilidad):
1. **Agent Bricks – Multi-Agent Supervisor** (configuración, pocos minutos).
2. **Código**: Agent Framework + LangGraph/OpenAI SDK + **Genie Conversation API**, registrado con MLflow y servido en Model Serving.

**Features.** Genie Conversation API, Agent Framework, tool calling, MLflow tracing, evaluación del agente, UC functions.

**MVP.** Supervisor con ≥3 Genie spaces + RAG, 15 preguntas de evaluación multi-dominio, trazas mostrando qué tool usó.
**Extras.** Las dos implementaciones y comparación.
**Certificación.** GenAI Engineer Associate.
**Gancho.** *"Conecté 5 Genie spaces y un RAG detrás de un solo agente. Esta es la pregunta que ningún dashboard podía responder."*

---

## Día 13 · Databricks App: Copiloto ejecutivo

**Problema.** Los ejecutivos no van a abrir un workspace. Necesitan una app.

**Arquitectura.** Databricks App (Streamlit, Dash o Gradio) con: chat al supervisor del día 12, panel con el AI/BI Dashboard embebido, botón 👍/👎 que guarda feedback en una tabla Delta (o en Lakebase si está disponible) → feedback alimenta los benchmarks de Genie.

**Features.** Databricks Apps, autenticación del usuario (on-behalf-of), Genie Conversation API, SQL connector, service principals, permisos de la app.

**MVP.** App desplegada, chat funcionando, feedback guardado, **video demo de 60–90 s**.
**Extras.** Historial de conversaciones por usuario.
**Certificación.** GenAI Engineer Associate / Data Analyst.
**Gancho.** Video. *"Así se ve una plataforma de datos para alguien que no sabe SQL."*

---

## Día 14 · Plataforma productiva + FinOps y Observabilidad

**Problema.** Todo lo anterior tiene que poder desplegarse de forma repetible y alguien tiene que vigilar costos y fallas. (Tu perfil: monitoreo de procesos.)

**Arquitectura.**
- **CI/CD**: monorepo → GitHub Actions → `databricks bundle validate/deploy` a `dev` y `prod` (targets del bundle) con service principal.
- **Orquestación**: un Lakeflow Job maestro con dependencias entre proyectos, reintentos, notificaciones.
- **Observabilidad**: system tables (`system.billing.usage`, `system.billing.list_prices`, `system.lakeflow.*`, `system.query.history`, `system.access.audit`) → gold `platform_costs`, `job_reliability` → dashboard + alertas.

**Genie — "FinOps / Observabilidad".** Preguntas: *"¿Cuánto costó cada proyecto en DBUs?"*, *"¿Qué job falló más veces y por qué?"*, *"¿Qué consultas de Genie fueron las más caras?"*.

**MVP.** Pipeline de CI/CD verde, job maestro, dashboard de costos, Genie FinOps, **costo total de los 14 días** documentado.
**Extras.** Tests automáticos en el CI; alertas por presupuesto.
**Certificación.** DE Professional.
**Gancho.** *"14 días, 14 proyectos. Esto costó cada uno — y esto aprendí."* (cierre de la serie)

---

## Si te atrasás: qué se puede recortar

| Prioridad | Qué |
|---|---|
| No negociable | MVP de cada día, Genie space, README, diagrama |
| Recortable | Extras, Event Hubs real (usar archivos), Terraform (usar UI + script), segunda implementación del día 12 |
| Mover a Free Edition | Días 8, 9 y 11 se pueden terminar/pulir en Free Edition después del trial si hace falta |
