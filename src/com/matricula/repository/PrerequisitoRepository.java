package com.matricula.repository;

import com.matricula.model.Prerequisito;
import java.util.List;

public interface PrerequisitoRepository {
    List<Prerequisito> buscarPorAsignatura(String asignaturaId);
    void guardar(Prerequisito prerequisito);
}
