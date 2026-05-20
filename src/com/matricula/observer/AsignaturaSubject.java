package com.matricula.observer;

import java.util.ArrayList;
import java.util.List;

public class AsignaturaSubject implements Subject {
    private List<Observer> observers = new ArrayList<>();

    @Override
    public void registrarObserver(Observer observer) {
        observers.add(observer);
    }

    @Override
    public void removerObserver(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notificar(String mensaje) {
        observers.forEach(observer -> observer.actualizar(mensaje));
    }
}
