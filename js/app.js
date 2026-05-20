// Academic Enrollment System - Application Controller
window.AcademicSystem = window.AcademicSystem || {};

(function(sys) {
  // Global DOM Elements
  let studentSelector, dateSimulator, tabButtons, tabContents;
  let studentIdDisplay, studentProgramDisplay, studentSemesterDisplay, academicPeriodDisplay, studentStatusBadge;
  let creditsRatioText, creditsProgressBar, courseSelect, courseDetailsBox, enrollBtn;
  let detailCode, detailCredits, detailSlots, detailSchedule, detailPrereqsAlert;
  let waitlistCard, waitlistCourseName, waitlistAcceptBtn, waitlistDeclineBtn;
  let scheduleBody, enrollmentHistoryBody;
  
  let crudSearch, crudFilterCredits, crudFilterStatus, crudTableBody, prevPageBtn, nextPageBtn, pageIndicator;
  let subjectModal, subjectForm, modalTitle, modalSubjectId, modalCode, modalName, modalCredits, modalMaxSlots;
  let modalTimeStart, modalTimeEnd, deleteModal, deleteCourseName, confirmDeleteBtn;

  // App State Variables
  let currentStudentId = "EST-2025-001";
  let activePeriod = null;
  let selectedAsignatura = null;
  let waitlistAsignaturaId = null;

  // CRUD Pagination State
  let crudCurrentPage = 1;
  const crudItemsPerPage = 5;

  // Initialize Application
  document.addEventListener("DOMContentLoaded", async () => {
    cacheDomElements();
    setupEventListeners();
    await loadInitialSettings();
    renderAll();
  });

  function cacheDomElements() {
    studentSelector = document.getElementById("studentSelector");
    dateSimulator = document.getElementById("dateSimulator");
    tabButtons = document.querySelectorAll(".tab-btn");
    tabContents = document.querySelectorAll(".tab-content");

    studentIdDisplay = document.getElementById("student-id-display");
    studentProgramDisplay = document.getElementById("student-program-display");
    studentSemesterDisplay = document.getElementById("student-semester-display");
    academicPeriodDisplay = document.getElementById("academic-period-display");
    studentStatusBadge = document.getElementById("student-status-badge");

    creditsRatioText = document.getElementById("credits-ratio-text");
    creditsProgressBar = document.getElementById("credits-progress-bar");
    courseSelect = document.getElementById("course-select");
    courseDetailsBox = document.getElementById("course-details-box");
    enrollBtn = document.getElementById("enroll-btn");

    detailCode = document.getElementById("detail-code");
    detailCredits = document.getElementById("detail-credits");
    detailSlots = document.getElementById("detail-slots");
    detailSchedule = document.getElementById("detail-schedule");
    detailPrereqsAlert = document.getElementById("detail-prereqs-alert");

    waitlistCard = document.getElementById("waitlist-card");
    waitlistCourseName = document.getElementById("waitlist-course-name");
    waitlistAcceptBtn = document.getElementById("waitlist-accept-btn");
    waitlistDeclineBtn = document.getElementById("waitlist-decline-btn");

    scheduleBody = document.getElementById("schedule-body");
    enrollmentHistoryBody = document.getElementById("enrollment-history-body");

    // CRUD elements
    crudSearch = document.getElementById("crud-search");
    crudFilterCredits = document.getElementById("crud-filter-credits");
    crudFilterStatus = document.getElementById("crud-filter-status");
    crudTableBody = document.getElementById("crud-table-body");
    prevPageBtn = document.getElementById("prev-page-btn");
    nextPageBtn = document.getElementById("next-page-btn");
    pageIndicator = document.getElementById("page-indicator");

    // Modal elements
    subjectModal = document.getElementById("subject-modal");
    subjectForm = document.getElementById("subject-form");
    modalTitle = document.getElementById("modal-title");
    modalSubjectId = document.getElementById("modal-subject-id");
    modalCode = document.getElementById("modal-code");
    modalName = document.getElementById("modal-name");
    modalCredits = document.getElementById("modal-credits");
    modalMaxSlots = document.getElementById("modal-max-slots");
    modalTimeStart = document.getElementById("modal-time-start");
    modalTimeEnd = document.getElementById("modal-time-end");

    deleteModal = document.getElementById("delete-modal");
    deleteCourseName = document.getElementById("delete-course-name");
    confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  }

  function setupEventListeners() {
    // Student switch
    studentSelector.addEventListener("change", (e) => {
      currentStudentId = e.target.value;
      hideWaitlistCard();
      courseDetailsBox.classList.add("hidden");
      courseSelect.value = "";
      enrollBtn.disabled = true;
      sys.log(`[UI] Perfil de estudiante cambiado a: ${currentStudentId}`, 'info');
      renderAll();
    });

    // Date simulator switch
    dateSimulator.addEventListener("change", (e) => {
      window.simulatedDate = e.target.value;
      sys.log(`[UI] Fecha simulada del sistema cambiada a: ${window.simulatedDate}`, 'warning');
      renderAll();
    });

    // Tab buttons
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        
        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");
      });
    });

    // Course dropdown switch
    courseSelect.addEventListener("change", async (e) => {
      const id = e.target.value;
      if (!id) {
        courseDetailsBox.classList.add("hidden");
        updateEnrollButtonState();
        return;
      }
      courseDetailsBox.classList.remove("hidden");
      await loadCourseDetails(id);
    });

    // Main Enroll button click
    enrollBtn.addEventListener("click", async () => {
      if (!courseSelect.value) return;
      enrollBtn.disabled = true;
      enrollBtn.innerText = "Procesando...";

      if (!activePeriod || !activePeriod.periodoId) {
        showToast('Error de Inscripción', 'No hay periodo académico activo. Reinicia la aplicación.', 'error');
        enrollBtn.disabled = false;
        return;
      }

      const res = await sys.mockFetch('/api/inscripciones', {
        method: 'POST',
        body: JSON.stringify({
          estudianteId: currentStudentId,
          asignaturaId: courseSelect.value,
          periodoId: activePeriod.periodoId
        })
      });

      enrollBtn.innerText = "Inscribir Asignatura";

      if (res.status === 201) {
        showToast("Inscripción exitosa", `Asignatura matriculada y correo enviado.`, 'success');
        renderAll();
      } else if (res.status === 409 && res.body.waitlistOffer) {
        // Show waitlist dialog
        const asig = sys.asignaturasRepo.getAsignatura(courseSelect.value);
        waitlistAsignaturaId = courseSelect.value;
        waitlistCourseName.innerText = asig.nombre;
        
        document.querySelector(".enrollment-card").classList.add("hidden");
        waitlistCard.classList.remove("hidden");
        sys.log(`[UI] Se despliega advertencia de cupo completo. Ofertando lista de espera.`, 'warning');
      } else {
        showToast("Error de Inscripción", res.body.error, 'error');
        enrollBtn.disabled = false;
      }
    });

    // Waitlist dialog actions
    waitlistAcceptBtn.addEventListener("click", async () => {
      const res = await sys.mockFetch('/api/lista-espera', {
        method: 'POST',
        body: JSON.stringify({
          estudianteId: currentStudentId,
          asignaturaId: waitlistAsignaturaId
        })
      });

      if (res.status === 201) {
        showToast("Lista de espera", "Agregado correctamente a la lista de espera.", 'warning');
      } else {
        showToast("Error", res.body.error, 'error');
      }
      hideWaitlistCard();
      renderAll();
    });

    waitlistDeclineBtn.addEventListener("click", () => {
      hideWaitlistCard();
      renderAll();
    });

    // Coordinator search & filters
    crudSearch.addEventListener("input", () => { crudCurrentPage = 1; renderCoordinatorCRUD(); });
    crudFilterCredits.addEventListener("change", () => { crudCurrentPage = 1; renderCoordinatorCRUD(); });
    crudFilterStatus.addEventListener("change", () => { crudCurrentPage = 1; renderCoordinatorCRUD(); });

    // Pagination
    prevPageBtn.addEventListener("click", () => {
      if (crudCurrentPage > 1) {
        crudCurrentPage--;
        renderCoordinatorCRUD();
      }
    });

    nextPageBtn.addEventListener("click", () => {
      crudCurrentPage++;
      renderCoordinatorCRUD();
    });

    // Modal triggers
    document.getElementById("open-create-modal-btn").addEventListener("click", () => {
      openModal(null);
    });

    document.getElementById("close-modal-btn").addEventListener("click", closeModal);
    document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
    document.getElementById("close-delete-modal-btn").addEventListener("click", closeDeleteModal);
    document.getElementById("cancel-delete-btn").addEventListener("click", closeDeleteModal);
    confirmDeleteBtn.addEventListener("click", async () => {
      if (!deleteSubjectId) return;
      
      const res = await sys.mockFetch(`/api/asignaturas/${deleteSubjectId}`, {
        method: 'DELETE'
      });

      if (res.status === 200) {
        showToast("Desactivada", "Asignatura desactivada correctamente.", 'warning');
        closeDeleteModal();
        renderAll();
      } else {
        showToast("Error", res.body.error, 'error');
      }
    });

    crudTableBody.addEventListener('click', (event) => {
      const button = event.target.closest('.action-btn');
      if (!button) return;

      const action = button.dataset.action;
      const id = button.dataset.id;

      if (action === 'edit') {
        openModal(id);
      } else if (action === 'delete') {
        openDeleteModal(id);
      } else if (action === 'activate') {
        activateSubject(id);
      }
    });

    // Save Course Submit
    subjectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const payload = {
        codigo: modalCode.value,
        nombre: modalName.value,
        creditos: parseInt(modalCredits.value),
        cupoMaximo: parseInt(modalMaxSlots.value),
        horario: {
          dias: Array.from(document.querySelectorAll('input[name="modal-days"]:checked')).map(cb => cb.value),
          horaInicio: modalTimeStart.value,
          horaFin: modalTimeEnd.value
        }
      };

      if (payload.horario.dias.length === 0) {
        showToast("Error", "Debe seleccionar al menos un día para el horario.", 'error');
        return;
      }

      const id = modalSubjectId.value;
      let res;
      if (id) {
        res = await sys.mockFetch(`/api/asignaturas/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await sys.mockFetch('/api/asignaturas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.status === 201 || res.status === 200) {
        showToast("Guardado", "Asignatura guardada exitosamente.", 'success');
        closeModal();
        renderAll();
      } else {
        showToast("Error", res.body.error, 'error');
      }
    });

    // Global listeners for events
    window.addEventListener('waitlistNotification', (e) => {
      const student = sys.estudiantesRepo.getEstudiante(e.detail.estudianteId);
      const asig = sys.asignaturasRepo.getAsignatura(e.detail.asignaturaId);
      
      showToast("Cupo Disponible", `Se liberó cupo en ${asig.nombre}. Se notificará al estudiante ${student.nombre}.`, 'warning');
      
      // Auto enroll from waitlist (observer action simulation)
      setTimeout(async () => {
        sys.log(`[Observer Pattern] Auto-procesando matrícula de lista de espera para ${student.nombre} en ${asig.codigo}`, 'info');
        
        // Remove from waitlist
        sys.waitlistRepo.delete(e.detail.waitlistId, 'waitlistId');
        
        // Enroll via mock API
        const enrollRes = await sys.mockFetch('/api/inscripciones', {
          method: 'POST',
          body: JSON.stringify({
            estudianteId: student.estudianteId,
            asignaturaId: asig.asignaturaId,
            periodoId: activePeriod.periodoId
          })
        });

        if (enrollRes.status === 201) {
          showToast("Matrícula automática", `Estudiante ${student.nombre} matriculado exitosamente desde lista de espera.`, 'success');
          renderAll();
        }
      }, 2000);
    });
  }

  async function loadInitialSettings() {
    // Load student selector dropdown
    const students = sys.estudiantesRepo.getAll();
    const subjects = sys.asignaturasRepo.getAll();

    if (students.length === 0 || subjects.length === 0) {
      sys.log("[Startup] Datos esenciales faltantes. Reiniciando base de datos.", 'warning');
      sys.resetDatabase();
      return;
    }

    studentSelector.innerHTML = students.map(s => 
      `<option value="${s.estudianteId}">${s.nombre} ${s.apellido} (${s.estado})</option>`
    ).join('');

    if (!students.some(s => s.estudianteId === currentStudentId)) {
      currentStudentId = students[0].estudianteId;
    }

    // Fetch active period
    const res = await sys.mockFetch('/api/periodos/activo');
    if (res.status === 200) {
      activePeriod = res.body;
      academicPeriodDisplay.innerText = activePeriod.codigo;
    } else {
      sys.log("[Startup] No existe periodo activo. Reiniciando base de datos.", 'warning');
      sys.resetDatabase();
      return;
    }

    // Set initial date simulator value
    window.simulatedDate = dateSimulator.value;
  }

  function renderAll() {
    renderStudentProfile();
    renderCourseSelectDropdown();
    renderSchedule();
    renderEnrollmentHistory();
    renderCoordinatorCRUD();
    updateEnrollButtonState();
  }

  function hideWaitlistCard() {
    waitlistCard.classList.add("hidden");
    document.querySelector(".enrollment-card").classList.remove("hidden");
    waitlistAsignaturaId = null;
  }

  // PORTAL 1: STUDENT VIEW RENDERING
  function renderStudentProfile() {
    const student = sys.estudiantesRepo.getEstudiante(currentStudentId);
    if (!student) return;

    studentIdDisplay.innerText = student.estudianteId;
    studentProgramDisplay.innerText = student.programa;
    studentSemesterDisplay.innerText = student.semestre;
    
    studentStatusBadge.innerText = student.estado;
    studentStatusBadge.className = "badge"; // reset
    if (student.estado === 'ACTIVO') {
      studentStatusBadge.classList.add("badge-active");
    } else {
      studentStatusBadge.classList.add("badge-suspendido");
    }

    // Credits calculations
    const enrollments = sys.inscripcionesRepo.getAll().filter(e => 
      e.estudianteId === currentStudentId && 
      e.periodoId === activePeriod.periodoId &&
      e.estado !== 'CANCELADA'
    );

    const totalCredits = enrollments.reduce((sum, e) => {
      const asig = sys.asignaturasRepo.getAsignatura(e.asignaturaId);
      return sum + (asig ? asig.creditos : 0);
    }, 0);

    creditsRatioText.innerText = `${totalCredits} / 18`;
    
    // Progress Bar Style
    const percentage = Math.min((totalCredits / 18) * 100, 100);
    creditsProgressBar.style.width = `${percentage}%`;
    creditsProgressBar.className = "progress-bar-fill"; // reset
    
    if (totalCredits > 15 && totalCredits <= 18) {
      creditsProgressBar.classList.add("warning");
    } else if (totalCredits > 18) {
      creditsProgressBar.classList.add("danger");
    }
  }

  function renderCourseSelectDropdown() {
    // Only show active courses that student is not currently enrolled in
    const subjects = sys.asignaturasRepo.getAll().filter(s => s.estado !== 'INACTIVA');
    const myEnrolledIds = sys.inscripcionesRepo.getAll()
      .filter(e => e.estudianteId === currentStudentId && e.periodoId === activePeriod.periodoId && e.estado !== 'CANCELADA')
      .map(e => e.asignaturaId);

    // Build options
    let html = '<option value="">-- Seleccionar Asignatura --</option>';
    let firstAvailableId = null;
    subjects.forEach(s => {
      const isMyEnrolled = myEnrolledIds.includes(s.asignaturaId);
      const text = `${s.codigo} - ${s.nombre} (${s.creditos} Créditos) ${s.estado === 'LLENA' ? '[CUPO LLENO]' : ''}`;
      
      if (!isMyEnrolled) {
        if (!firstAvailableId) firstAvailableId = s.asignaturaId;
        html += `<option value="${s.asignaturaId}">${text}</option>`;
      }
    });

    courseSelect.innerHTML = html;

    if (firstAvailableId) {
      courseSelect.value = firstAvailableId;
      courseSelect.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    } else {
      courseDetailsBox.classList.add("hidden");
      enrollBtn.disabled = true;
    }
  }

  function updateEnrollButtonState() {
    const hasSelection = courseSelect && courseSelect.value;
    const detailsVisible = courseDetailsBox && !courseDetailsBox.classList.contains('hidden');
    const shouldEnable = hasSelection && detailsVisible;

    enrollBtn.disabled = !shouldEnable;
    if (shouldEnable) {
      enrollBtn.removeAttribute('disabled');
    }
  }

  async function loadCourseDetails(id) {
    const asig = sys.asignaturasRepo.getAsignatura(id);
    if (!asig) return;

    detailCode.innerText = asig.codigo;
    detailCredits.innerText = asig.creditos;
    detailSlots.innerText = `${asig.cupoActual} / ${asig.cupoMaximo}`;
    detailSchedule.innerText = `${asig.horario.dias.join(', ')} de ${asig.horario.horaInicio} a ${asig.horario.horaFin}`;

    // Verify requirements
    const resCheck = await sys.mockFetch(`/api/prerequisitos/check?est=${currentStudentId}&asig=${id}`);
    
    detailPrereqsAlert.className = "prereqs-alert-info"; // reset
    
    const reqs = sys.prerequisitosRepo.getPrerequisitosDeAsignatura(id);

    if (reqs.length === 0) {
      detailPrereqsAlert.innerText = "Esta asignatura no requiere prerrequisitos.";
      detailPrereqsAlert.classList.add("badge-active");
    } else {
      const names = reqs.map(r => {
        const requiredAsig = sys.asignaturasRepo.getAsignatura(r.requiereId);
        return requiredAsig ? requiredAsig.nombre : r.requiereId;
      }).join(", ");

      if (resCheck.body.approved) {
        detailPrereqsAlert.innerText = `Prerrequisito aprobado: ${names}`;
        detailPrereqsAlert.classList.add("badge-active");
      } else {
        detailPrereqsAlert.innerText = `Requisito: debes aprobar ${names} con Nota ≥ 3.0 antes de inscribir esta asignatura.`;
        detailPrereqsAlert.classList.add("badge-inactiva");
      }
    }

    courseDetailsBox.classList.remove("hidden");
    updateEnrollButtonState();
  }

  function renderSchedule() {
    // Generate schedule visual blocks. Columns: Lu, Ma, Mi, Ju, Vi. Rows: 8-10, 10-12, 12-14, 14-16
    const hours = [
      { start: "08:00", end: "10:00", label: "08:00 - 10:00" },
      { start: "10:00", end: "12:00", label: "10:00 - 12:00" },
      { start: "12:00", end: "14:00", label: "12:00 - 14:00" },
      { start: "14:00", end: "16:00", label: "14:00 - 16:00" }
    ];

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

    // Fetch enrolled subjects for student in active period
    const enrollments = sys.inscripcionesRepo.getAll().filter(e => 
      e.estudianteId === currentStudentId && 
      e.periodoId === activePeriod.periodoId &&
      e.estado !== 'CANCELADA'
    );

    const subjects = enrollments.map(e => sys.asignaturasRepo.getAsignatura(e.asignaturaId)).filter(Boolean);

    let html = "";
    hours.forEach(hour => {
      html += `<tr><td><strong>${hour.label}</strong></td>`;
      days.forEach(day => {
        // Find subject in this day & hour
        const matched = subjects.find(s => {
          if (!s.horario) return false;
          const dayMatch = s.horario.dias.includes(day);
          const timeMatch = s.horario.horaInicio === hour.start;
          
          // Or if course spans multiple slots (e.g. Proyecto de Grado 08:00-12:00)
          const isSpanning = (dayMatch && s.horario.horaInicio <= hour.start && s.horario.horaFin >= hour.end);
          return isSpanning;
        });

        if (matched) {
          html += `<td class="cell-filled" title="${matched.nombre}">${matched.codigo}</td>`;
        } else {
          html += `<td></td>`;
        }
      });
      html += `</tr>`;
    });

    scheduleBody.innerHTML = html;
  }

  function renderEnrollmentHistory() {
    const enrolls = sys.inscripcionesRepo.getAll().filter(e => 
      e.estudianteId === currentStudentId && 
      e.periodoId === activePeriod.periodoId
    );

    if (enrolls.length === 0) {
      enrollmentHistoryBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No tienes inscripciones en este periodo.</td></tr>`;
      return;
    }

    let html = "";
    enrolls.forEach(e => {
      const asig = sys.asignaturasRepo.getAsignatura(e.asignaturaId);
      if (!asig) return;

      const badgeClass = `badge-${e.estado.toLowerCase()}`;
      
      // Cancel button if confirmed
      let actionBtn = "";
      if (e.estado === 'CONFIRMADA') {
        actionBtn = `<button onclick="AcademicSystem.cancelEnrollment('${e.inscripcionId}')" class="btn btn-danger btn-sm">Cancelar</button>`;
      } else {
        actionBtn = `<span class="text-muted">-</span>`;
      }

      html += `
        <tr>
          <td><strong>${asig.codigo}</strong></td>
          <td>${asig.nombre}</td>
          <td>${asig.creditos}</td>
          <td><span class="badge ${badgeClass}">${e.estado}</span></td>
          <td>${actionBtn}</td>
        </tr>
      `;
    });

    enrollmentHistoryBody.innerHTML = html;
  }

  // PORTAL 2: COORDINATOR CRUD VIEW RENDERING
  function renderCoordinatorCRUD() {
    const query = crudSearch.value.toLowerCase();
    const credFilter = crudFilterCredits.value;
    const statusFilter = crudFilterStatus.value;

    let items = sys.asignaturasRepo.getAll();

    // Filters
    if (query) {
      items = items.filter(i => i.nombre.toLowerCase().includes(query) || i.codigo.toLowerCase().includes(query));
    }
    if (credFilter) {
      items = items.filter(i => i.creditos === parseInt(credFilter));
    }
    if (statusFilter) {
      items = items.filter(i => i.estado === statusFilter);
    }

    // Pagination bounds
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / crudItemsPerPage) || 1;
    
    if (crudCurrentPage > totalPages) crudCurrentPage = totalPages;

    const startIdx = (crudCurrentPage - 1) * crudItemsPerPage;
    const endIdx = startIdx + crudItemsPerPage;
    const paginatedItems = items.slice(startIdx, endIdx);

    // Update pagination controls
    pageIndicator.innerText = `Página ${crudCurrentPage} de ${totalPages}`;
    prevPageBtn.disabled = crudCurrentPage === 1;
    nextPageBtn.disabled = crudCurrentPage === totalPages;

    if (paginatedItems.length === 0) {
      crudTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No se encontraron asignaturas.</td></tr>`;
      return;
    }

    let html = "";
    paginatedItems.forEach(s => {
      const badgeClass = `badge-${s.estado.toLowerCase()}`;
      
      const editBtn = `<button data-action="edit" data-id="${s.asignaturaId}" class="btn btn-secondary btn-sm action-btn">✏️ Editar</button>`;
      
      let deleteBtn = "";
      if (s.estado !== 'INACTIVA') {
        deleteBtn = `<button data-action="delete" data-id="${s.asignaturaId}" class="btn btn-danger btn-sm action-btn">🗑️ Desactivar</button>`;
      } else {
        deleteBtn = `<button data-action="activate" data-id="${s.asignaturaId}" class="btn btn-success btn-sm action-btn">✅ Activar</button>`;
      }

      html += `
        <tr>
          <td><strong>${s.codigo}</strong></td>
          <td>${s.nombre}</td>
          <td>${s.creditos}</td>
          <td>${s.cupoMaximo}</td>
          <td>${s.cupoActual}</td>
          <td><span class="badge ${badgeClass}">${s.estado}</span></td>
          <td>
            <div class="btn-row" style="display: flex; gap: 0.5rem;">
              ${editBtn}
              ${deleteBtn}
            </div>
          </td>
        </tr>
      `;
    });

    crudTableBody.innerHTML = html;
  }

  // CANCEL ENROLLMENT
  async function cancelEnrollment(inscripcionId) {
    if (!confirm("¿Seguro que deseas cancelar esta inscripción?")) return;

    const res = await sys.mockFetch(`/api/inscripciones/${inscripcionId}`, {
      method: 'DELETE'
    });

    if (res.status === 200) {
      showToast("Cancelación Exitosa", "La asignatura fue cancelada y se liberó el cupo.", 'warning');
      renderAll();
    } else {
      showToast("Error de Cancelación", res.body.error, 'error');
    }
  }

  // CRUD MODAL MANAGEMENT
  function openModal(asigId = null) {
    subjectForm.reset();
    
    // Clear checkboxes
    document.querySelectorAll('input[name="modal-days"]').forEach(cb => cb.checked = false);

    if (asigId) {
      modalTitle.innerText = "Modificar Asignatura";
      const asig = sys.asignaturasRepo.getAsignatura(asigId);
      modalSubjectId.value = asig.asignaturaId;
      modalCode.value = asig.codigo;
      modalCode.disabled = true; // Can't change code once created
      modalName.value = asig.nombre;
      modalCredits.value = asig.creditos;
      modalMaxSlots.value = asig.cupoMaximo;
      
      if (asig.horario) {
        asig.horario.dias.forEach(day => {
          const cb = document.querySelector(`input[name="modal-days"][value="${day}"]`);
          if (cb) cb.checked = true;
        });
        modalTimeStart.value = asig.horario.horaInicio;
        modalTimeEnd.value = asig.horario.horaFin;
      }
    } else {
      modalTitle.innerText = "Crear Asignatura";
      modalSubjectId.value = "";
      modalCode.disabled = false;
      modalCredits.value = 3;
      modalMaxSlots.value = 30;
      modalTimeStart.value = "08:00";
      modalTimeEnd.value = "10:00";
    }

    subjectModal.classList.remove("hidden");
  }

  function closeModal() {
    subjectModal.classList.add("hidden");
  }

  // DELETE MODAL
  let deleteSubjectId = null;
  function openDeleteModal(id) {
    const asig = sys.asignaturasRepo.getAsignatura(id);
    if (!asig) return;
    deleteSubjectId = id;
    deleteCourseName.innerText = `${asig.nombre} (${asig.codigo})`;
    deleteModal.classList.remove("hidden");
  }

  function closeDeleteModal() {
    deleteModal.classList.add("hidden");
    deleteSubjectId = null;
  }

  async function activateSubject(asignaturaId) {
    const res = await sys.mockFetch(`/api/asignaturas/${asignaturaId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: 'ACTIVA' })
    });

    if (res.status === 200) {
      showToast("Activada", "Asignatura activada nuevamente.", 'success');
      renderAll();
    } else {
      showToast("Error", res.body.error, 'error');
    }
  }

  // TOAST NOTIFICATIONS SYSTEM
  function showToast(title, body, type = 'primary') {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
      <div>
        <strong>${title}</strong>
        <p style="font-size:0.75rem; margin-top:0.25rem;">${body}</p>
      </div>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Auto dismiss
    const timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'opacity 0.25s, transform 0.25s';
      setTimeout(() => toast.remove(), 250);
    }, 4500);

    // Manual close
    toast.querySelector(".toast-close").addEventListener("click", () => {
      clearTimeout(timer);
      toast.remove();
    });
  }

  // Expose callbacks to global namespace for dynamic onclick events
  sys.cancelEnrollment = cancelEnrollment;
  sys.openEditModal = openModal;
  sys.openDeleteModal = openDeleteModal;
  sys.openCreateModal = openModal;

})(window.AcademicSystem);
