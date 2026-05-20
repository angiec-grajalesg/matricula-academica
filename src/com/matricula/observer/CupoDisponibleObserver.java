package com.matricula.observer;

public class CupoDisponibleObserver implements Observer {
    private String nombreNotificador;

    public CupoDisponibleObserver(String nombreNotificador) {
        this.nombreNotificador = nombreNotificador;
    }

    @Override
    public void actualizar(String mensaje) {
        System.out.println("[NOTIFICACIÓN] " + nombreNotificador + ": " + mensaje);
    }
}
