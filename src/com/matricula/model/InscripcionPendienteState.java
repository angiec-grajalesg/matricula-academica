package com.matricula.model;

public class InscripcionPendienteState implements InscripcionState {
    @Override
    public void confirmar(Inscripcion inscripcion) {
        inscripcion.setEstado(new InscripcionConfirmadaState());
    }

    @Override
    public void cancelar(Inscripcion inscripcion) {
        inscripcion.setEstado(new InscripcionCanceladaState());
    }

    @Override
    public void cursar(Inscripcion inscripcion) {
        throw new IllegalStateException("No se puede cursar una inscripción pendiente");
    }

    @Override
    public String nombre() {
        return "PENDIENTE";
    }
}
