package com.matricula.view;

import com.matricula.controller.InscripcionController;
import com.matricula.dto.InscripcionDTO;

public class MatriculaView {
    private final InscripcionController controlador;

    public MatriculaView(InscripcionController controlador) {
        this.controlador = controlador;
    }

    public void mostrarFormularioInscripcion(String estudianteId, String asignaturaId, String periodoId) {
        System.out.println("--- Formulario de Inscripción ---");
        System.out.println("Estudiante: " + estudianteId);
        System.out.println("Asignatura: " + asignaturaId);
        System.out.println("Periodo: " + periodoId);
        try {
            InscripcionDTO respuesta = controlador.inscribir(estudianteId, asignaturaId, periodoId);
            System.out.println("Inscripción exitosa: " + respuesta.getInscripcionId());
            System.out.println("Estado: " + respuesta.getEstado());
            System.out.println("Fecha: " + respuesta.getFechaInscripcion());
        } catch (Exception ex) {
            System.out.println("Error al inscribir: " + ex.getMessage());
        }
    }

    public void mostrarCancelacionInscripcion(String inscripcionId) {
        System.out.println("--- Cancelación de Inscripción ---");
        try {
            InscripcionDTO respuesta = controlador.cancelar(inscripcionId);
            System.out.println("Inscripción cancelada: " + respuesta.getInscripcionId());
            System.out.println("Estado: " + respuesta.getEstado());
        } catch (Exception ex) {
            System.out.println("Error al cancelar: " + ex.getMessage());
        }
    }
}
