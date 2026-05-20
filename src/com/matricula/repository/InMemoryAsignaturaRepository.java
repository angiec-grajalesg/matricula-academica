package com.matricula.repository;

import com.matricula.model.Asignatura;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class InMemoryAsignaturaRepository implements AsignaturaRepository {
    private Map<String, Asignatura> almacen = new HashMap<>();

    @Override
    public Optional<Asignatura> buscarPorId(String asignaturaId) {
        return Optional.ofNullable(almacen.get(asignaturaId));
    }

    @Override
    public List<Asignatura> listarTodas() {
        return new ArrayList<>(almacen.values());
    }

    @Override
    public void guardar(Asignatura asignatura) {
        almacen.put(asignatura.getAsignaturaId(), asignatura);
    }
}
