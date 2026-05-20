package com.matricula.repository;

import com.matricula.model.Estudiante;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class InMemoryEstudianteRepository implements EstudianteRepository {
    private Map<String, Estudiante> almacen = new HashMap<>();

    @Override
    public Optional<Estudiante> buscarPorId(String estudianteId) {
        return Optional.ofNullable(almacen.get(estudianteId));
    }

    @Override
    public void guardar(Estudiante estudiante) {
        almacen.put(estudiante.getEstudianteId(), estudiante);
    }
}
