package com.matricula.repository;

import com.matricula.model.Prerequisito;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class InMemoryPrerequisitoRepository implements PrerequisitoRepository {
    private List<Prerequisito> almacen = new ArrayList<>();

    @Override
    public List<Prerequisito> buscarPorAsignatura(String asignaturaId) {
        return almacen.stream()
                .filter(p -> p.getAsignaturaId().equals(asignaturaId))
                .collect(Collectors.toList());
    }

    @Override
    public void guardar(Prerequisito prerequisito) {
        almacen.add(prerequisito);
    }
}
