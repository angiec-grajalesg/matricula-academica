package com.matricula.observer;

public interface Subject {
    void registrarObserver(Observer observer);
    void removerObserver(Observer observer);
    void notificar(String mensaje);
}
