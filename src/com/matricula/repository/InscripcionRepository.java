package com.matricula.repository;

import com.matricula.model.Inscripcion;
import java.util.List;
import java.util.Optional;

public interface InscripcionRepository {
    Optional<Inscripcion> buscarPorId(String inscripcionId);
    List<Inscripcion> listarPorEstudianteYPeriodo(String estudianteId, String periodoId);
    List<Inscripcion> listarPorEstudiante(String estudianteId);
    Optional<Inscripcion> buscarPorEstudianteAsignaturaPeriodo(String estudianteId, String asignaturaId, String periodoId);
    void guardar(Inscripcion inscripcion);
    void actualizar(Inscripcion inscripcion);
}
