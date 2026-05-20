# Matrícula Académica

Este proyecto es una aplicación web estática de simulación de matrícula académica.

## Estructura principal

- `index.html` - Interfaz principal de la aplicación.
- `css/styles.css` - Estilos visuales.
- `js/seedData.js` - Datos iniciales de estudiantes, asignaturas, periodos, prerrequisitos e historial.
- `js/patterns.js` - Implementación de patrones de diseño (Repository, Observer, State, Factory).
- `js/mockApi.js` - API simulada que maneja inscripciones, lista de espera y operaciones CRUD.
- `js/app.js` - Controlador de UI que muestra el dashboard estudiantil y la vista de coordinador.
- `src/` - Código Java de apoyo / ejemplos de estructura de proyecto.

## Cómo ejecutar

### Opción 1: Usar el script local

Desde la carpeta del proyecto:

```bash
./run-server.sh
```

Luego abre en tu navegador:

```text
http://localhost:8000
```

### Opción 2: Usar Python directamente

Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Después, abre `http://localhost:8000` en tu navegador.

## Qué puedes ver

- Tab 1: portal de estudiante con selección de estudiante, inscripción, vista de horario y historial de inscripciones.
- Tab 2: portal de coordinador con CRUD de asignaturas.
- Terminal de desarrollador al final de la página para ver logs simulados del API y transacciones.

## Reiniciar datos

Haz clic en el botón `🔄 Reiniciar BD` en la aplicación para restaurar los datos iniciales de `localStorage`.
