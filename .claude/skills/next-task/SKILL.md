---
name: next-task
description: Fetch the next "Pendiente" row from the project task spreadsheet, analyze it, and create an implementation plan. After the user approves the plan, ask if they want to implement and proceed if confirmed. If info is insufficient, flag it and comment on the row.
user_invocable: true
---

# Next Task Skill

Read the next pending task from the Google Sheets backlog and produce an implementation plan.

## Spreadsheet

URL: https://docs.google.com/spreadsheets/d/1nslXbRBq9JkA6Q9GIju_KvoO9JvSXnqVftZDQJFc5Vk/gviz/tq?tqx=out:csv&gid=0

## Steps

### 1. Fetch the spreadsheet

Use `WebFetch` with the CSV export URL above. Ask it to return the **complete raw CSV** without summarization.

### 2. Find the next "Pendiente" row

Parse the CSV. The status column is **"Completa Luis Estado"** (column K, 0-indexed 10).

- Scan rows top-to-bottom.
- Pick the **first** row whose status value is exactly `Pendiente` (case-insensitive match).
- If no pending row exists, tell the user "No hay tareas pendientes" and stop.

### 3. Extract task details

From the matched row, extract:

| Field | Column |
|-------|--------|
| Descripción | A — "Completa Taller o Lisandro Descripción" |
| Tipo | B — "Tipo" (Funcionalidad / Error / Mejora) |
| Sección | C — "Sección" |
| Fecha creación | D — "Fecha creación" |
| Pasos para reproducir | E — "Pasos para reproducir / de referencia" |
| Resultado esperado | F — "Resultado Esperado" |
| Resultado actual | G — "Resultado actual" |
| Imágenes | H — "Imagenes" |
| Observaciones | I — "Observaciones" |
| Prioridad | J — "Prioridad" |

Present these to the user in a clear summary.

### 4. Evaluate if there is enough information

A task has **sufficient information** when ALL of these are true:

- The description (A) clearly states what needs to change or be built.
- Either the expected result (F) OR the observations (I) explain the desired behavior in enough detail to design a solution.
- The section (C) is specified so you know which part of the codebase to explore.

If **any** of these are missing or too vague to act on:

1. **Hacé preguntas concretas al usuario** usando `AskUserQuestion`. Por cada dato faltante o ambiguo, formulá una pregunta específica que ayude a completar la información. Ejemplos:
   - Si no hay sección: "¿En qué parte de la app ocurre esto? (ej: ordenes de reparación, stock, presupuestos)"
   - Si la descripción es vaga: "¿Podrías detallar qué debería cambiar exactamente?"
   - Si no hay resultado esperado: "¿Cuál sería el comportamiento correcto después del cambio?"
2. **Evaluá las respuestas** del usuario e intentá completar los datos faltantes con lo que respondió.
3. **Si después de las respuestas sigue faltando información crítica** para armar un plan:
   - Informá claramente: "**No hay suficiente información para armar un plan.** Falta: [lista de lo que sigue sin estar claro]."
   - Sugerí que se actualice la fila en la planilla con los datos faltantes.
   - Stop here — do NOT create a plan. Do NOT enter plan mode.
4. **Si las respuestas del usuario completan la información**, continuá al paso 5.

### 5. Create an implementation plan

If the task has enough information:

1. **Explore the codebase** using the Explore agent to understand the current implementation of the affected section. IMPORTANT: Before touching UI files, verify which files are actually in use — components in `formV2/` may be deprecated. Check imports from the actual page files in `apps/web/src/app/dashboard/`.
2. **Enter plan mode** with `EnterPlanMode`.
3. Write a plan that includes:
   - **Context**: What the task is and why it matters.
   - **Current behavior**: How things work today (with file paths).
   - **Changes by layer**: Schema → Domain → Infrastructure → Application → UI, with specific file paths and what changes in each.
   - **Verification**: How to test the changes end-to-end.
4. Exit plan mode with `ExitPlanMode` for user approval.

### 6. After plan approval, ask whether to implement

Once the user approves the plan and you exit plan mode:

1. **Preguntale al usuario con `AskUserQuestion`** si quiere que implementes ahora el plan aprobado. Texto sugerido: "¿Querés que implemente ahora el plan aprobado?" con opciones "Sí, implementar" y "No, solo dejar el plan".
2. **Si responde que sí**:
   - Implementá el plan siguiendo exactamente lo aprobado, en el orden indicado en "Changes by layer".
   - Usá `TodoWrite` para llevar el progreso de los pasos del plan.
   - Al terminar, corré las verificaciones de la sección "Verification" del plan (lint, tests, smoke tests del endpoint, etc.) y reportá al usuario qué pasó.
   - **Si durante la implementación encontrás un desvío del plan** (un archivo que no era el esperado, un supuesto que resulta falso, etc.), pará y avisale al usuario antes de continuar — no improvisar cambios fuera del plan.
3. **Si responde que no**, terminá la conversación dejando el plan tal cual está, sin tocar archivos.

## Important rules

- **NEVER implement code antes de la aprobación explícita** del paso 6. La implementación sólo arranca después de que el usuario diga que sí.
- **NEVER assume which UI files are active.** Always trace from the page file (`apps/web/src/app/dashboard/...`) to find the real components.
- If there are multiple pending tasks, only process the **first** one.
- All output to the user should be in **Spanish**.
