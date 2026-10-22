# 14 días · 14 proyectos · Azure Databricks con Genie como centro

Plan maestro para aprovechar al máximo el **trial Premium de 14 días de Azure Databricks**
con 14 proyectos End-to-End, de nivel certificación, con datos simulados realistas,
diagramas en Excalidraw, repositorio público y un post de LinkedIn por proyecto.

> Regla de oro: **el reloj del trial es caro, el tiempo antes del trial es gratis.**
> Todo lo que se pueda preparar antes (datos, código, diagramas, borradores de post)
> se prepara antes. Durante los 14 días solo se *ejecuta, ajusta, mide y documenta*.

---

## Cómo leer esta carpeta

| Archivo | Para qué sirve |
|---|---|
| [`01-preparacion-y-conceptos.md`](01-preparacion-y-conceptos.md) | Cómo funciona el trial, costos, cuotas, setup de Azure, conceptos que tenés que dominar antes del día 1, checklist del día 0 |
| [`02-proyectos.md`](02-proyectos.md) | Ficha de cada uno de los 14 proyectos: problema, datos, arquitectura, features de Databricks, Genie, certificación, MVP vs. extra |
| [`03-genie-playbook.md`](03-genie-playbook.md) | Cómo construir espacios de Genie que respondan bien (y cómo medirlo con benchmarks) |
| [`04-datos-simulados.md`](04-datos-simulados.md) | Diseño del universo de datos ficticio, generador compartido, "suciedad" controlada |
| [`05-entregables.md`](05-entregables.md) | Estructura de repo, plantilla de README, convenciones Excalidraw, plantilla de post LinkedIn, Definition of Done |

---

## La idea central: un solo universo, 14 piezas que encajan

En vez de 14 proyectos sueltos ("juguetes" con datasets distintos), los 14 proyectos
viven dentro de **una empresa ficticia**: **Mercado Austral**, un marketplace LatAm
(AR, CL, UY, MX, CO) con e-commerce, pagos (fintech), logística propia, atención al cliente,
marketing y su propia plataforma de datos.

Por qué esto es mejor para portfolio:

- Las tablas `customer`, `product`, `seller`, `calendar` se reutilizan → cada día construís **encima** del anterior, no desde cero.
- Cada proyecto termina en un **espacio de Genie de dominio** (Ventas, Fraude, Logística…).
- El día 12 un **agente supervisor** orquesta *todos* esos Genie spaces → la historia cierra sola.
- En LinkedIn se cuenta como una **serie**: "Día 7/14 de construir la plataforma de datos de una empresa".

```
                    ┌────────────────────────────────────────┐
                    │  Día 12-13: Agente supervisor + App    │
                    │  "Copiloto ejecutivo de Mercado Austral"│
                    └───────────────┬────────────────────────┘
        ┌──────────┬──────────┬─────┴─────┬──────────┬──────────┐
     Genie       Genie      Genie       Genie      RAG        Genie
     Ventas      Fraude     Logística   Soporte    Políticas  FinOps
     (2,3,6)     (4)        (5)         (8)        (11)       (14)
        └──────────┴──────────┴─────┬─────┴──────────┴──────────┘
                    ┌───────────────┴────────────────────────┐
                    │ Lakehouse gobernado con Unity Catalog  │
                    │ bronze → silver → gold → metric views  │
                    └────────────────────────────────────────┘
```

---

## Mapa de los 14 proyectos

| Día | Proyecto | Dominio | Pieza técnica principal | Genie | Certificación |
|---|---|---|---|---|---|
| 1 | Fundación del Lakehouse gobernado | Plataforma | Unity Catalog, ADLS, external locations, Asset Bundles | Catálogo maestro | DE Associate |
| 2 | Ventas e-commerce Medallion | Ventas | Auto Loader, MERGE, SCD2, liquid clustering | Ventas v1 | DE Associate |
| 3 | Pipeline declarativo con calidad y CDC | Órdenes/pagos | Lakeflow Declarative Pipelines, expectations, AUTO CDC | Calidad de datos | DE Associate / Pro |
| 4 | Detección de fraude en streaming | Fintech | Structured Streaming, watermarks, ventanas, joins | Riesgo y fraude | DE Professional |
| 5 | Logística y cadena de frío IoT | Logística | Datos tardíos, dedupe, H3 geoespacial, SLAs | Operaciones | DE Professional |
| 6 | Capa semántica + Dashboards + Genie experto | Negocio | Modelo estrella, PK/FK, Metric Views, AI/BI Dashboards, benchmarks | Ventas v2 (medida) | Data Analyst Associate |
| 7 | Gobierno y seguridad de datos sensibles | RRHH | Row filters, column masks, tags, lineage, auditoría | RRHH (con permisos) | DE Professional |
| 8 | Soporte al cliente con AI Functions | Soporte | `ai_query`, `ai_classify`, `ai_extract`, batch inference | Voz del cliente | GenAI Associate |
| 9 | Predicción de churn | Marketing | Feature Engineering en UC, MLflow, Model Registry en UC | Retención | ML Associate |
| 10 | Forecast de demanda + MLOps | Supply chain | Many-models, Model Serving, monitoreo de drift, reentrenamiento | Abastecimiento | ML Professional |
| 11 | Asistente RAG de políticas internas | Legal/Soporte | Vector Search, Agent Framework, MLflow evaluation | (RAG, no Genie) | GenAI Associate |
| 12 | Agente supervisor multi-Genie | Dirección | Multi-agent, Genie Conversation API, UC functions como tools | Orquesta todos | GenAI Associate |
| 13 | Databricks App: Copiloto ejecutivo | Producto | Databricks Apps, Genie API, dashboards embebidos, feedback | Interfaz de todo | GenAI / Analyst |
| 14 | Plataforma productiva + FinOps | Plataforma | CI/CD con Bundles + GitHub Actions, Lakeflow Jobs, system tables | FinOps / Observabilidad | DE Professional |

El día 14 cierra con tu perfil real (Analista de Monitoreo / Data Ops): **observabilidad y costos de la propia plataforma**. Es el proyecto más "vendible" para los roles que buscás.

---

## Cronograma completo

### Fase 0 — Antes de activar el trial (1 a 2 semanas, gratis)

1. Leer `01-preparacion-y-conceptos.md` y estudiar los conceptos marcados.
2. Crear cuenta en **Databricks Free Edition** (gratis, serverless) y practicar ahí: SQL, notebooks, pipelines, Genie.
3. Construir el **generador de datos** (`04-datos-simulados.md`) y dejar los archivos listos.
4. Escribir el **esqueleto de código** de los 14 proyectos (notebooks, SQL, `databricks.yml`).
5. Dibujar los **14 diagramas Excalidraw** en versión borrador.
6. Escribir los **borradores** de los 14 posts (se completan con métricas reales después).
7. Escribir las **preguntas de benchmark** de cada Genie space (las respuestas esperadas se validan en el trial).

### Fase 1 — Los 14 días del trial

| Día | Bloque A (mañana) | Bloque B (tarde) | Bloque C (cierre) |
|---|---|---|---|
| 1 | Workspace, ADLS, Access Connector, UC | Datos maestros + Bundle base | Genie Catálogo, README, diagrama final |
| 2 | Auto Loader + bronze | Silver/Gold + SCD2 | Genie Ventas v1 + post |
| 3 | Pipeline declarativo | Expectations + CDC | Genie Calidad + post |
| 4 | Productor de eventos + streaming | Reglas de fraude + ventanas | Genie Fraude + post |
| 5 | Telemetría IoT + datos tardíos | SLAs + H3 | Genie Logística + post |
| 6 | Modelo estrella + Metric Views | Dashboard AI/BI | Benchmarks Genie antes/después + post |
| 7 | Datos de RRHH + políticas | Masks, filtros, tags, lineage | Genie con distintos usuarios + post |
| 8 | Tickets y transcripciones | AI Functions + batch | Genie Voz del cliente + post |
| 9 | Features + entrenamiento | Registro + scoring batch | Genie Retención + post |
| 10 | Many-models forecast | Serving + monitoreo | Genie Abastecimiento + post |
| 11 | Documentos + chunking + índice | Agente RAG + evaluación | Post |
| 12 | Supervisor + tools | Evaluación del agente | Post |
| 13 | App | Integración Genie API + feedback | Video demo + post |
| 14 | CI/CD + Jobs | FinOps con system tables | Genie FinOps + cierre de la serie + **apagar todo** |

Cada día tiene un **MVP** (lo mínimo para que el proyecto sea presentable) y **extras** (si sobra tiempo).
Si un día se complica, se entrega el MVP y se sigue. **Nunca arrastres deuda al día siguiente.**

### Fase 2 — Después del trial

- Publicar los posts **2–3 por semana** (no los 14 seguidos: más alcance, más tiempo de interacción por post).
- Seguir iterando en Free Edition.
- Rendir certificaciones en este orden sugerido: Data Engineer Associate → Data Analyst Associate → GenAI Engineer Associate → Data Engineer Professional.

---

## Supuestos que tomé (cambialos si no aplican)

- ~6–8 horas por día disponibles durante los 14 días.
- Repositorio y posts en **español** (README con resumen corto en inglés para alcance internacional).
- Un **monorepo** público `databricks-14-proyectos` (ver `05-entregables.md`) en vez de 14 repos.
- Región de Azure con disponibilidad de serverless y features de IA (ej. `East US 2` o `West Europe`). Verificalo el día 0.
