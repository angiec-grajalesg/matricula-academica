package com.matricula.model;

public interface InscripcionState {
    void confirmar(Inscripcion inscripcion);
    void cancelar(Inscripcion inscripcion);
    void cursar(Inscripcion inscripcion);
    String nombre();
}
