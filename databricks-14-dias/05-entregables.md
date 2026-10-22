# 05 · Entregables: repo, README, Excalidraw, LinkedIn

## 1. Estructura del repositorio (monorepo)

```
databricks-14-proyectos/
├── README.md                     # portada de la serie: universo, mapa, links a cada día, costo total
├── databricks.yml                # Asset Bundle raíz (targets: dev, prod)
├── .github/workflows/deploy.yml  # CI/CD (día 14)
├── infra/                        # Terraform/Bicep (opcional)
├── datagen/                      # generador compartido (ver 04)
├── common/                       # utilidades compartidas (logging, helpers de calidad)
├── docs/
│   ├── arquitectura-general.excalidraw
│   └── arquitectura-general.png
├── dia-01-fundacion-lakehouse/
├── dia-02-ventas-medallion/
├── ...
└── dia-14-plataforma-finops/
    ├── README.md
    ├── resources/                # jobs/pipelines del bundle para este proyecto
    ├── src/                      # notebooks, .sql, .py
    ├── tests/
    ├── genie/                    # ver 03-genie-playbook.md §7
    ├── diagramas/
    │   ├── arquitectura.excalidraw
    │   └── arquitectura.png
    ├── img/                      # capturas: Genie, dashboard, lineage, pipeline
    └── linkedin.md               # el post
```

¿Monorepo o 14 repos? **Monorepo**: un solo link en el perfil, un solo bundle/CI, y los proyectos comparten datos y código.
Cada post apunta a la carpeta del día (`.../tree/main/dia-04-fraude-streaming`).

## 2. Plantilla de README por proyecto

```markdown
# Día N/14 · <Título>

> Una línea: qué problema de negocio resuelve.

![Arquitectura](diagramas/arquitectura.png)

## Problema de negocio
## Datos (sintéticos)            ← qué se generó, volumen, suciedad inyectada
## Arquitectura                  ← capas, tablas, flujo
## Features de Databricks usadas ← lista con link a la doc oficial
## Genie space                   ← tablas, instrucciones, 3 capturas, precisión de benchmarks
## Resultados                    ← métricas: filas, latencia, calidad, precisión, costo en DBUs
## Decisiones de diseño          ← 3 decisiones y por qué (esto es lo que miran los seniors)
## Cómo ejecutarlo               ← bundle deploy / run
## Qué haría distinto en producción
## Preguntas tipo examen         ← 5 preguntas propias + respuesta
## English summary               ← 3–4 líneas
```

## 3. Convenciones Excalidraw (mismo lenguaje visual en los 14)

| Elemento | Color / forma |
|---|---|
| Fuentes de datos | Gris, rectángulo con borde punteado |
| Bronze | Marrón/cobre `#cd7f32` |
| Silver | Gris plata `#c0c0c0` |
| Gold | Dorado `#ffd700` |
| Unity Catalog / gobierno | Recuadro que envuelve todo, azul |
| Genie / IA | Violeta, con ícono ✨ |
| Consumidores (personas, apps) | Verde |
| Streaming | Flecha gruesa ondulada; batch: flecha recta |

Reglas:
- Flujo siempre **izquierda → derecha**; consumidores a la derecha.
- Título arriba con "Día N/14" (sirve como imagen del post).
- Exportar PNG con fondo blanco, escala 2x, formato **1200×1200 o 1080×1350** para LinkedIn.
- Guardar el `.excalidraw` en el repo (editable).
- Un diagrama general (`docs/`) que se actualiza cada día agregando la pieza nueva → el día 14 muestra la plataforma completa.

## 4. Plantilla de post LinkedIn

```text
[Gancho: 1–2 líneas que generen curiosidad o tensión, ver gancho en 02-proyectos.md]

Día N/14 construyendo la plataforma de datos de una empresa ficticia en Azure Databricks.

🧩 El problema: <1–2 líneas de negocio>

🏗️ Lo que construí:
→ <pieza 1>
→ <pieza 2>
→ <pieza 3>

✨ Genie: <pregunta en lenguaje natural> → <qué respondió / precisión del benchmark>

📈 Resultado: <una métrica concreta>

💡 Lo que aprendí:
1. <aprendizaje no obvio>
2. <error que cometí y cómo lo resolví>
3. <decisión de diseño>

Código + diagrama: <link a la carpeta>

¿<pregunta abierta a la comunidad>?

#Databricks #Azure #DataEngineering #Genie #UnityCatalog
```

Consejos:
- Imagen = diagrama Excalidraw o carrusel PDF (diagrama + 2 capturas + métrica).
- Link al repo en el **primer comentario** si querés más alcance.
- Publicar 2–3 por semana, mismo horario; responder comentarios la primera hora.
- Post 0 (antes de empezar): *"Voy a construir 14 proyectos en 14 días. Este es el plan."* con el diagrama general.
- Post 15 (cierre): costo total, lo que salió mal, links a todo.

## 5. Definition of Done (por día)

- [ ] MVP funcionando y re-ejecutable con el bundle
- [ ] Datos con comentarios en tablas y columnas gold
- [ ] Genie space con instrucciones, ejemplos, ≥10 benchmarks y precisión registrada
- [ ] 3+ capturas (pipeline/lineage, Genie, dashboard o resultado)
- [ ] Diagrama Excalidraw final (.excalidraw + .png)
- [ ] README completo según plantilla
- [ ] Post de LinkedIn escrito con métricas reales
- [ ] `git push` hecho (nada vive solo en el workspace)
- [ ] Compute apagado, costo del día anotado
