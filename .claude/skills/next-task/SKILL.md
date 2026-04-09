---
name: next-task
description: Fetch the next "Pendiente" row from the project task spreadsheet, analyze it, and create an implementation plan (without implementing). If info is insufficient, flag it and comment on the row.
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

1. Tell the user exactly what information is missing and why you can't plan without it.
2. Stop here — do NOT create a plan. Do NOT enter plan mode.

### 5. Create an implementation plan (DO NOT IMPLEMENT)

If the task has enough information:

1. **Explore the codebase** using the Explore agent to understand the current implementation of the affected section. IMPORTANT: Before touching UI files, verify which files are actually in use — components in `formV2/` may be deprecated. Check imports from the actual page files in `apps/web/src/app/dashboard/`.
2. **Enter plan mode** with `EnterPlanMode`.
3. Write a plan that includes:
   - **Context**: What the task is and why it matters.
   - **Current behavior**: How things work today (with file paths).
   - **Changes by layer**: Schema → Domain → Infrastructure → Application → UI, with specific file paths and what changes in each.
   - **Verification**: How to test the changes end-to-end.
4. Exit plan mode with `ExitPlanMode` for user approval.

## Important rules

- **NEVER implement code.** This skill only plans.
- **NEVER assume which UI files are active.** Always trace from the page file (`apps/web/src/app/dashboard/...`) to find the real components.
- If there are multiple pending tasks, only process the **first** one.
- All output to the user should be in **Spanish**.
