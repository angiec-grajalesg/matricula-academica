package com.matricula.model;

public class Prerequisito {
    private String asignaturaId;
    private String requiereId;
    private String tipo;

    public Prerequisito(String asignaturaId, String requiereId, String tipo) {
        this.asignaturaId = asignaturaId;
        this.requiereId = requiereId;
        this.tipo = tipo;
    }

    public String getAsignaturaId() {
        return asignaturaId;
    }

    public String getRequiereId() {
        return requiereId;
    }

    public String getTipo() {
        return tipo;
    }
}
