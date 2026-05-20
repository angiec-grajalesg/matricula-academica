package com.matricula.dto;

import java.time.LocalDate;

public class InscripcionDTO {
    private String inscripcionId;
    private String estudianteId;
    private String asignaturaId;
    private String periodoId;
    private LocalDate fechaInscripcion;
    private String estado;

    public InscripcionDTO(String inscripcionId, String estudianteId, String asignaturaId, String periodoId, LocalDate fechaInscripcion, String estado) {
        this.inscripcionId = inscripcionId;
        this.estudianteId = estudianteId;
        this.asignaturaId = asignaturaId;
        this.periodoId = periodoId;
        this.fechaInscripcion = fechaInscripcion;
        this.estado = estado;
    }

    public String getInscripcionId() {
        return inscripcionId;
    }

    public String getEstudianteId() {
        return estudianteId;
    }

    public String getAsignaturaId() {
        return asignaturaId;
    }

    public String getPeriodoId() {
        return periodoId;
    }

    public LocalDate getFechaInscripcion() {
        return fechaInscripcion;
    }

    public String getEstado() {
        return estado;
    }
}
