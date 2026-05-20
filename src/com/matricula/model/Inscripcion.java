package com.matricula.model;

import java.time.LocalDate;

public class Inscripcion {
    private String inscripcionId;
    private String estudianteId;
    private String asignaturaId;
    private String periodoId;
    private LocalDate fechaInscripcion;
    private Double nota;
    private InscripcionState estado;

    public Inscripcion(String inscripcionId, String estudianteId, String asignaturaId, String periodoId, LocalDate fechaInscripcion) {
        this.inscripcionId = inscripcionId;
        this.estudianteId = estudianteId;
        this.asignaturaId = asignaturaId;
        this.periodoId = periodoId;
        this.fechaInscripcion = fechaInscripcion;
        this.nota = null;
        this.estado = new InscripcionPendienteState();
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

    public Double getNota() {
        return nota;
    }

    public void setNota(Double nota) {
        this.nota = nota;
    }

    public InscripcionState getEstado() {
        return estado;
    }

    public void setEstado(InscripcionState estado) {
        this.estado = estado;
    }

    public void confirmar() {
        estado.confirmar(this);
    }

    public void cancelar() {
        estado.cancelar(this);
    }

    public void cursar() {
        estado.cursar(this);
    }
}
