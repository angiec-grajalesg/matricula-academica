package com.matricula.model;

public class InscripcionCursadaState implements InscripcionState {
    @Override
    public void confirmar(Inscripcion inscripcion) {
        throw new IllegalStateException("No se puede confirmar una inscripción cursada");
    }

    @Override
    public void cancelar(Inscripcion inscripcion) {
        throw new IllegalStateException("No se puede cancelar una inscripción cursada");
    }

    @Override
    public void cursar(Inscripcion inscripcion) {
        // ya está cursada
    }

    @Override
    public String nombre() {
        return "CURSADA";
    }
}
