const state = { students: [], missions: [] };
const elements = {
  status: document.querySelector('#api-status'), body: document.querySelector('#students-body'), empty: document.querySelector('#empty-students'),
  search: document.querySelector('#search'), detail: document.querySelector('#student-detail'), missionInputs: document.querySelector('#mission-inputs'),
  form: document.querySelector('#progress-form'), message: document.querySelector('#form-message'), save: document.querySelector('#save-button')
};

function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function progressMarkup(student) { return `<div class="progress"><span style="width:${Math.min(100, student.porcentaje)}%"></span></div><small>${student.completadas} / ${student.total}</small>`; }
function statusMarkup(student) { return student.porcentaje === 100 ? '<span class="badge complete">Completado</span>' : '<span class="badge pending">En proceso</span>'; }

function renderStudents() {
  const query = elements.search.value.trim().toLowerCase();
  const filtered = state.students.filter((student) => `${student.carnet} ${student.nombre}`.toLowerCase().includes(query));
  elements.body.innerHTML = filtered.map((student) => `<tr data-carnet="${escapeHtml(student.carnet)}"><td>${escapeHtml(student.carnet)}</td><td><button class="student-link">${escapeHtml(student.nombre)}</button></td><td>${escapeHtml(student.correo)}</td><td>${progressMarkup(student)}</td><td>${student.porcentaje}%</td><td>${statusMarkup(student)}</td></tr>`).join('');
  elements.empty.hidden = filtered.length > 0;
}

function renderMetrics() {
  const students = state.students;
  const average = students.length ? students.reduce((sum, student) => sum + student.porcentaje, 0) / students.length : 0;
  document.querySelector('#metric-students').textContent = students.length;
  document.querySelector('#metric-average').textContent = `${average.toFixed(1)}%`;
  document.querySelector('#metric-complete').textContent = students.filter((student) => student.porcentaje === 100).length;
}

function renderMissionInputs() {
  elements.missionInputs.innerHTML = state.missions.map((mission) => `<label class="mission-toggle"><input type="checkbox" data-mission-id="${mission.misionId}"><span><strong>${escapeHtml(mission.nombre)}</strong><small>${escapeHtml(mission.descripcion || 'Sin descripcion')}</small></span></label>`).join('') || '<p class="muted">El catálogo no tiene misiones.</p>';
}

async function showStudent(carnet) {
  elements.detail.innerHTML = '<p class="muted">Cargando detalle...</p>';
  try {
    const { data } = await window.api.student(carnet);
    elements.detail.innerHTML = `<p class="eyebrow">Detalle del estudiante</p><h2>${escapeHtml(data.nombre)}</h2><p class="student-data">${escapeHtml(data.carnet)}<br>${escapeHtml(data.correo)}</p><div class="detail-summary"><strong>${data.porcentaje}%</strong><span>${data.completadas} completadas · ${data.pendientes} pendientes</span></div><ul class="mission-list">${data.misiones.map((mission) => `<li class="${mission.estado ? 'done' : ''}"><span>${mission.estado ? '✓' : '○'}</span><div><strong>${escapeHtml(mission.nombre)}</strong><small>${mission.estado ? 'Completada' : 'Pendiente'}</small></div></li>`).join('')}</ul>`;
  } catch (error) { elements.detail.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`; }
}

async function loadDashboard() {
  const [studentsResult, missionsResult] = await Promise.all([window.api.students(), window.api.missions()]);
  state.students = studentsResult.data;
  state.missions = missionsResult.data;
  renderMetrics(); renderStudents(); renderMissionInputs();
}

async function initialize() {
  try {
    await window.api.health();
    elements.status.textContent = 'API conectada'; elements.status.className = 'api-status online';
    await loadDashboard();
  } catch (error) {
    elements.status.textContent = `API no disponible: ${error.message}`; elements.status.className = 'api-status offline';
    elements.missionInputs.innerHTML = '<p class="error">No fue posible cargar el catálogo de misiones.</p>';
  }
}

elements.search.addEventListener('input', renderStudents);
elements.body.addEventListener('click', (event) => { const row = event.target.closest('tr[data-carnet]'); if (row) showStudent(row.dataset.carnet); });
elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(elements.form);
  const detalle = [...elements.missionInputs.querySelectorAll('input[type="checkbox"]')].map((input) => ({ misionId: Number(input.dataset.missionId), estado: input.checked }));
  const payload = { maestro: { carnet: form.get('carnet').trim(), nombre: form.get('nombre').trim(), correo: form.get('correo').trim() }, detalle };
  elements.save.disabled = true; elements.message.textContent = 'Guardando...'; elements.message.className = '';
  try { await window.api.save(payload); elements.message.textContent = 'Progreso guardado correctamente.'; elements.message.className = 'success'; await loadDashboard(); }
  catch (error) { elements.message.textContent = error.message; elements.message.className = 'error'; }
  finally { elements.save.disabled = false; }
});
initialize();
