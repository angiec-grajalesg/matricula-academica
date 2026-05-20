package com.matricula.model;

public class Asignatura {
    private String asignaturaId;
    private String codigo;
    private String nombre;
    private int creditos;
    private int cupoMaximo;
    private int cupoActual;
    private boolean activa;

    public Asignatura(String asignaturaId, String codigo, String nombre, int creditos, int cupoMaximo, int cupoActual, boolean activa) {
        this.asignaturaId = asignaturaId;
        this.codigo = codigo;
        this.nombre = nombre;
        this.creditos = creditos;
        this.cupoMaximo = cupoMaximo;
        this.cupoActual = cupoActual;
        this.activa = activa;
    }

    public String getAsignaturaId() {
        return asignaturaId;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public int getCreditos() {
        return creditos;
    }

    public int getCupoMaximo() {
        return cupoMaximo;
    }

    public int getCupoActual() {
        return cupoActual;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }

    public synchronized boolean tieneCupo() {
        return cupoActual < cupoMaximo;
    }

    public synchronized void incrementarCupo() {
        if (!tieneCupo()) {
            throw new IllegalStateException("No hay cupo disponible");
        }
        cupoActual++;
    }

    public synchronized void decrementarCupo() {
        if (cupoActual > 0) {
            cupoActual--;
        }
    }
}
