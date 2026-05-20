package com.matricula.model;

public class InscripcionCanceladaState implements InscripcionState {
    @Override
    public void confirmar(Inscripcion inscripcion) {
        throw new IllegalStateException("No se puede confirmar una inscripción cancelada");
    }

    @Override
    public void cancelar(Inscripcion inscripcion) {
        // ya está cancelada
    }

    @Override
    public void cursar(Inscripcion inscripcion) {
        throw new IllegalStateException("No se puede cursar una inscripción cancelada");
    }

    @Override
    public String nombre() {
        return "CANCELADA";
    }
}
