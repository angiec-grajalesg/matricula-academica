// Academic Enrollment System - NodeJS Verification Suite
const fs = require('fs');
const path = require('path');

// Mock browser environments
const storage = {};
global.window = global;
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = val; },
  removeItem: (key) => { delete storage[key]; }
};
global.CustomEvent = class {};
global.dispatchEvent = () => {};

// Helper to load files in global scope
function loadScript(filePath) {
  const code = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
  eval(code);
}

// Load scripts in order
loadScript('js/seedData.js');
loadScript('js/patterns.js');
loadScript('js/mockApi.js');

// Assert Helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTests() {
  console.log("=========================================");
  console.log("RUNNING ACADEMIC MATRICULA SYSTEM TESTS");
  console.log("=========================================\n");

  const api = global.AcademicSystem;

  // Test Case 1: CP-01 (Inscripción exitosa)
  // Student EST-2025-001 (Ana García), Course ASG-001 (Cálculo Diferencial, 3cr, has space)
  console.log("[Test CP-01] Running Enrollment Success test...");
  let res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({
      estudianteId: 'EST-2025-001',
      asignaturaId: 'ASG-001',
      periodoId: 'PER-2025-2'
    })
  });
  assert(res.status === 201, `CP-01 failed: expected 201, got ${res.status}`);
  console.log("✓ CP-01 Success: Enrollment created.\n");

  // Test Case 2: CP-02 (Sin prerrequisito)
  // Ana García tries to enroll in Cálculo Integral (requires Cálculo Diferencial approved with >= 3.0. Ana failed it in seed history with 2.5)
  console.log("[Test CP-02] Running Prerequisite check test...");
  res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({
      estudianteId: 'EST-2025-001',
      asignaturaId: 'ASG-002', // Cálculo Integral
      periodoId: 'PER-2025-2'
    })
  });
  assert(res.status === 422, `CP-02 failed: expected 422, got ${res.status}`);
  assert(res.body.error === 'Prerrequisito no aprobado', `CP-02 failed error matching: ${res.body.error}`);
  console.log("✓ CP-02 Success: Blocked enrollment due to failed prerequisite.\n");

  // Test Case 3: CP-03 (Sin cupo)
  // Física I (ASG-003) is full (5/5). Juan Pérez tries to enroll
  console.log("[Test CP-03] Running Space Availability test...");
  res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({
      estudianteId: 'EST-2025-002',
      asignaturaId: 'ASG-003', // Física I
      periodoId: 'PER-2025-2'
    })
  });
  assert(res.status === 409, `CP-03 failed: expected 409, got ${res.status}`);
  assert(res.body.waitlistOffer === true, `CP-03 failed waitlist validation`);
  console.log("✓ CP-03 Success: Blocked enrollment and offered waitlist.\n");

  // Test Case 4: CP-04 (Límite de créditos)
  // Juan Pérez has 0 credits. Tries to enroll in Proyecto de Grado (15cr) -> Succeeds.
  // Then tries to enroll in Física I waitlist, but let's enroll him in Cálculo Diferencial (3cr) -> Succeeds.
  // Now Juan has 18 credits. If he tries to enroll in Introducción a la Programación (3cr), he should be blocked.
  console.log("[Test CP-04] Running Credit Limit test...");
  // Enroll in Proyecto de Grado (15 cr)
  res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({ estudianteId: 'EST-2025-002', asignaturaId: 'ASG-006', periodoId: 'PER-2025-2' })
  });
  assert(res.status === 201, `Enroll 15cr failed: ${res.status}`);

  // Enroll in Cálculo Diferencial (3 cr)
  res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({ estudianteId: 'EST-2025-002', asignaturaId: 'ASG-001', periodoId: 'PER-2025-2' })
  });
  assert(res.status === 201, `Enroll 3cr failed: ${res.status}`);

  // Enroll in Introducción a la Programación (3 cr) -> Should fail because total would be 21 > 18
  res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({ estudianteId: 'EST-2025-002', asignaturaId: 'ASG-004', periodoId: 'PER-2025-2' })
  });
  assert(res.status === 422, `CP-04 failed: expected 422, got ${res.status}`);
  assert(res.body.error === 'Superarías el límite de 18 créditos', `CP-04 error matching failed: ${res.body.error}`);
  console.log("✓ CP-04 Success: Blocked enrollment exceeding 18 credits limit.\n");

  // Test Case 6: CP-06 (Estudiante suspendido)
  // Carlos Ruiz (EST-2025-003) is SUSPENDIDO. Tries to enroll in Introducción a la Programación
  console.log("[Test CP-06] Running Suspended Student test...");
  res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({
      estudianteId: 'EST-2025-003',
      asignaturaId: 'ASG-004',
      periodoId: 'PER-2025-2'
    })
  });
  assert(res.status === 403, `CP-06 failed: expected 403, got ${res.status}`);
  assert(res.body.error === 'Estudiante no habilitado', `CP-06 error matching failed: ${res.body.error}`);
  console.log("✓ CP-06 Success: Blocked suspended student enrollment.\n");

  // Test Case 7: CP-07 (Doble inscripción)
  // Ana García is already enrolled in Cálculo Diferencial (ASG-001). Tries to enroll again in same course/period
  console.log("[Test CP-07] Running Double Enrollment test...");
  res = await api.mockFetch('/api/inscripciones', {
    method: 'POST',
    body: JSON.stringify({
      estudianteId: 'EST-2025-001',
      asignaturaId: 'ASG-001',
      periodoId: 'PER-2025-2'
    })
  });
  assert(res.status === 409, `CP-07 failed: expected 409, got ${res.status}`);
  assert(res.body.error === 'Ya estás inscrito en esta asignatura', `CP-07 error matching: ${res.body.error}`);
  console.log("✓ CP-07 Success: Blocked duplicate enrollment.\n");

  // Find Ana's enrollment ID for cancellation tests
  const enrollments = new api.InscripcionRepository().getAll();
  const anaEnrollment = enrollments.find(e => e.estudianteId === 'EST-2025-001' && e.asignaturaId === 'ASG-001');
  assert(!!anaEnrollment, "Ana's enrollment not found for cancellation test");

  // Test Case 9: CP-09 (Cancelación fuera de plazo)
  // Simulate date close to academic period end date (2025-12-05). Let's simulate 2025-12-03 (2 days before)
  console.log("[Test CP-09] Running Cancellation outside deadline test...");
  global.simulatedDate = '2025-12-03';
  res = await api.mockFetch(`/api/inscripciones/${anaEnrollment.inscripcionId}`, {
    method: 'DELETE'
  });
  assert(res.status === 422, `CP-09 failed: expected 422, got ${res.status}`);
  assert(res.body.error === 'Fuera del plazo de cancelación', `CP-09 error matching: ${res.body.error}`);
  console.log("✓ CP-09 Success: Blocked cancellation close to closing date.\n");

  // Test Case 8: CP-08 (Cancelación en plazo)
  // Simulate date on 2025-10-15 (more than 7 calendar days before 2025-12-05)
  console.log("[Test CP-08] Running Cancellation within deadline test...");
  global.simulatedDate = '2025-10-15';
  
  // Get subject's current slots
  const asigRepo = new api.AsignaturaRepository();
  const currentSlotsBefore = asigRepo.getAsignatura('ASG-001').cupoActual;

  res = await api.mockFetch(`/api/inscripciones/${anaEnrollment.inscripcionId}`, {
    method: 'DELETE'
  });
  assert(res.status === 200, `CP-08 failed: expected 200, got ${res.status}`);
  
  const currentSlotsAfter = asigRepo.getAsignatura('ASG-001').cupoActual;
  assert(currentSlotsAfter === currentSlotsBefore - 1, "CP-08 failed slot decrement check");
  console.log("✓ CP-08 Success: Cancelled enrollment and successfully decremented slots.\n");

  console.log("=========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY");
  console.log("=========================================");
}

runTests().catch(err => {
  console.error("TEST RUN ERROR:", err);
  process.exit(1);
});
