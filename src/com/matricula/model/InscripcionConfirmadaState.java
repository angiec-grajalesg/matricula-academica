package com.matricula.model;

public class InscripcionConfirmadaState implements InscripcionState {
    @Override
    public void confirmar(Inscripcion inscripcion) {
        // ya está confirmada
    }

    @Override
    public void cancelar(Inscripcion inscripcion) {
        inscripcion.setEstado(new InscripcionCanceladaState());
    }

    @Override
    public void cursar(Inscripcion inscripcion) {
        inscripcion.setEstado(new InscripcionCursadaState());
    }

    @Override
    public String nombre() {
        return "CONFIRMADA";
    }
}
