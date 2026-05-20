package com.matricula.repository;

import com.matricula.model.Periodo;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class InMemoryPeriodoRepository implements PeriodoRepository {
    private Map<String, Periodo> almacen = new HashMap<>();

    @Override
    public Optional<Periodo> buscarPorId(String periodoId) {
        return Optional.ofNullable(almacen.get(periodoId));
    }

    @Override
    public Optional<Periodo> periodoActivo() {
        return almacen.values().stream().filter(Periodo::isActivo).findFirst();
    }

    @Override
    public void guardar(Periodo periodo) {
        almacen.put(periodo.getPeriodoId(), periodo);
    }
}
