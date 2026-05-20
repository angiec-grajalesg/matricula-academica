package com.matricula.repository;

import com.matricula.model.Asignatura;
import java.util.List;
import java.util.Optional;

public interface AsignaturaRepository {
    Optional<Asignatura> buscarPorId(String asignaturaId);
    List<Asignatura> listarTodas();
    void guardar(Asignatura asignatura);
}
