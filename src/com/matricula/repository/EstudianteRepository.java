package com.matricula.repository;

import com.matricula.model.Estudiante;
import java.util.Optional;

public interface EstudianteRepository {
    Optional<Estudiante> buscarPorId(String estudianteId);
    void guardar(Estudiante estudiante);
}
