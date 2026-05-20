package com.matricula.repository;

import com.matricula.model.Inscripcion;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class InMemoryInscripcionRepository implements InscripcionRepository {
    private Map<String, Inscripcion> almacen = new HashMap<>();

    @Override
    public Optional<Inscripcion> buscarPorId(String inscripcionId) {
        return Optional.ofNullable(almacen.get(inscripcionId));
    }

    @Override
    public List<Inscripcion> listarPorEstudianteYPeriodo(String estudianteId, String periodoId) {
        return almacen.values().stream()
                .filter(i -> i.getEstudianteId().equals(estudianteId) && i.getPeriodoId().equals(periodoId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Inscripcion> listarPorEstudiante(String estudianteId) {
        return almacen.values().stream()
                .filter(i -> i.getEstudianteId().equals(estudianteId))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Inscripcion> buscarPorEstudianteAsignaturaPeriodo(String estudianteId, String asignaturaId, String periodoId) {
        return almacen.values().stream()
                .filter(i -> i.getEstudianteId().equals(estudianteId)
                        && i.getAsignaturaId().equals(asignaturaId)
                        && i.getPeriodoId().equals(periodoId))
                .findFirst();
    }

    @Override
    public void guardar(Inscripcion inscripcion) {
        almacen.put(inscripcion.getInscripcionId(), inscripcion);
    }

    @Override
    public void actualizar(Inscripcion inscripcion) {
        almacen.put(inscripcion.getInscripcionId(), inscripcion);
    }
}
