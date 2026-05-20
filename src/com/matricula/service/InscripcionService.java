package com.matricula.service;

import com.matricula.dto.InscripcionDTO;
import com.matricula.exception.BusinessException;
import com.matricula.exception.ConflictException;
import com.matricula.exception.ForbiddenException;
import com.matricula.model.Asignatura;
import com.matricula.model.Estudiante;
import com.matricula.model.Inscripcion;
import com.matricula.model.Periodo;
import com.matricula.model.Prerequisito;
import com.matricula.model.EstadoEstudiante;
import com.matricula.observer.AsignaturaSubject;
import com.matricula.repository.AsignaturaRepository;
import com.matricula.repository.EstudianteRepository;
import com.matricula.repository.InscripcionRepository;
import com.matricula.repository.PeriodoRepository;
import com.matricula.repository.PrerequisitoRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

public class InscripcionService {
    private static final int MAX_CREDITOS = 18;

    private final EstudianteRepository estudianteRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final InscripcionRepository inscripcionRepository;
    private final PeriodoRepository periodoRepository;
    private final PrerequisitoRepository prerequisitoRepository;
    private final AsignaturaSubject asignaturaSubject;

    public InscripcionService(EstudianteRepository estudianteRepository,
                              AsignaturaRepository asignaturaRepository,
                              InscripcionRepository inscripcionRepository,
                              PeriodoRepository periodoRepository,
                              PrerequisitoRepository prerequisitoRepository,
                              AsignaturaSubject asignaturaSubject) {
        this.estudianteRepository = estudianteRepository;
        this.asignaturaRepository = asignaturaRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.periodoRepository = periodoRepository;
        this.prerequisitoRepository = prerequisitoRepository;
        this.asignaturaSubject = asignaturaSubject;
    }

    public InscripcionDTO inscribir(String estudianteId, String asignaturaId, String periodoId) {
        Estudiante estudiante = estudianteRepository.buscarPorId(estudianteId)
                .orElseThrow(() -> new BusinessException("Estudiante no encontrado"));
        if (estudiante.getEstado() != EstadoEstudiante.ACTIVO) {
            throw new ForbiddenException("Estudiante no habilitado para inscripción");
        }

        Periodo periodo = periodoRepository.buscarPorId(periodoId)
                .orElseThrow(() -> new BusinessException("Periodo no encontrado"));
        if (!periodo.isActivo()) {
            throw new BusinessException("Periodo de inscripción cerrado");
        }

        Asignatura asignatura = asignaturaRepository.buscarPorId(asignaturaId)
                .orElseThrow(() -> new BusinessException("Asignatura no encontrada"));
        if (!asignatura.isActiva()) {
            throw new BusinessException("Asignatura no activa");
        }

        inscripcionRepository.buscarPorEstudianteAsignaturaPeriodo(estudianteId, asignaturaId, periodoId)
                .ifPresent(i -> {
                    throw new ConflictException("Ya estás inscrito en esta asignatura");
                });

        verificarPrerequisitos(estudiante, asignatura);
        validarCreditos(estudianteId, periodoId, asignatura);

        synchronized (asignatura) {
            if (!asignatura.tieneCupo()) {
                throw new ConflictException("Cupo agotado, se recomienda lista de espera");
            }
            asignatura.incrementarCupo();
            asignaturaRepository.guardar(asignatura);
        }

        Inscripcion inscripcion = new Inscripcion(UUID.randomUUID().toString(), estudianteId, asignaturaId, periodoId, LocalDate.now());
        inscripcion.confirmar();
        inscripcionRepository.guardar(inscripcion);

        enviarCorreoConfirmacion(estudiante, asignatura, inscripcion);
        return toDTO(inscripcion);
    }

    private void validarCreditos(String estudianteId, String periodoId, Asignatura asignatura) {
        int creditosActuales = inscripcionRepository.listarPorEstudianteYPeriodo(estudianteId, periodoId).stream()
                .filter(i -> "CONFIRMADA".equals(i.getEstado().nombre()))
                .mapToInt(i -> asignaturaRepository.buscarPorId(i.getAsignaturaId())
                        .map(Asignatura::getCreditos)
                        .orElse(0))
                .sum();
        if (creditosActuales + asignatura.getCreditos() > MAX_CREDITOS) {
            throw new BusinessException("Superarías el límite de 18 créditos por periodo");
        }
    }

    private void verificarPrerequisitos(Estudiante estudiante, Asignatura asignatura) {
        List<Prerequisito> prerequisitos = prerequisitoRepository.buscarPorAsignatura(asignatura.getAsignaturaId());
        boolean todosAprobados = prerequisitos.stream()
                .allMatch(pr -> estudiante.aproboAsignatura(pr.getRequiereId()));
        if (!todosAprobados) {
            throw new BusinessException("Prerequisito(s) no aprobado(s)");
        }
    }

    public InscripcionDTO cancelar(String inscripcionId) {
        Inscripcion inscripcion = inscripcionRepository.buscarPorId(inscripcionId)
                .orElseThrow(() -> new BusinessException("Inscripción no encontrada"));
        Periodo periodo = periodoRepository.buscarPorId(inscripcion.getPeriodoId())
                .orElseThrow(() -> new BusinessException("Periodo no encontrado"));
        if (!puedeCancelar(periodo)) {
            throw new BusinessException("Fuera del plazo de cancelación");
        }
        if (!"CONFIRMADA".equals(inscripcion.getEstado().nombre())) {
            throw new BusinessException("Solo se pueden cancelar inscripciones confirmadas");
        }

        inscripcion.cancelar();
        inscripcionRepository.actualizar(inscripcion);

        asignaturaRepository.buscarPorId(inscripcion.getAsignaturaId()).ifPresent(asignatura -> {
            synchronized (asignatura) {
                asignatura.decrementarCupo();
                asignaturaRepository.guardar(asignatura);
            }
            asignaturaSubject.notificar("Se liberó cupo en " + asignatura.getNombre());
        });

        return toDTO(inscripcion);
    }

    private boolean puedeCancelar(Periodo periodo) {
        long diasParaCierre = ChronoUnit.DAYS.between(LocalDate.now(), periodo.getFechaFin());
        return diasParaCierre >= 5;
    }

    private InscripcionDTO toDTO(Inscripcion inscripcion) {
        return new InscripcionDTO(
                inscripcion.getInscripcionId(),
                inscripcion.getEstudianteId(),
                inscripcion.getAsignaturaId(),
                inscripcion.getPeriodoId(),
                inscripcion.getFechaInscripcion(),
                inscripcion.getEstado().nombre()
        );
    }

    private void enviarCorreoConfirmacion(Estudiante estudiante, Asignatura asignatura, Inscripcion inscripcion) {
        System.out.println("[EMAIL] Para: " + estudiante.getCorreo());
        System.out.println("[EMAIL] Asunto: Confirmación de inscripción");
        System.out.println("[EMAIL] Cuerpo: Estimado " + estudiante.getNombre() + ", se ha confirmado su inscripción en " + asignatura.getNombre() + ".");
    }
}
