// ============================================
// SISTEM DE GESTIUNE AL GALERIILOR DE ARTĂ
// JavaScript - Logica Frontend
// Spătaru Georgiana Valentina - Grupa 263 CTI
// ============================================

// Variabile globale
let currentTable = null;
let currentEditId = null;
let currentPage = 1;
let currentRole = 'VIEWER';
const pageLimit = 20;
const { formatCell, formatDate, queryString } = window.galleryUtils;

// Configurare tabele și coloane
const tableConfig = {
    SEDIU: {
        icon: 'fa-building',
        title: 'Sedii (Galerii de Artă)',
        pk: 'ID_SEDIU',
        columns: ['ID_SEDIU', 'NUME', 'DIRECTOR_GENERAL', 'ADRESA_SEDIU_ADM', 'AN_INFIINTARE', 'PROGRAM_STANDARD', 'TIP_GALERIE', 'WEBSITE']
    },
    ARTIST: {
        icon: 'fa-user-tie',
        title: 'Artiști',
        pk: 'ID_ARTIST',
        columns: ['ID_ARTIST', 'NUME', 'DATA_NASTERE', 'DATA_DECES', 'NATIONALITATE', 'STILURI_ABORDATE']
    },
    OPERA: {
        icon: 'fa-image',
        title: 'Opere de Artă',
        pk: 'ID_OPERA',
        columns: ['ID_OPERA', 'TITLU', 'AN_REALIZARE', 'TEHNICA', 'SUPORT', 'INALTIME_CM', 'LATIME_CM', 'ID_ARTIST', 'IMAGE_URL']
    },
    EXPOZITIE: {
        icon: 'fa-calendar-alt',
        title: 'Expoziții',
        pk: 'ID_EXPOZITIE',
        columns: ['ID_EXPOZITIE', 'NUME', 'TEMA', 'TITLU', 'DATA_START', 'DATA_SFARSIT', 'PUBLIC_TINTA', 'TAXA_INTRARE', 'ID_SEDIU', 'ID_LOCATIE']
    },
    LOCATIE: {
        icon: 'fa-map-marker-alt',
        title: 'Locații',
        pk: 'ID_LOCATIE',
        columns: ['ID_LOCATIE', 'NUME', 'TIP_LOCATIE', 'SUPRAFATA_MP', 'TARA', 'ADRESA', 'TIP_SPATIU', 'CAPACITATE_MAXIMA']
    },
    SPONSOR: {
        icon: 'fa-hand-holding-usd',
        title: 'Sponsori',
        pk: 'ID_SPONSOR',
        columns: ['ID_SPONSOR', 'NUME', 'TIP_SPONSOR', 'DOMENIU_ACTIVITATE', 'TIP_SPONSORIZARE', 'EMAIL_CONTACT', 'TELEFON_CONTACT']
    },
    PREMIU: {
        icon: 'fa-trophy',
        title: 'Premii',
        pk: 'ID_PREMIU',
        columns: ['ID_PREMIU', 'NUME', 'TIP_PREMIU', 'LOC_OBTINUT', 'CATEGORIE', 'CRITERIU_ACORDARE', 'EDITIE']
    },
    SPONSORIZARE: {
        icon: 'fa-handshake',
        title: 'Sponsorizări',
        pk: ['ID_SEDIU', 'ID_SPONSOR'],
        columns: ['ID_SEDIU', 'ID_SPONSOR', 'SUMA_SPONSORIZARE', 'DATA_CONTRACT'],
        isJunction: true
    },
    EXPOZITIE_OPERA: {
        icon: 'fa-link',
        title: 'Expoziții - Opere',
        pk: ['ID_EXPOZITIE', 'ID_OPERA'],
        columns: ['ID_EXPOZITIE', 'ID_OPERA', 'POZITIE_SALA'],
        isJunction: true
    },
    OPERA_PREMIU: {
        icon: 'fa-award',
        title: 'Opere - Premii',
        pk: ['ID_OPERA', 'ID_PREMIU'],
        columns: ['ID_OPERA', 'ID_PREMIU', 'DATA_ACORDARE', 'EVENIMENT'],
        isJunction: true
    }
};

function selectImage(id) {
    const input = document.getElementById('image-upload-input');
    input.dataset.artworkId = id;
    input.click();
}

async function uploadSelectedImage(event) {
    const file = event.target.files[0];
    const id = event.target.dataset.artworkId;
    event.target.value = '';
    if (!file || !id) return;

    const formData = new FormData();
    formData.append('image', file);
    try {
        await galleryApi.request(`/api/artworks/${id}/image`, {
            method: 'POST',
            body: formData,
        });
        showToast('Imaginea operei a fost încărcată.', 'success');
        loadTableData();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ============================================
// INIȚIALIZARE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAuthentication();
});

async function initAuthentication() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    window.addEventListener('auth:expired', () => showAuthScreen('Sesiunea a expirat. Autentifică-te din nou.'));

    if (!galleryApi.getToken()) {
        showAuthScreen();
        return;
    }

    function debounce(callback, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => callback(...args), delay);
        };
    }

    try {
        const user = await galleryApi.currentUser();
        showApp(user);
        loadDashboard();
        loadCascadeOptions();
    } catch (error) {
        showAuthScreen('Autentificarea nu mai este valabilă.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const errorElement = document.getElementById('auth-error');
    errorElement.textContent = '';

    try {
        const user = await galleryApi.login({
            username: form.get('username'),
            password: form.get('password'),
        });
        event.currentTarget.reset();
        showApp(user);
        loadDashboard();
        loadCascadeOptions();
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

async function handleLogout() {
    await galleryApi.logout();
    showAuthScreen('Ai fost deconectat.');
}

function showAuthScreen(message = '') {
    document.getElementById('auth-screen').classList.add('active');
    document.querySelector('.app-container').classList.add('hidden');
    document.getElementById('auth-error').textContent = message;
}

function showApp(user) {
    document.getElementById('auth-screen').classList.remove('active');
    document.querySelector('.app-container').classList.remove('hidden');
    document.getElementById('current-user-label').textContent = user.username || user.email;
    document.getElementById('current-user-role').textContent = user.role;
    applyPermissions(user.role);
}

function applyPermissions(role) {
    currentRole = role;
    const canWrite = role === 'ADMIN' || role === 'CURATOR';
    const canDelete = role === 'ADMIN';
    document.getElementById('btn-add-new').classList.toggle('hidden', !canWrite);
    document.querySelectorAll('.action-btn.edit, #upload-image-button').forEach((element) => {
        element.classList.toggle('hidden', !canWrite);
    });
    document.querySelectorAll('.action-btn.delete, .btn-danger').forEach((element) => {
        element.classList.toggle('hidden', !canDelete);
    });
}

// ============================================
// NAVIGARE
// ============================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const page = item.dataset.page;
            const table = item.dataset.table;
            
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            if (page === 'dashboard') {
                document.getElementById('page-dashboard').classList.add('active');
                loadDashboard();
            } else if (page === 'rapoarte') {
                document.getElementById('page-rapoarte').classList.add('active');
            } else if (page === 'cascade') {
                document.getElementById('page-cascade').classList.add('active');
                loadCascadeOptions();
            } else if (page === 'vizualizari') {
                document.getElementById('page-vizualizari').classList.add('active');
            } else if (table) {
                currentTable = table;
                document.getElementById('page-table').classList.add('active');
                loadTablePage(table);
            }
        });
    });
    
    document.getElementById('sort-column').addEventListener('change', () => loadTableData());
    document.getElementById('sort-order').addEventListener('change', () => loadTableData());
    document.getElementById('table-search').addEventListener('input', debounce(() => {
        currentPage = 1;
        loadTableData();
    }, 350));
    document.getElementById('btn-add-new').addEventListener('click', () => openAddModal());
    document.getElementById('image-upload-input').addEventListener('change', uploadSelectedImage);
    document.getElementById('run-report-opere').addEventListener('click', runReportOpere);
    document.getElementById('run-report-artisti').addEventListener('click', runReportArtisti);
    document.getElementById('cascade-table').addEventListener('change', loadCascadeOptions);
    document.getElementById('check-cascade').addEventListener('click', checkCascade);
    document.getElementById('execute-cascade-delete').addEventListener('click', executeCascadeDelete);
    document.getElementById('create-views').addEventListener('click', createViews);
    document.querySelectorAll('[data-view-name]').forEach((button) => {
        button.addEventListener('click', () => loadView(button.dataset.viewName));
    });
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-modal').addEventListener('click', closeModal);
    document.getElementById('save-record').addEventListener('click', saveRecord);
    document.getElementById('table-content').addEventListener('click', handleTableAction);
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const response = await galleryApi.request('/api/stats/dashboard');
        const stats = response.data;
        
        const statsHtml = `
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-building"></i></div>
                <div class="stat-card-value">${stats.totals.galleries || 0}</div>
                <div class="stat-card-label">Galerii de Artă</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-user-tie"></i></div>
                <div class="stat-card-value">${stats.totals.artists || 0}</div>
                <div class="stat-card-label">Artiști</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-image"></i></div>
                <div class="stat-card-value">${stats.totals.artworks || 0}</div>
                <div class="stat-card-label">Opere de Artă</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-calendar-alt"></i></div>
                <div class="stat-card-value">${stats.totals.locations || 0}</div>
                <div class="stat-card-label">Expoziții</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-map-marker-alt"></i></div>
                <div class="stat-card-value">${stats.totals.exhibitions || 0}</div>
                <div class="stat-card-label">Locații</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-hand-holding-usd"></i></div>
                <div class="stat-card-value">${stats.totals.sponsors || 0}</div>
                <div class="stat-card-label">Sponsori</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-trophy"></i></div>
                <div class="stat-card-value">${stats.totals.awards || 0}</div>
                <div class="stat-card-label">Premii</div>
            </div>
        `;
        
        document.getElementById('dashboard-stats').innerHTML = statsHtml;
        loadRecentExpozitii();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Eroare la încărcarea dashboard-ului', 'error');
    }
}

async function loadRecentExpozitii() {
    try {
        const response = await galleryApi.request(
            `/api/expozitie${queryString({ sortBy: 'DATA_START', sortOrder: 'DESC', limit: 5 })}`
        );
        const data = response.data;
        
        if (data.length === 0) {
            document.getElementById('recent-expozitii').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Nu există expoziții</h3>
                </div>
            `;
            return;
        }
        
        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr><th>Nume</th><th>Temă</th><th>Data Start</th><th>Data Sfârșit</th><th>Taxa</th></tr>
                </thead>
                <tbody>
                    ${data.slice(0, 5).map(exp => `
                        <tr>
                            <td><strong>${exp.NUME}</strong></td>
                            <td>${exp.TEMA || '-'}</td>
                            <td>${formatDate(exp.DATA_START)}</td>
                            <td>${formatDate(exp.DATA_SFARSIT)}</td>
                            <td>${exp.TAXA_INTRARE || 0} RON</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('recent-expozitii').innerHTML = tableHtml;
    } catch (error) {
        console.error('Error loading recent expozitii:', error);
    }
}

// ============================================
// ÎNCĂRCARE TABEL
// ============================================
async function loadTablePage(table) {
    const config = tableConfig[table];
    
    document.getElementById('table-page-title').innerHTML = `
        <i class="fas ${config.icon}"></i>
        <span>${config.title}</span>
    `;
    document.getElementById('table-subtitle').textContent = `Lista ${config.title.toLowerCase()}`;
    
    const sortSelect = document.getElementById('sort-column');
    sortSelect.innerHTML = '<option value="">-- Selectează --</option>';
    config.columns.forEach(col => {
        sortSelect.innerHTML += `<option value="${col}">${col}</option>`;
    });
    
    currentPage = 1;
    await loadTableData();
}

async function loadTableData() {
    if (!currentTable) return;
    
    const config = tableConfig[currentTable];
    const sortColumn = document.getElementById('sort-column').value;
    const sortOrder = document.getElementById('sort-order').value;
    const search = document.getElementById('table-search').value;
    
    const url = `/api/${currentTable.toLowerCase()}${queryString({
        sortBy: sortColumn,
        sortOrder: sortColumn ? sortOrder : '',
        page: currentPage,
        limit: pageLimit,
        search,
    })}`;
    
    try {
        document.getElementById('table-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        const response = await galleryApi.request(url);
        const data = response.data;
        
        if (data.length === 0) {
            document.getElementById('table-content').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Nu există înregistrări</h3>
                </div>
            `;
            return;
        }
        
        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        ${config.columns.map(col => `<th>${col}</th>`).join('')}
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${config.columns.map(col => `<td>${formatCell(row[col], col)}</td>`).join('')}
                            <td>
                                <div class="action-buttons">
                                    ${config.isJunction ? `
                                        <button class="action-btn delete ${currentRole !== 'ADMIN' ? 'hidden' : ''}" data-action="delete-junction" data-table="${currentTable}" data-id1="${row[config.pk[0]]}" data-id2="${row[config.pk[1]]}" title="Șterge">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : `
                                        <button class="action-btn edit ${currentRole === 'VIEWER' ? 'hidden' : ''}" data-action="edit" data-id="${row[config.pk]}" title="Editează">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        ${currentTable === 'OPERA' && currentRole !== 'VIEWER' ? `
                                            <button class="action-btn upload-image" data-action="upload" data-id="${row[config.pk]}" title="Încarcă imagine">
                                                <i class="fas fa-upload"></i>
                                            </button>
                                        ` : ''}
                                        <button class="action-btn delete ${currentRole !== 'ADMIN' ? 'hidden' : ''}" data-action="delete" data-id="${row[config.pk]}" title="Șterge">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    `}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('table-content').innerHTML =
            tableHtml + renderPagination(response.pagination);
    } catch (error) {
        document.getElementById('table-content').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Eroare la încărcare</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openAddModal() {
    currentEditId = null;
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus"></i> Adaugă Înregistrare Nouă';
    generateFormFields();
    document.getElementById('modal-overlay').classList.add('active');
}

async function editRecord(id) {
    currentEditId = id;
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Editează Înregistrare';
    
    try {
        const response = await galleryApi.request(`/api/${currentTable.toLowerCase()}/${id}`);
        generateFormFields(response.data);
        document.getElementById('modal-overlay').classList.add('active');
    } catch (error) {
        showToast('Eroare la încărcarea datelor', 'error');
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('record-form').innerHTML = '';
}

function generateFormFields(data = {}) {
    const config = tableConfig[currentTable];
    const form = document.getElementById('record-form');
    
    let html = '';
    config.columns.forEach(col => {
        const value = data[col] || '';
        const isPK = col === config.pk || (Array.isArray(config.pk) && config.pk.includes(col));
        const isDisabled = isPK && currentEditId ? 'disabled' : '';
        
        let inputType = 'text';
        if (col.includes('DATA') || col.includes('DATE')) inputType = 'date';
        else if (col.includes('AN_') || col.includes('_CM') || col.includes('_MP') || col.includes('CAPACITATE') || col.includes('SUMA') || col.includes('TAXA') || col.includes('ID_')) inputType = 'number';
        
        let formattedValue = value;
        if (inputType === 'date' && value) {
            formattedValue = new Date(value).toISOString().split('T')[0];
        }
        
        html += `
            <div class="form-group">
                <label for="field-${col}">${col}</label>
                <input type="${inputType}" id="field-${col}" name="${col}" value="${formattedValue}" ${isDisabled}>
            </div>
        `;
    });
    
    form.innerHTML = html;
}

async function saveRecord() {
    const form = document.getElementById('record-form');
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
        if (value !== '') {
            if (key.includes('DATA') || key.includes('DATE')) {
                data[key] = new Date(value).toISOString().split('T')[0];
            } else {
                data[key] = value;
            }
        }
    });
    
    try {
        let response;
        if (currentEditId) {
            response = await galleryApi.request(`/api/${currentTable.toLowerCase()}/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } else {
            response = await galleryApi.request(`/api/${currentTable.toLowerCase()}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
        showToast(response.message, 'success');
        closeModal();
        loadTableData();
    } catch (error) {
        showToast('Eroare la salvare: ' + error.message, 'error');
    }
}

// ============================================
// DELETE FUNCTIONS
// ============================================
async function deleteRecord(id) {
    if (!confirm('Sigur doriți să ștergeți această înregistrare?')) return;
    
    try {
        await galleryApi.request(`/api/${currentTable.toLowerCase()}/${id}`, { method: 'DELETE' });
        showToast('Înregistrare ștearsă cu succes!', 'success');
        loadTableData();
    } catch (error) {
        showToast('Eroare la ștergere: ' + error.message, 'error');
    }
}

async function deleteJunctionRecord(table, id1, id2) {
    if (!confirm('Sigur doriți să ștergeți această înregistrare?')) return;
    
    try {
        await galleryApi.request(`/api/${table.toLowerCase()}/${id1}/${id2}`, { method: 'DELETE' });
        showToast('Înregistrare ștearsă cu succes!', 'success');
        loadTableData();
    } catch (error) {
        showToast('Eroare la ștergere: ' + error.message, 'error');
    }
}

// ============================================
// RAPOARTE
// ============================================
async function runReportOpere() {
    const taxaMin = document.getElementById('filter-taxa').value || 0;
    const anStart = document.getElementById('filter-an').value || 2020;
    
    try {
        const response = await galleryApi.request(
            `/api/rapoarte/opere-expuse${queryString({ taxaMin, anStart, limit: 50 })}`
        );
        const data = response.data;
        
        if (data.length === 0) {
            document.getElementById('report-opere-result').innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><h3>Niciun rezultat</h3></div>`;
            return;
        }
        
        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr><th>Opera</th><th>Artist</th><th>Expoziție</th><th>Taxa</th><th>Perioada</th><th>Sediu</th><th>Locație</th></tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td><strong>${row.OPERA_TITLU}</strong></td>
                            <td>${row.ARTIST_NUME}</td>
                            <td>${row.EXPOZITIE_NUME}</td>
                            <td>${row.TAXA_INTRARE} RON</td>
                            <td>${formatDate(row.DATA_START)} - ${formatDate(row.DATA_SFARSIT)}</td>
                            <td>${row.SEDIU_NUME}</td>
                            <td>${row.LOCATIE_NUME}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('report-opere-result').innerHTML = tableHtml;
    } catch (error) {
        showToast('Eroare la generarea raportului', 'error');
    }
}

async function runReportArtisti() {
    const minExpuneri = document.getElementById('filter-min-expuneri').value || 2;
    
    try {
        const response = await galleryApi.request(
            `/api/rapoarte/artisti-expusi${queryString({ minExpuneri, limit: 50 })}`
        );
        const data = response.data;
        
        if (data.length === 0) {
            document.getElementById('report-artisti-result').innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><h3>Niciun rezultat</h3></div>`;
            return;
        }
        
        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Nume Artist</th><th>Număr Opere</th><th>Total Expuneri</th></tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td>${row.ID_ARTIST}</td>
                            <td><strong>${row.NUME}</strong></td>
                            <td><span style="background: var(--verde-bg); padding: 4px 12px; border-radius: 20px;">${row.NUMAR_OPERE}</span></td>
                            <td>${row.TOTAL_EXPUNERI}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('report-artisti-result').innerHTML = tableHtml;
    } catch (error) {
        showToast('Eroare la generarea raportului', 'error');
    }
}

// ============================================
// CASCADE DEMO
// ============================================
async function loadCascadeOptions() {
    const table = document.getElementById('cascade-table').value;
    const select = document.getElementById('cascade-record');
    
    try {
        const response = await galleryApi.request(`/api/${table.toLowerCase()}${queryString({ limit: 100 })}`);
        const data = response.data;
        
        select.innerHTML = '<option value="">-- Selectează --</option>';
        const pk = tableConfig[table].pk;
        data.forEach(row => {
            select.innerHTML += `<option value="${row[pk]}">${row[pk]} - ${row.NUME || row.TITLU}</option>`;
        });
    } catch (error) {
        console.error('Error loading cascade options:', error);
    }
}

async function checkCascade() {
    const table = document.getElementById('cascade-table').value;
    const id = document.getElementById('cascade-record').value;
    
    if (!id) { showToast('Selectează o înregistrare', 'warning'); return; }
    
    try {
        const response = await galleryApi.request(`/api/cascade/check/${table}/${id}`);
        const data = response.data;
        
        let html = '<div class="cascade-demo"><h4><i class="fas fa-exclamation-triangle"></i> Înregistrări care vor fi șterse în cascadă:</h4>';
        
        if (data.affectedRecords.length === 0 || data.affectedRecords.every(r => r.count === 0)) {
            html += '<p>Nu există înregistrări asociate care să fie afectate.</p>';
        } else {
            html += '<ul class="cascade-list">';
            data.affectedRecords.forEach(affected => {
                if (affected.count > 0) {
                    html += `<li><strong>${affected.table}:</strong> ${affected.count} înregistrări`;
                    affected.records.forEach(rec => {
                        html += `<br>&nbsp;&nbsp;• ${Object.values(rec).join(' - ')}`;
                    });
                    html += '</li>';
                }
            });
            html += '</ul>';
        }
        html += '</div>';
        document.getElementById('cascade-preview').innerHTML = html;
    } catch (error) {
        showToast('Eroare la verificare', 'error');
    }
}

async function executeCascadeDelete() {
    const table = document.getElementById('cascade-table').value;
    const id = document.getElementById('cascade-record').value;
    
    if (!id) { showToast('Selectează o înregistrare', 'warning'); return; }
    if (!confirm('ATENȚIE! Această acțiune va șterge înregistrarea și TOATE înregistrările asociate. Continuați?')) return;
    
    try {
        await galleryApi.request(`/api/${table.toLowerCase()}/${id}`, { method: 'DELETE' });
        showToast('Ștergere în cascadă efectuată cu succes!', 'success');
        loadCascadeOptions();
        document.getElementById('cascade-preview').innerHTML = '';
    } catch (error) {
        showToast('Eroare la ștergere', 'error');
    }
}

// ============================================
// VIEWS
// ============================================
async function createViews() {
    try {
        await galleryApi.request('/api/views/create', { method: 'POST' });
        showToast('VIEW-urile au fost create cu succes!', 'success');
    } catch (error) {
        showToast('Eroare la crearea VIEW-urilor', 'error');
    }
}

async function loadView(viewName) {
    try {
        const response = await galleryApi.request(`/api/views/${viewName}`);
        const data = response.data;
        
        if (data.length === 0) {
            document.getElementById('view-result').innerHTML = `<div class="empty-state"><i class="fas fa-eye-slash"></i><h3>VIEW-ul este gol</h3></div>`;
            return;
        }
        
        const columns = Object.keys(data[0]);
        const tableHtml = `
            <div class="table-container" style="margin-top: 24px;">
                <div class="table-header">
                    <h2 class="table-title"><i class="fas fa-table"></i> Rezultate ${viewName}</h2>
                </div>
                <table class="data-table">
                    <thead><tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${data.map(row => `<tr>${columns.map(col => `<td>${formatCell(row[col], col)}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('view-result').innerHTML = tableHtml;
    } catch (error) {
        showToast('Eroare la încărcarea VIEW-ului. Asigurați-vă că a fost creat.', 'error');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function renderPagination(pagination) {
    if (!pagination || pagination.totalPages <= 1) return '';
    const buttons = [];
    for (let page = 1; page <= pagination.totalPages; page += 1) {
        buttons.push(
            `<button class="pagination-button ${page === pagination.page ? 'active' : ''}" data-page="${page}">${page}</button>`
        );
    }
    return `<div class="pagination"><span>${pagination.total} înregistrări</span>${buttons.join('')}</div>`;
}

function goToPage(page) {
    currentPage = page;
    loadTableData();
}

function handleTableAction(event) {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.page) {
        goToPage(Number(button.dataset.page));
        return;
    }
    const action = button.dataset.action;
    if (action === 'edit') editRecord(Number(button.dataset.id));
    if (action === 'delete') deleteRecord(Number(button.dataset.id));
    if (action === 'upload') selectImage(Number(button.dataset.id));
    if (action === 'delete-junction') {
        deleteJunctionRecord(button.dataset.table, Number(button.dataset.id1), Number(button.dataset.id2));
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
