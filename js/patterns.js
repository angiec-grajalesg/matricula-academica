// Academic Enrollment System - Design Patterns
window.AcademicSystem = window.AcademicSystem || {};

(function(sys) {
  // ==========================================
  // 1. REPOSITORY PATTERN
  // ==========================================
  
  // Base Repository class using LocalStorage as DB
  class BaseRepository {
    constructor(storageKey, defaultData = []) {
      this.storageKey = `academic_db_${storageKey}`;
      if (!localStorage.getItem(this.storageKey)) {
        this.saveAll(defaultData);
      }
    }

    getAll() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
      } catch (e) {
        console.error("Error reading repository data", e);
        return [];
      }
    }

    saveAll(data) {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    find(predicate) {
      return this.getAll().find(predicate);
    }

    filter(predicate) {
      return this.getAll().filter(predicate);
    }

    getById(id, idKey) {
      return this.find(item => item[idKey] === id);
    }

    save(item, idKey) {
      const data = this.getAll();
      const index = data.findIndex(x => x[idKey] === item[idKey]);
      if (index !== -1) {
        data[index] = item;
      } else {
        data.push(item);
      }
      this.saveAll(data);
      return item;
    }

    delete(id, idKey) {
      let data = this.getAll();
      const item = data.find(x => x[idKey] === id);
      data = data.filter(x => x[idKey] !== id);
      this.saveAll(data);
      return item;
    }
  }

  // Specialized Repositories
  class EstudianteRepository extends BaseRepository {
    constructor() {
      super('estudiantes', sys.DEFAULT_SEEDS.estudiantes);
    }
    
    getEstudiante(estudianteId) {
      return this.getById(estudianteId, 'estudianteId');
    }
  }

  class AsignaturaRepository extends BaseRepository {
    constructor() {
      super('asignaturas', sys.DEFAULT_SEEDS.asignaturas);
    }

    getAsignatura(asignaturaId) {
      return this.getById(asignaturaId, 'asignaturaId');
    }

    getAsignaturaByCodigo(codigo) {
      return this.find(a => a.codigo === codigo);
    }
  }

  class InscripcionRepository extends BaseRepository {
    constructor() {
      super('inscripciones', sys.DEFAULT_SEEDS.inscripciones);
    }

    getInscripcion(inscripcionId) {
      return this.getById(inscripcionId, 'inscripcionId');
    }

    getInscripcionesPorEstudiante(estudianteId) {
      return this.filter(i => i.estudianteId === estudianteId);
    }
  }

  class PeriodoRepository extends BaseRepository {
    constructor() {
      super('periodos', sys.DEFAULT_SEEDS.periodos);
    }

    getActivo() {
      return this.find(p => p.activo === true);
    }
  }

  class PrerequisitoRepository extends BaseRepository {
    constructor() {
      super('prerequisitos', sys.DEFAULT_SEEDS.prerequisitos);
    }

    getPrerequisitosDeAsignatura(asignaturaId) {
      return this.filter(p => p.asignaturaId === asignaturaId);
    }

    // Business Logic: Check if student has approved all prerequisites
    async verificarTodos(estudianteId, asignaturaId, historialRepo) {
      const prereqs = this.getPrerequisitosDeAsignatura(asignaturaId);
      if (prereqs.length === 0) return true;

      const historial = historialRepo.filter(h => h.estudianteId === estudianteId);
      
      for (const req of prereqs) {
        // Find if student passed the prerequisite course with grade >= 3.0
        const record = historial.find(h => h.asignaturaId === req.requiereId);
        if (!record || record.nota < 3.0 || record.estado !== 'CURSADA') {
          return false;
        }
      }
      return true;
    }
  }

  class HistorialAcademicoRepository extends BaseRepository {
    constructor() {
      super('historial', sys.DEFAULT_SEEDS.historialAcademico);
    }
  }

  class WaitlistRepository extends BaseRepository {
    constructor() {
      super('waitlist', sys.DEFAULT_SEEDS.listaEspera);
    }

    getWaitlistForAsignatura(asignaturaId) {
      return this.filter(w => w.asignaturaId === asignaturaId).sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro));
    }
  }

  // ==========================================
  // 2. OBSERVER PATTERN
  // ==========================================

  class SlotAvailabilitySubject {
    constructor() {
      this.observers = [];
    }

    subscribe(observer) {
      if (!this.observers.includes(observer)) {
        this.observers.push(observer);
      }
    }

    unsubscribe(observer) {
      this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(asignaturaId, cuposDisponibles) {
      this.observers.forEach(observer => {
        observer.update(asignaturaId, cuposDisponibles);
      });
    }
  }

  // Concrete Observer for Waitlist
  class WaitlistNotifierObserver {
    constructor(waitlistRepo, mockApi) {
      this.waitlistRepo = waitlistRepo;
      this.mockApi = mockApi;
    }

    update(asignaturaId, cuposDisponibles) {
      if (cuposDisponibles <= 0) return;

      const queue = this.waitlistRepo.getWaitlistForAsignatura(asignaturaId);
      if (queue.length > 0) {
        // Get the first student in the queue
        const nextStudent = queue[0];
        
        sys.log(`[Observer Pattern] Slot available in Subject ${asignaturaId}. Notifying student ${nextStudent.estudianteId} from waitlist.`, 'info');
        
        // Dispatch custom event to notify UI
        const event = new CustomEvent('waitlistNotification', {
          detail: {
            asignaturaId,
            estudianteId: nextStudent.estudianteId,
            waitlistId: nextStudent.waitlistId
          }
        });
        window.dispatchEvent(event);
      }
    }
  }

  // ==========================================
  // 3. STATE PATTERN
  // ==========================================

  class InscripcionState {
    constructor(inscripcion) {
      this.inscripcion = inscripcion;
    }

    confirmar() {
      throw new Error(`No se puede confirmar una inscripción en estado ${this.constructor.name}`);
    }

    cancelar() {
      throw new Error(`No se puede cancelar una inscripción en estado ${this.constructor.name}`);
    }

    cursar() {
      throw new Error(`No se puede calificar/cursar una inscripción en estado ${this.constructor.name}`);
    }
  }

  class PendienteState extends InscripcionState {
    confirmar() {
      this.inscripcion.estado = 'CONFIRMADA';
      sys.log(`[State Pattern] Transición de Inscripción: PENDIENTE ➔ CONFIRMADA`, 'success');
    }

    cancelar() {
      this.inscripcion.estado = 'CANCELADA';
      sys.log(`[State Pattern] Transición de Inscripción: PENDIENTE ➔ CANCELADA`, 'warning');
    }
  }

  class ConfirmadaState extends InscripcionState {
    cancelar() {
      this.inscripcion.estado = 'CANCELADA';
      sys.log(`[State Pattern] Transición de Inscripción: CONFIRMADA ➔ CANCELADA`, 'warning');
    }

    cursar(nota) {
      this.inscripcion.estado = 'CURSADA';
      this.inscripcion.nota = nota;
      sys.log(`[State Pattern] Transición de Inscripción: CONFIRMADA ➔ CURSADA con nota ${nota}`, 'success');
    }
  }

  class CanceladaState extends InscripcionState {
    // End state, no actions allowed
  }

  class CursadaState extends InscripcionState {
    // End state, completed
  }

  class InscripcionStateManager {
    static getContext(inscripcion) {
      switch(inscripcion.estado) {
        case 'PENDIENTE': return new PendienteState(inscripcion);
        case 'CONFIRMADA': return new ConfirmadaState(inscripcion);
        case 'CANCELADA': return new CanceladaState(inscripcion);
        case 'CURSADA': return new CursadaState(inscripcion);
        default: return new PendienteState(inscripcion);
      }
    }

    static transition(inscripcion, action, payload = null) {
      const context = this.getContext(inscripcion);
      if (action === 'confirmar') {
        context.confirmar();
      } else if (action === 'cancelar') {
        context.cancelar();
      } else if (action === 'cursar') {
        context.cursar(payload);
      }
      return inscripcion;
    }
  }

  // ==========================================
  // 4. FACTORY PATTERN
  // ==========================================

  class PeriodoFactory {
    static createPeriodo(codigo, fechaInicio, fechaFin, activo = false) {
      const id = `PER-${codigo.replace('-', '_')}_${Math.floor(Math.random() * 1000)}`;
      sys.log(`[Factory Pattern] PeriodoFactory ha creado un nuevo periodo académico con ID: ${id}`, 'success');
      return {
        periodoId: id,
        codigo,
        fechaInicio,
        fechaFin,
        activo
      };
    }
  }

  // Attach all implementations to window namespace
  sys.EstudianteRepository = EstudianteRepository;
  sys.AsignaturaRepository = AsignaturaRepository;
  sys.InscripcionRepository = InscripcionRepository;
  sys.PeriodoRepository = PeriodoRepository;
  sys.PrerequisitoRepository = PrerequisitoRepository;
  sys.HistorialAcademicoRepository = HistorialAcademicoRepository;
  sys.WaitlistRepository = WaitlistRepository;
  
  sys.SlotAvailabilitySubject = SlotAvailabilitySubject;
  sys.WaitlistNotifierObserver = WaitlistNotifierObserver;
  sys.InscripcionStateManager = InscripcionStateManager;
  sys.PeriodoFactory = PeriodoFactory;

  // Simple central logs function
  sys.log = function(message, type = 'info') {
    const event = new CustomEvent('systemLog', { detail: { message, type } });
    window.dispatchEvent(event);
  };

})(window.AcademicSystem);
