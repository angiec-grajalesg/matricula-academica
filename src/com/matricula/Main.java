package com.matricula;

import com.matricula.controller.InscripcionController;
import com.matricula.factory.PeriodoFactory;
import com.matricula.model.Asignatura;
import com.matricula.model.Estudiante;
import com.matricula.model.EstadoEstudiante;
import com.matricula.model.Prerequisito;
import com.matricula.observer.AsignaturaSubject;
import com.matricula.observer.CupoDisponibleObserver;
import com.matricula.repository.AsignaturaRepository;
import com.matricula.repository.EstudianteRepository;
import com.matricula.repository.InscripcionRepository;
import com.matricula.repository.PeriodoRepository;
import com.matricula.repository.PrerequisitoRepository;
import com.matricula.repository.InMemoryAsignaturaRepository;
import com.matricula.repository.InMemoryEstudianteRepository;
import com.matricula.repository.InMemoryInscripcionRepository;
import com.matricula.repository.InMemoryPeriodoRepository;
import com.matricula.repository.InMemoryPrerequisitoRepository;
import com.matricula.service.InscripcionService;
import com.matricula.view.MatriculaView;

import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        EstudianteRepository estudianteRepo = new InMemoryEstudianteRepository();
        AsignaturaRepository asignaturaRepo = new InMemoryAsignaturaRepository();
        InscripcionRepository inscripcionRepo = new InMemoryInscripcionRepository();
        PeriodoRepository periodoRepo = new InMemoryPeriodoRepository();
        PrerequisitoRepository prerequisitoRepo = new InMemoryPrerequisitoRepository();
        AsignaturaSubject subject = new AsignaturaSubject();

        subject.registrarObserver(new CupoDisponibleObserver("Coordinación"));

        Estudiante ana = new Estudiante("EST-2025-001", "Ana", "García", "ana.garcia@example.com", "Ingeniería de Sistemas", 4, EstadoEstudiante.ACTIVO);
        ana.agregarNota("ASG-000", 4.0);
        estudianteRepo.guardar(ana);

        Asignatura calculo = new Asignatura("ASG-001", "MAT-101", "Cálculo Diferencial", 3, 30, 28, true);
        Asignatura algebra = new Asignatura("ASG-000", "MAT-001", "Cálculo I", 4, 30, 30, true);
        asignaturaRepo.guardar(calculo);
        asignaturaRepo.guardar(algebra);

        Prerequisito prereq = new Prerequisito("ASG-001", "ASG-000", "OBLIGATORIO");
        prerequisitoRepo.guardar(prereq);

        periodoRepo.guardar(PeriodoFactory.crearPeriodoActivo("PER-2025-2", "2025-2", LocalDate.of(2025, 7, 15), LocalDate.of(2025, 12, 5)));

        InscripcionService servicio = new InscripcionService(estudianteRepo, asignaturaRepo, inscripcionRepo, periodoRepo, prerequisitoRepo, subject);
        InscripcionController controlador = new InscripcionController(servicio);
        MatriculaView vista = new MatriculaView(controlador);

        vista.mostrarFormularioInscripcion("EST-2025-001", "ASG-001", "PER-2025-2");
    }
}
