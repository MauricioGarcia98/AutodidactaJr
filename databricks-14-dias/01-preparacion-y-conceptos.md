# 01 · Preparación, costos y conceptos

## 1. Cómo funciona el trial (y qué NO es gratis)

| Concepto | Qué incluye | Qué NO incluye |
|---|---|---|
| **Trial Premium de Azure Databricks (14 días)** | Las **DBUs** (la licencia de Databricks) de un workspace Premium | La **infraestructura de Azure**: VMs de los clusters, discos, IPs, storage, Event Hubs, etc. |
| **Cuenta gratuita de Azure** | Crédito (históricamente USD 200 por 30 días) que cubre la infraestructura | Cuotas altas: las cuentas gratuitas suelen tener **pocas vCPU por región** (≈4) |
| **Databricks Free Edition** | Workspace serverless gratis, sin vencimiento, con SQL, notebooks, pipelines, Genie, AI/BI | Clusters clásicos, integración con tu propio Azure (ADLS, Key Vault, Entra ID), escala |

> ⚠️ Las condiciones exactas (montos, días, qué cubre el descuento de serverless/Model Serving/Vector Search)
> cambian. **El día 0 verificá en el portal de Azure y en la página de pricing de Databricks** y anotá lo que
> encontraste en el README del proyecto 1 (también es contenido para LinkedIn).

### Estrategia de costos

1. **Activá el trial solo cuando el código esté listo.** Los 14 días corren desde que se crea el workspace con tier *Trial*.
2. **Preferí serverless** (SQL warehouse serverless, notebooks serverless, pipelines serverless): no consume tu cuota de vCPU y arranca en segundos.
3. Si usás clusters clásicos: **single node**, auto-terminación a **15 min**, VM chica (ej. `Standard_D4ds_v5`).
4. **SQL warehouse**: tamaño `2X-Small`, auto-stop a 5–10 min. Genie lo necesita (Pro o Serverless).
5. **Vector Search y Model Serving** cuestan por hora mientras existen: crearlos el día que se usan y **borrarlos al terminar** (o usar *scale to zero*).
6. Configurá en Azure Cost Management un **presupuesto con alertas** (50% / 80% / 100%).
7. Desde el día 1 consultá `system.billing.usage` (tabla de sistema) → materia prima del proyecto 14.
8. Si la cuota de vCPU te bloquea: pasar la suscripción a *Pay-As-You-Go* (conserva el crédito restante) y pedir aumento de cuota.
9. **Día 14 al final**: exportar todo a GitHub, borrar el workspace **y** su *managed resource group*, el storage y los Event Hubs.

---

## 2. Setup de Azure (día 0 / mañana del día 1)

```
Suscripción Azure
└── rg-mercadoaustral-dev
    ├── dbw-mercadoaustral        (Azure Databricks, pricing tier: Trial/Premium)
    ├── stmercadoaustral          (ADLS Gen2, hierarchical namespace ON)
    │   ├── landing/              (archivos crudos que "llegan" de sistemas fuente)
    │   └── lakehouse/            (managed storage de los catálogos)
    ├── ac-mercadoaustral         (Access Connector for Azure Databricks, identidad administrada)
    ├── kv-mercadoaustral         (Key Vault, opcional: secretos)
    └── evh-mercadoaustral        (Event Hubs Standard, opcional proyecto 4: endpoint Kafka)
```

Pasos clave en Unity Catalog:
1. Dar al Access Connector el rol **Storage Blob Data Contributor** sobre la cuenta ADLS.
2. Crear **Storage Credential** con ese Access Connector.
3. Crear **External Locations** para `landing/` y `lakehouse/`.
4. Crear catálogos `ma_dev` y `ma_prod` con *managed location* en `lakehouse/`.
5. Esquemas por dominio y capa: `ventas_bronze`, `ventas_silver`, `ventas_gold`… o un esquema por capa con prefijos de dominio (elegí uno y mantenelo).
6. Crear grupos: `data_engineers`, `analysts`, `hr_analysts`, `executives` (proyecto 7 los usa).
7. Crear un **Volume** `landing` para que el generador deje archivos.

Si te animás: todo esto en **Terraform** o **Bicep** (`infra/`). Suma mucho para nivel Professional, pero no es obligatorio.

---

## 3. Conceptos que tenés que dominar ANTES del día 1

Marcá cada uno cuando lo puedas explicar en voz alta en 2 minutos sin mirar.

### Plataforma y gobierno
- [ ] Arquitectura de Databricks: *control plane* vs *compute plane* (clásico vs serverless)
- [ ] Unity Catalog: metastore → catálogo → esquema → tabla/vista/volumen/función/modelo
- [ ] Tablas *managed* vs *external*; Volumes; Storage Credentials; External Locations
- [ ] Permisos: `GRANT`, ownership, herencia, `USE CATALOG` / `USE SCHEMA` / `SELECT`
- [ ] Row filters, column masks, tags, lineage, `system` tables

### Delta Lake
- [ ] Transaction log, ACID, time travel, `RESTORE`, `VACUUM`
- [ ] `MERGE INTO`, SCD tipo 1 y tipo 2
- [ ] Change Data Feed
- [ ] Liquid clustering vs particionado vs Z-ORDER; `OPTIMIZE`; Predictive Optimization
- [ ] Constraints: `NOT NULL`, `CHECK`, PK/FK informativas (Genie las usa para joins)

### Ingesta y procesamiento
- [ ] Auto Loader (`cloudFiles`): schema inference, schema evolution, `rescued_data`
- [ ] `COPY INTO` vs Auto Loader
- [ ] Structured Streaming: triggers (`availableNow`, `processingTime`), checkpoints, watermarks, output modes
- [ ] Lakeflow Declarative Pipelines (ex Delta Live Tables): streaming tables, materialized views, expectations, `AUTO CDC` (ex `APPLY CHANGES`)
- [ ] Lakeflow Jobs (ex Workflows): tareas, dependencias, parámetros, reintentos, triggers por archivo
- [ ] Databricks Asset Bundles (`databricks.yml`, targets dev/prod, `bundle deploy`/`run`)

### Analítica
- [ ] SQL warehouses (Pro vs Serverless), Query History, caching
- [ ] Modelado dimensional (hechos, dimensiones, granularidad)
- [ ] Metric Views de Unity Catalog
- [ ] AI/BI Dashboards
- [ ] **Genie**: espacios, instrucciones, ejemplos SQL, funciones como *trusted assets*, benchmarks, Conversation API → ver `03-genie-playbook.md`

### ML y GenAI
- [ ] MLflow: tracking, modelos en Unity Catalog, aliases (`@champion`), MLflow 3 evaluation
- [ ] Feature Engineering en UC (feature tables, `FeatureLookup`, point-in-time)
- [ ] Model Serving (endpoints, scale-to-zero, Foundation Model APIs)
- [ ] AI Functions: `ai_query`, `ai_classify`, `ai_extract`, `ai_analyze_sentiment`, `ai_summarize`
- [ ] Vector Search (Delta Sync index), chunking, embeddings
- [ ] Mosaic AI Agent Framework, tools con UC functions, Agent Bricks (si está disponible en tu región)
- [ ] Databricks Apps

---

## 4. Certificaciones: cómo usar los proyectos para estudiar

| Certificación | Proyectos que la cubren | Qué estudiar además |
|---|---|---|
| Data Engineer Associate | 1, 2, 3 | Sintaxis Spark SQL/PySpark, permisos UC, Jobs |
| Data Engineer Professional | 3, 4, 5, 7, 14 | Optimización (shuffle, skew, spill), testing, CI/CD, monitoreo |
| Data Analyst Associate | 6 (+ todos los Genie) | SQL avanzado, visualización, dashboards, alertas |
| Machine Learning Associate | 9 | AutoML, Feature Engineering, métricas de evaluación |
| Machine Learning Professional | 10 | Despliegue, drift, monitoreo, reentrenamiento |
| Generative AI Engineer Associate | 8, 11, 12, 13 | Diseño de prompts, chunking, evaluación, gobierno de agentes |

> Los temarios cambian: bajá la **exam guide** vigente de cada certificación desde Databricks Academy
> y pegá en cada README de proyecto la lista de temas del examen que ese proyecto ejercita.

Cada README de proyecto incluye una sección **"Preguntas tipo examen"** con 5 preguntas que vos mismo
escribís con lo que aprendiste ese día. Al terminar los 14 días tenés ~70 preguntas propias de práctica.

---

## 5. Checklist del Día 0 (antes de crear el workspace)

- [ ] Cuenta de Azure creada, presupuesto y alertas configurados
- [ ] Región elegida y verificada (serverless, Genie, Model Serving, Vector Search disponibles)
- [ ] Cuota de vCPU revisada
- [ ] Practicado en Free Edition: un notebook, un pipeline, un dashboard, un Genie space
- [ ] Repo `databricks-14-proyectos` creado con la estructura de `05-entregables.md`
- [ ] Generador de datos funcionando localmente y datasets de los días 1–5 generados
- [ ] Notebooks/SQL de los 14 proyectos en borrador
- [ ] 14 diagramas Excalidraw en borrador
- [ ] Preguntas de benchmark de cada Genie space escritas
- [ ] Borradores de los 14 posts
- [ ] Databricks CLI instalada y probada contra Free Edition (`databricks bundle validate`)
