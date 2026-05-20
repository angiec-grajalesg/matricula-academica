package com.matricula.controller;

import com.matricula.dto.InscripcionDTO;
import com.matricula.service.InscripcionService;

public class InscripcionController {
    private final InscripcionService inscripcionService;

    public InscripcionController(InscripcionService inscripcionService) {
        this.inscripcionService = inscripcionService;
    }

    public InscripcionDTO inscribir(String estudianteId, String asignaturaId, String periodoId) {
        return inscripcionService.inscribir(estudianteId, asignaturaId, periodoId);
    }

    public InscripcionDTO cancelar(String inscripcionId) {
        return inscripcionService.cancelar(inscripcionId);
    }
}
