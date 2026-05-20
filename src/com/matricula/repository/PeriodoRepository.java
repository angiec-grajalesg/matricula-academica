package com.matricula.repository;

import com.matricula.model.Periodo;
import java.util.Optional;

public interface PeriodoRepository {
    Optional<Periodo> buscarPorId(String periodoId);
    Optional<Periodo> periodoActivo();
    void guardar(Periodo periodo);
}
