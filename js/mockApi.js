// Academic Enrollment System - Mock REST API Layer
window.AcademicSystem = window.AcademicSystem || {};

(function(sys) {
  // Instantiating Repositories
  const estudiantesRepo = new sys.EstudianteRepository();
  const asignaturasRepo = new sys.AsignaturaRepository();
  const inscripcionesRepo = new sys.InscripcionRepository();
  const periodosRepo = new sys.PeriodoRepository();
  const prerequisitosRepo = new sys.PrerequisitoRepository();
  const historialRepo = new sys.HistorialAcademicoRepository();
  const waitlistRepo = new sys.WaitlistRepository();

  // Instantiate Observer System
  const slotSubject = new sys.SlotAvailabilitySubject();
  
  // Custom router function to handle fake AJAX calls
  async function mockFetch(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;
    
    // Simulate natural network delay (e.g., 300ms)
    await new Promise(resolve => setTimeout(resolve, 300));

    sys.log(`[REST Endpoint] ${method} ${url}`, 'info');

    // MOCK CONTROLLER & ROUTER
    try {
      // 1. GET /api/periodos/activo
      if (url === '/api/periodos/activo' && method === 'GET') {
        const activo = periodosRepo.getActivo();
        if (!activo) {
          return { status: 404, statusText: 'Not Found', body: { error: 'No existe periodo activo' } };
        }
        return { status: 200, statusText: 'OK', body: activo };
      }

      // 2. GET /api/prerequisitos/check
      if (url.startsWith('/api/prerequisitos/check') && method === 'GET') {
        const urlObj = new URL(url, 'http://localhost');
        const est = urlObj.searchParams.get('est');
        const asig = urlObj.searchParams.get('asig');
        
        const ok = await prerequisitosRepo.verificarTodos(est, asig, historialRepo);
        return { status: 200, statusText: 'OK', body: { approved: ok } };
      }

      // 3. GET /api/asignaturas
      if (url.startsWith('/api/asignaturas') && method === 'GET') {
        const urlObj = new URL(url, 'http://localhost');
        const filter = urlObj.searchParams.get('filter') || '';
        const programa = urlObj.searchParams.get('programa') || '';
        const creditos = urlObj.searchParams.get('creditos') || '';

        let subjects = asignaturasRepo.getAll();

        if (filter) {
          const fLower = filter.toLowerCase();
          subjects = subjects.filter(s => s.nombre.toLowerCase().includes(fLower) || s.codigo.toLowerCase().includes(fLower));
        }
        if (programa) {
          // In a real system subjects belong to programs, here we filter demo ones matching Engineering or general math
          subjects = subjects.filter(s => {
            if (programa === 'Ingeniería de Sistemas') return true; // Show all for Systems
            return s.nombre.includes('Cálculo'); // general math filter for other mock programs
          });
        }
        if (creditos) {
          subjects = subjects.filter(s => s.creditos === parseInt(creditos));
        }

        return { status: 200, statusText: 'OK', body: subjects };
      }

      // 4. POST /api/asignaturas (Create Asignatura)
      if (url === '/api/asignaturas' && method === 'POST') {
        // Coordinator only simulation (assumed coordinator is active)
        if (!body.codigo || !body.nombre || !body.creditos || !body.cupoMaximo) {
          return { status: 400, statusText: 'Bad Request', body: { error: 'Todos los campos son obligatorios' } };
        }

        const existing = asignaturasRepo.getAsignaturaByCodigo(body.codigo);
        if (existing) {
          return { status: 409, statusText: 'Conflict', body: { error: `Ya existe una asignatura con el código ${body.codigo}` } };
        }

        const newAsig = {
          asignaturaId: `ASG-${Math.floor(100 + Math.random() * 900)}`,
          codigo: body.codigo,
          nombre: body.nombre,
          creditos: parseInt(body.creditos),
          cupoMaximo: parseInt(body.cupoMaximo),
          cupoActual: 0,
          estado: 'ACTIVA',
          horario: body.horario || { dias: ["Lunes"], horaInicio: "08:00", horaFin: "10:00" }
        };

        asignaturasRepo.save(newAsig, 'asignaturaId');
        sys.log(`[Database] Insertada nueva asignatura: ${newAsig.codigo}`, 'success');

        return { status: 201, statusText: 'Created', body: newAsig };
      }

      // 5. PUT /api/asignaturas/{id} (Update Asignatura)
      if (url.startsWith('/api/asignaturas/') && method === 'PUT') {
        const asigId = url.split('/').pop();
        const existing = asignaturasRepo.getAsignatura(asigId);
        if (!existing) {
          return { status: 404, statusText: 'Not Found', body: { error: 'Asignatura no encontrada' } };
        }

        const updated = {
          ...existing,
          nombre: body.nombre || existing.nombre,
          creditos: parseInt(body.creditos) || existing.creditos,
          cupoMaximo: parseInt(body.cupoMaximo) || existing.cupoMaximo,
          estado: body.estado || existing.estado,
          horario: body.horario || existing.horario
        };

        // If cupoMaximo was updated, update status
        if (updated.cupoActual >= updated.cupoMaximo) {
          updated.estado = 'LLENA';
        } else if (updated.estado === 'LLENA' && updated.cupoActual < updated.cupoMaximo) {
          updated.estado = 'ACTIVA';
        }

        asignaturasRepo.save(updated, 'asignaturaId');
        sys.log(`[Database] Actualizada asignatura: ${updated.codigo}`, 'success');
        return { status: 200, statusText: 'OK', body: updated };
      }

      // 6. DELETE /api/asignaturas/{id} (Deactivate Asignatura)
      if (url.startsWith('/api/asignaturas/') && method === 'DELETE') {
        const asigId = url.split('/').pop();
        const existing = asignaturasRepo.getAsignatura(asigId);
        if (!existing) {
          return { status: 404, statusText: 'Not Found', body: { error: 'Asignatura no encontrada' } };
        }

        existing.estado = 'INACTIVA';
        asignaturasRepo.save(existing, 'asignaturaId');
        sys.log(`[Database] Desactivada asignatura: ${existing.codigo}`, 'warning');
        return { status: 200, statusText: 'OK', body: { message: 'Asignatura desactivada con éxito' } };
      }

      // 7. GET /api/inscripciones (List current enrollments)
      if (url.startsWith('/api/inscripciones') && method === 'GET') {
        const urlObj = new URL(url, 'http://localhost');
        const estId = urlObj.searchParams.get('estudianteId');
        const perId = urlObj.searchParams.get('periodoId');

        let enrolls = inscripcionesRepo.getAll();
        if (estId) {
          enrolls = enrolls.filter(e => e.estudianteId === estId);
        }
        if (perId) {
          enrolls = enrolls.filter(e => e.periodoId === perId);
        }

        // Enrich with course details
        const enriched = enrolls.map(e => {
          const asig = asignaturasRepo.getAsignatura(e.asignaturaId);
          return { ...e, asignatura: asig };
        });

        return { status: 200, statusText: 'OK', body: enriched };
      }

      // 8. POST /api/inscripciones (Enroll course - PRINCIPAL TRANSACTION)
      if (url === '/api/inscripciones' && method === 'POST') {
        const { estudianteId, asignaturaId, periodoId } = body;

        // --- RULE RN-01: Academic Period Active Check ---
        const activePeriod = periodosRepo.getActivo();
        if (!activePeriod || activePeriod.periodoId !== periodoId) {
          sys.log(`[Business Error] RN-01: Periodo académico no está activo o cerrado.`, 'error');
          return { status: 400, statusText: 'Bad Request', body: { error: 'Periodo de inscripción cerrado' } };
        }

        // Fetch entities
        const estudiante = estudiantesRepo.getEstudiante(estudianteId);
        const asignatura = asignaturasRepo.getAsignatura(asignaturaId);

        if (!estudiante) {
          return { status: 404, statusText: 'Not Found', body: { error: 'Estudiante no encontrado' } };
        }
        if (!asignatura) {
          return { status: 404, statusText: 'Not Found', body: { error: 'Asignatura no encontrada' } };
        }

        // --- RULE RN-07: Student Status Suspended Check ---
        if (estudiante.estado !== 'ACTIVO') {
          sys.log(`[Business Error] RN-07: Estudiante suspendido o inactivo no puede inscribir.`, 'error');
          return { status: 403, statusText: 'Forbidden', body: { error: 'Estudiante no habilitado' } };
        }

        // --- RULE RN-03: Duplicate Enrollment in same period Check ---
        const currentEnrollments = inscripcionesRepo.filter(e => 
          e.estudianteId === estudianteId && 
          e.periodoId === periodoId && 
          e.estado !== 'CANCELADA'
        );
        const alreadyEnrolled = currentEnrollments.some(e => e.asignaturaId === asignaturaId);
        if (alreadyEnrolled) {
          sys.log(`[Business Error] RN-03: Ya inscrito en esta asignatura para el periodo actual.`, 'error');
          return { status: 409, statusText: 'Conflict', body: { error: 'Ya estás inscrito en esta asignatura' } };
        }

        // --- SCHEDULE CLASH CHECK ---
        const hasScheduleClash = currentEnrollments.some(e => {
          const activeAsig = asignaturasRepo.getAsignatura(e.asignaturaId);
          if (!activeAsig || !activeAsig.horario || !asignatura.horario) return false;
          
          // Check if they share any days
          const commonDays = activeAsig.horario.dias.filter(d => asignatura.horario.dias.includes(d));
          if (commonDays.length === 0) return false;

          // Check if times overlap
          const [h1, m1] = activeAsig.horario.horaInicio.split(':').map(Number);
          const [h2, m2] = activeAsig.horario.horaFin.split(':').map(Number);
          const [h3, m3] = asignatura.horario.horaInicio.split(':').map(Number);
          const [h4, m4] = asignatura.horario.horaFin.split(':').map(Number);

          const start1 = h1 * 60 + m1;
          const end1 = h2 * 60 + m2;
          const start2 = h3 * 60 + m3;
          const end2 = h4 * 60 + m4;

          return (start1 < end2 && start2 < end1);
        });

        if (hasScheduleClash) {
          sys.log(`[Business Error] Choque de horario con otra asignatura ya inscrita.`, 'error');
          return { status: 409, statusText: 'Conflict', body: { error: 'Choque de horario con otra asignatura inscrita' } };
        }

        // --- RULE RN-04: Credit Limit <= 18 Check ---
        const totalCreditsCurrent = currentEnrollments.reduce((sum, e) => {
          const asig = asignaturasRepo.getAsignatura(e.asignaturaId);
          return sum + (asig ? asig.creditos : 0);
        }, 0);

        if (totalCreditsCurrent + asignatura.creditos > 18) {
          sys.log(`[Business Error] RN-04: El total de créditos (${totalCreditsCurrent + asignatura.creditos}) supera el límite de 18 por periodo.`, 'error');
          return { status: 422, statusText: 'Unprocessable Entity', body: { error: 'Superarías el límite de 18 créditos' } };
        }

        // --- RULE RN-02: Prerequisite check ---
        const approvedPrereqs = await prerequisitosRepo.verificarTodos(estudianteId, asignaturaId, historialRepo);
        if (!approvedPrereqs) {
          sys.log(`[Business Error] RN-02: Prerrequisitos de la asignatura no aprobados con nota >= 3.0.`, 'error');
          return { status: 422, statusText: 'Unprocessable Entity', body: { error: 'Prerrequisito no aprobado' } };
        }

        // --- DATABASE TRANSACTION SIMULATOR (RN-08) ---
        sys.log(`[Database Transaction] BEGIN TRANSACTION;`, 'db');
        sys.log(`[Database Transaction] SELECT cupoActual, cupoMaximo FROM asignaturas WHERE id = '${asignaturaId}' FOR UPDATE;`, 'db');
        
        // Check if there is capacity
        if (asignatura.cupoActual >= asignatura.cupoMaximo) {
          sys.log(`[Database Transaction] ROLLBACK; -- Cupo completo (${asignatura.cupoActual}/${asignatura.cupoMaximo})`, 'db');
          sys.log(`[Business Rule] RN-05: Sin cupos disponibles. Se ofrece registrarse en lista de espera.`, 'warning');
          return { status: 409, statusText: 'Conflict', body: { error: 'Cupos agotados, se ofrece lista de espera', waitlistOffer: true } };
        }

        // Perform atomic update inside simulated transaction
        asignatura.cupoActual += 1;
        if (asignatura.cupoActual >= asignatura.cupoMaximo) {
          asignatura.estado = 'LLENA';
        }
        asignaturasRepo.save(asignatura, 'asignaturaId');
        sys.log(`[Database Transaction] UPDATE asignaturas SET cupoActual = ${asignatura.cupoActual} WHERE id = '${asignaturaId}';`, 'db');

        // Create enrollment
        const newInscripcion = {
          inscripcionId: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
          estudianteId,
          asignaturaId,
          periodoId,
          fechaInscripcion: new Date().toISOString().split('T')[0],
          nota: null,
          estado: 'PENDIENTE'
        };

        // Apply State Pattern to CONFIRM enrollment
        const statefulInscripcion = sys.InscripcionStateManager.transition(newInscripcion, 'confirmar');
        inscripcionesRepo.save(statefulInscripcion, 'inscripcionId');
        
        sys.log(`[Database Transaction] INSERT INTO inscripciones (id, estudiante, asignatura, periodo, estado) VALUES ('${statefulInscripcion.inscripcionId}', '${estudianteId}', '${asignaturaId}', '${periodoId}', 'CONFIRMADA');`, 'db');
        sys.log(`[Database Transaction] COMMIT;`, 'db');

        // RF-06: Email notification simulation
        const emailBody = `
          Para: ${estudiante.correo}
          Asunto: Confirmación de Inscripción Académica
          Detalle: Hola ${estudiante.nombre}, has inscrito con éxito la asignatura "${asignatura.nombre}" (${asignatura.codigo}) para el periodo académico ${activePeriod.codigo}.
          Créditos: ${asignatura.creditos}
          Horario: ${asignatura.horario.dias.join(', ')} de ${asignatura.horario.horaInicio} a ${asignatura.horario.horaFin}
        `;
        sys.log(`[Email Service] Notificación enviada exitosamente:\n${emailBody}`, 'success');

        return { status: 201, statusText: 'Created', body: { ...statefulInscripcion, emailNotification: emailBody } };
      }

      // 9. DELETE /api/inscripciones/{id} (Cancel enrollment)
      if (url.startsWith('/api/inscripciones/') && method === 'DELETE') {
        const inscripcionId = url.split('/').pop();
        const inscripcion = inscripcionesRepo.getInscripcion(inscripcionId);

        if (!inscripcion) {
          return { status: 404, statusText: 'Not Found', body: { error: 'Inscripción no encontrada' } };
        }

        const activePeriod = periodosRepo.getActivo();
        const asignatura = asignaturasRepo.getAsignatura(inscripcion.asignaturaId);
        
        // --- RULE RN-06: Cancel deadline (Up to 5 business days before end of period) ---
        // Let's assume window.simulatedDate exists for testing, otherwise use current local date
        const simulatedDate = window.simulatedDate ? new Date(window.simulatedDate) : new Date();
        const closingDate = new Date(activePeriod.fechaFin);
        
        // Standard check: difference in milliseconds converted to days
        const diffTime = closingDate - simulatedDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Simple business days approximation: 5 business days is about 7 calendar days
        if (diffDays < 7) {
          sys.log(`[Business Error] RN-06: Fuera del plazo legal de cancelación. Días restantes al fin del periodo: ${diffDays} (Cierre: ${activePeriod.fechaFin})`, 'error');
          return { status: 422, statusText: 'Unprocessable Entity', body: { error: 'Fuera del plazo de cancelación' } };
        }

        // Apply State Pattern to CANCEL enrollment
        sys.InscripcionStateManager.transition(inscripcion, 'cancelar');
        inscripcionesRepo.save(inscripcion, 'inscripcionId');

        // Free slot
        if (asignatura) {
          sys.log(`[Database Transaction] BEGIN TRANSACTION;`, 'db');
          asignatura.cupoActual = Math.max(0, asignatura.cupoActual - 1);
          if (asignatura.cupoActual < asignatura.cupoMaximo) {
            asignatura.estado = 'ACTIVA';
          }
          asignaturasRepo.save(asignatura, 'asignaturaId');
          sys.log(`[Database Transaction] UPDATE asignaturas SET cupoActual = ${asignatura.cupoActual} WHERE id = '${asignatura.asignaturaId}';`, 'db');
          sys.log(`[Database Transaction] COMMIT;`, 'db');

          // Trigger Observer Pattern to notify Waitlist
          slotSubject.notify(asignatura.asignaturaId, asignatura.cupoMaximo - asignatura.cupoActual);
        }

        return { status: 200, statusText: 'OK', body: { message: 'Inscripción cancelada con éxito' } };
      }

      // 10. POST /api/lista-espera (Add to Waitlist)
      if (url === '/api/lista-espera' && method === 'POST') {
        const { estudianteId, asignaturaId } = body;
        
        const existing = waitlistRepo.filter(w => w.estudianteId === estudianteId && w.asignaturaId === asignaturaId);
        if (existing.length > 0) {
          return { status: 409, statusText: 'Conflict', body: { error: 'Ya estás en la lista de espera de esta asignatura' } };
        }

        const waitItem = {
          waitlistId: `WLT-${Math.floor(100 + Math.random() * 900)}`,
          estudianteId,
          asignaturaId,
          fechaRegistro: new Date().toISOString()
        };

        waitlistRepo.save(waitItem, 'waitlistId');
        sys.log(`[Database] Agregado a lista de espera. Posición: ${waitlistRepo.getWaitlistForAsignatura(asignaturaId).length}`, 'warning');

        return { status: 201, statusText: 'Created', body: waitItem };
      }

    } catch (err) {
      console.error(err);
      return { status: 500, statusText: 'Internal Server Error', body: { error: err.message } };
    }

    return { status: 404, statusText: 'Not Found', body: { error: 'Endpoint no configurado' } };
  }

  // Subscribe waitlist observer to changes
  const waitlistObserver = new sys.WaitlistNotifierObserver(waitlistRepo, mockFetch);
  slotSubject.subscribe(waitlistObserver);

  // Global resets function to seed values
  function resetDatabase() {
    localStorage.removeItem('academic_db_estudiantes');
    localStorage.removeItem('academic_db_asignaturas');
    localStorage.removeItem('academic_db_inscripciones');
    localStorage.removeItem('academic_db_periodos');
    localStorage.removeItem('academic_db_prerequisitos');
    localStorage.removeItem('academic_db_historial');
    localStorage.removeItem('academic_db_waitlist');
    sys.log("[Database] Base de datos restablecida a valores iniciales", 'warning');
    window.location.reload();
  }

  // Bind properties to namespace
  sys.mockFetch = mockFetch;
  sys.resetDatabase = resetDatabase;
  sys.waitlistRepo = waitlistRepo;
  sys.historialRepo = historialRepo;
  sys.inscripcionesRepo = inscripcionesRepo;
  sys.asignaturasRepo = asignaturasRepo;
  sys.estudiantesRepo = estudiantesRepo;

})(window.AcademicSystem);
