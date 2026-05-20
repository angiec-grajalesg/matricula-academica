// Academic Enrollment System - Seed Data
window.AcademicSystem = window.AcademicSystem || {};

window.AcademicSystem.DEFAULT_SEEDS = {
  estudiantes: [
    {
      estudianteId: "EST-2025-001",
      nombre: "Ana",
      apellido: "García",
      correo: "ana.garcia@universidad.edu.co",
      programa: "Ingeniería de Sistemas",
      semestre: 4,
      estado: "ACTIVO"
    },
    {
      estudianteId: "EST-2025-002",
      nombre: "Juan",
      apellido: "Pérez",
      correo: "juan.perez@universidad.edu.co",
      programa: "Ingeniería de Sistemas",
      semestre: 2,
      estado: "ACTIVO"
    },
    {
      estudianteId: "EST-2025-003",
      nombre: "Carlos",
      apellido: "Ruiz",
      correo: "carlos.ruiz@universidad.edu.co",
      programa: "Ingeniería de Sistemas",
      semestre: 5,
      estado: "SUSPENDIDO"
    }
  ],

  asignaturas: [
    {
      asignaturaId: "ASG-001",
      codigo: "MAT-101",
      nombre: "Cálculo Diferencial",
      creditos: 3,
      cupoMaximo: 30,
      cupoActual: 28,
      estado: "ACTIVA",
      horario: { dias: ["Lunes", "Miércoles"], horaInicio: "08:00", horaFin: "10:00" }
    },
    {
      asignaturaId: "ASG-002",
      codigo: "MAT-102",
      nombre: "Cálculo Integral",
      creditos: 3,
      cupoMaximo: 30,
      cupoActual: 29,
      estado: "ACTIVA",
      horario: { dias: ["Lunes", "Miércoles"], horaInicio: "08:00", horaFin: "10:00" } // Choque de horario con Cálculo Diferencial
    },
    {
      asignaturaId: "ASG-003",
      codigo: "FIS-101",
      nombre: "Física I",
      creditos: 4,
      cupoMaximo: 5,
      cupoActual: 5, // Llena, para lista de espera
      estado: "LLENA",
      horario: { dias: ["Martes", "Jueves"], horaInicio: "10:00", horaFin: "12:00" }
    },
    {
      asignaturaId: "ASG-004",
      codigo: "PRG-101",
      nombre: "Introducción a la Programación",
      creditos: 3,
      cupoMaximo: 40,
      cupoActual: 10,
      estado: "ACTIVA",
      horario: { dias: ["Lunes", "Miércoles"], horaInicio: "10:00", horaFin: "12:00" }
    },
    {
      asignaturaId: "ASG-005",
      codigo: "PRG-102",
      nombre: "Programación Orientada a Objetos",
      creditos: 3,
      cupoMaximo: 30,
      cupoActual: 15,
      estado: "ACTIVA",
      horario: { dias: ["Lunes", "Miércoles"], horaInicio: "14:00", horaFin: "16:00" }
    },
    {
      asignaturaId: "ASG-006",
      codigo: "PROY-001",
      nombre: "Proyecto de Grado",
      creditos: 15,
      cupoMaximo: 10,
      cupoActual: 2,
      estado: "ACTIVA",
      horario: { dias: ["Viernes"], horaInicio: "08:00", horaFin: "12:00" }
    }
  ],

  periodos: [
    {
      periodoId: "PER-2025-2",
      codigo: "2025-2",
      fechaInicio: "2025-07-15",
      fechaFin: "2025-12-05",
      activo: true
    }
  ],

  prerequisitos: [
    {
      asignaturaId: "ASG-002", // Cálculo Integral requiere Cálculo Diferencial
      requiereId: "ASG-001",
      tipo: "OBLIGATORIO"
    },
    {
      asignaturaId: "ASG-005", // POO requiere Introducción a la Programación
      requiereId: "ASG-004",
      tipo: "OBLIGATORIO"
    }
  ],

  // Historial académico (para validar prerrequisitos aprobados)
  historialAcademico: [
    {
      estudianteId: "EST-2025-002", // Juan Pérez aprobó Cálculo Diferencial
      asignaturaId: "ASG-001",
      periodoId: "PER-2025-1",
      nota: 4.5,
      estado: "CURSADA"
    },
    {
      estudianteId: "EST-2025-001", // Ana García reprobó Cálculo Diferencial con 2.5 (no lo tiene aprobado)
      asignaturaId: "ASG-001",
      periodoId: "PER-2025-1",
      nota: 2.5,
      estado: "CURSADA"
    }
  ],

  // Inscripciones en el periodo activo
  inscripciones: [],

  // Lista de espera
  listaEspera: []
};
