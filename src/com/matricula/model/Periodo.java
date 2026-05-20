package com.matricula.model;

import java.time.LocalDate;

public class Periodo {
    private String periodoId;
    private String codigo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean activo;

    public Periodo(String periodoId, String codigo, LocalDate fechaInicio, LocalDate fechaFin, boolean activo) {
        this.periodoId = periodoId;
        this.codigo = codigo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.activo = activo;
    }

    public String getPeriodoId() {
        return periodoId;
    }

    public String getCodigo() {
        return codigo;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
