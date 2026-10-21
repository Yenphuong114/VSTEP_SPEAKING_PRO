// ══════════════════════════════════════════════════════════════
//  VSTEP Speaking Pro v3.0 — script.js
//  Modules:
//    0. Auth (Login / Logout / Role permissions)
//    1. Navigation (page switching)
//    2. Dark/Light Theme
//    3. I18N (multi-language)
//    4. Rubric Manager
//    5. Topic / Timer
//    6. History (upgraded: stores 4 criteria + filename)
//    7. Recording & Upload
//    8. Batch processing
//    9. Comparison (AI vs GV): table, auto-detect, save
//   10. Dashboard (chart, KPI, agreement meter)
//   11. Init
// ══════════════════════════════════════════════════════════════

const BACKEND_URL = "http://localhost:8000";

// ─────────────────────────────────────────────────────────────
// 0. AUTH — Login / Logout / Role
// ─────────────────────────────────────────────────────────────
let currentRole = null; // 'admin' | 'teacher'

function checkAuth() {
    const role = sessionStorage.getItem('vstep_role');
    if (role === 'admin' || role === 'teacher') {
        currentRole = role;
        hideLoginOverlay();
        applyRolePermissions(role);
    } else {
        showLoginOverlay();
    }
}

function showLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.add('hidden');
}

async function login() {
    const pwInput = document.getElementById('loginPasswordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const loginCard = document.getElementById('loginCard');

    const pw = pwInput ? pwInput.value.trim() : '';
    if (!pw) return;

    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Đang xác thực...';
    }
    if (loginError) loginError.classList.remove('show');

    try {
        const resp = await fetch(`${BACKEND_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pw })
        });

        if (!resp.ok) {
            // Wrong password
            if (loginCard) {
                loginCard.classList.add('shake');
                setTimeout(() => loginCard.classList.remove('shake'), 500);
            }
            if (loginError) loginError.classList.add('show');
            if (pwInput) { pwInput.value = ''; pwInput.focus(); }
            return;
        }

        const data = await resp.json(); // {role: "admin" | "teacher"}
        sessionStorage.setItem('vstep_role', data.role);
        currentRole = data.role;
        hideLoginOverlay();
        applyRolePermissions(data.role);

    } catch (err) {
        // Network error — fallback to simple local check
        console.warn('Auth endpoint unreachable, using local fallback');
        // Allow any non-empty password as teacher in offline mode
        if (loginError) loginError.classList.add('show');
        document.getElementById('loginErrorMsg').textContent = 'Không kết nối được Backend. Hãy khởi động server.';
        if (loginCard) {
            loginCard.classList.add('shake');
            setTimeout(() => loginCard.classList.remove('shake'), 500);
        }
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i><span data-i18n="login_btn">Đăng nhập</span>';
        }
    }
}

function logout() {
    sessionStorage.removeItem('vstep_role');
    currentRole = null;
    showLoginOverlay();
    const pwInput = document.getElementById('loginPasswordInput');
    if (pwInput) { pwInput.value = ''; pwInput.focus(); }
}

function applyRolePermissions(role) {
    // Update sidebar badge
    const badge = document.getElementById('sbRoleBadge');
    const avatar = document.getElementById('sbAvatar');
    if (role === 'admin') {
        if (badge) { badge.textContent = '👑 Admin'; badge.className = 'sb-role-badge admin'; }
        if (avatar) avatar.textContent = 'A';
        // Show admin-only items
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    } else {
        if (badge) { badge.textContent = '👩‍🏫 Teacher'; badge.className = 'sb-role-badge teacher'; }
        if (avatar) avatar.textContent = 'T';
        // Hide admin-only items (Rubric config)
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}

// Login button events
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) loginBtn.addEventListener('click', login);

const loginPwInput = document.getElementById('loginPasswordInput');
if (loginPwInput) {
    loginPwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') login();
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', logout);


// ─────────────────────────────────────────────────────────────
// 1. NAVIGATION — Page switching
// ─────────────────────────────────────────────────────────────
const pages = ['grade', 'batch', 'compare', 'history'];

function navigateTo(page) {
    // Hide all pages
    pages.forEach(p => {
        const section = document.getElementById('page' + p.charAt(0).toUpperCase() + p.slice(1));
        if (section) section.classList.remove('active');
        const navItem = document.getElementById('nav' + p.charAt(0).toUpperCase() + p.slice(1));
        if (navItem) navItem.classList.remove('active');
    });

    // Show target page
    const targetSection = document.getElementById('page' + page.charAt(0).toUpperCase() + page.slice(1));
    if (targetSection) targetSection.classList.add('active');
    const targetNav = document.getElementById('nav' + page.charAt(0).toUpperCase() + page.slice(1));
    if (targetNav) targetNav.classList.add('active');

    // On compare page: refresh table and stats
    if (page === 'compare') {
        renderCompareTable();
    }
    // On history page: refresh
    if (page === 'history') {
        renderHistoryFull();
    }

    // Close mobile sidebar
    const sidebar = document.getElementById('mainSidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
    }
}
window.navigateTo = navigateTo;

// Mobile sidebar toggle
const sbMobileToggle = document.getElementById('sbMobileToggle');
if (sbMobileToggle) {
    sbMobileToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) sidebar.classList.toggle('mobile-open');
    });
}

// Rubric modal: load data when opened
const rubricModalEl = document.getElementById('rubricModal');
if (rubricModalEl) {
    rubricModalEl.addEventListener('show.bs.modal', () => {
        loadRubricData();
    });
}


// ─────────────────────────────────────────────────────────────
// 2. DARK/LIGHT THEME
// ─────────────────────────────────────────────────────────────
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const themeIcon = document.getElementById('themeIcon');

const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
htmlEl.setAttribute('data-bs-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const cur = htmlEl.getAttribute('data-theme');
        const next = cur === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', next);
        htmlEl.setAttribute('data-bs-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}


// ─────────────────────────────────────────────────────────────
// 3. I18N — Multi-language (EN / VI)
// ─────────────────────────────────────────────────────────────
let currentLanguage = localStorage.getItem('vstep_current_lang') || 'en';

function t(key) {
    if (window.I18N_TRANSLATIONS && window.I18N_TRANSLATIONS[currentLanguage] && window.I18N_TRANSLATIONS[currentLanguage][key]) {
        return window.I18N_TRANSLATIONS[currentLanguage][key];
    }
    if (window.I18N_TRANSLATIONS && window.I18N_TRANSLATIONS.vi && window.I18N_TRANSLATIONS.vi[key]) {
        return window.I18N_TRANSLATIONS.vi[key];
    }
    return key;
}

function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('vstep_current_lang', lang);
    document.documentElement.setAttribute('lang', lang);

    const flagEl = document.getElementById('currentLangFlag');
    const codeEl = document.getElementById('currentLangCode');
    const checkEN = document.getElementById('checkLangEN');
    const checkVI = document.getElementById('checkLangVI');

    if (lang === 'en') {
        if (flagEl) flagEl.innerText = '🇬🇧';
        if (codeEl) codeEl.innerText = 'EN';
        if (checkEN) checkEN.classList.remove('d-none');
        if (checkVI) checkVI.classList.add('d-none');
    } else {
        if (flagEl) flagEl.innerText = '🇻🇳';
        if (codeEl) codeEl.innerText = 'VI';
        if (checkEN) checkEN.classList.add('d-none');
        if (checkVI) checkVI.classList.remove('d-none');
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        if (translated) {
            if (el.tagName === 'OPTION') {
                el.innerText = translated;
            } else if (el.childElementCount === 0) {
                el.innerText = translated;
            } else {
                const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
                if (textNodes.length > 0) textNodes[textNodes.length - 1].textContent = ' ' + translated;
            }
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => el.setAttribute('title', t(el.getAttribute('data-i18n-title'))));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'))));

    const titleGrammar = document.getElementById('rubric_title_grammar');
    const titleVocab = document.getElementById('rubric_title_vocabulary');
    const titlePronun = document.getElementById('rubric_title_pronunciation');
    const titleFluency = document.getElementById('rubric_title_fluency');
    if (lang === 'en') {
        if (titleGrammar) titleGrammar.innerText = 'Grammatical Range & Accuracy';
        if (titleVocab) titleVocab.innerText = 'Lexical Resource & Vocabulary';
        if (titlePronun) titlePronun.innerText = 'Pronunciation & Intonation';
        if (titleFluency) titleFluency.innerText = 'Fluency & Coherence';
    } else {
        if (titleGrammar) titleGrammar.innerText = 'Ngữ pháp (Grammar)';
        if (titleVocab) titleVocab.innerText = 'Từ vựng (Vocabulary)';
        if (titlePronun) titlePronun.innerText = 'Phát âm (Pronunciation)';
        if (titleFluency) titleFluency.innerText = 'Trôi chảy (Fluency)';
    }

    if (typeof updateRubricTotalWeight === 'function') updateRubricTotalWeight();
}

const btnLangEN = document.getElementById('btnLangEN');
const btnLangVI = document.getElementById('btnLangVI');
if (btnLangEN) btnLangEN.addEventListener('click', (e) => { e.preventDefault(); applyLanguage('en'); });
if (btnLangVI) btnLangVI.addEventListener('click', (e) => { e.preventDefault(); applyLanguage('vi'); });


// ─────────────────────────────────────────────────────────────
// 4. RUBRIC MANAGER
// ─────────────────────────────────────────────────────────────
const btnSaveRubric = document.getElementById('btnSaveRubric');
const btnResetRubric = document.getElementById('btnResetRubric');
const btnExportRubric = document.getElementById('btnExportRubric');
const btnImportRubricTrigger = document.getElementById('btnImportRubricTrigger');
const importRubricFileInput = document.getElementById('importRubricFileInput');

let currentRubricData = null;
const criteriaKeys = ['grammar', 'vocabulary', 'pronunciation', 'fluency'];

async function loadRubricData() {
    try {
        const resp = await fetch(`${BACKEND_URL}/api/rubric`);
        if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
        const data = await resp.json();
        currentRubricData = data;
        populateRubricForm(data);
        if (typeof setActivePresetButton === 'function') {
            setActivePresetButton(data.name && data.name.includes('Tiếng Việt') ? 'vi' : 'en');
        }
    } catch (err) {
        console.error('Lỗi tải Rubric:', err);
    }
}

function populateRubricForm(data) {
    if (!data || !data.criteria) return;
    criteriaKeys.forEach(key => {
        const c = data.criteria[key] || {};
        const weightPct = Math.round((c.weight !== undefined ? c.weight : 0.25) * 100);
        const rangeEl = document.getElementById(`rubric_weight_${key}_range`);
        const numEl = document.getElementById(`rubric_weight_${key}_num`);
        const descEl = document.getElementById(`rubric_desc_${key}`);
        if (rangeEl) rangeEl.value = weightPct;
        if (numEl) numEl.value = weightPct;
        if (descEl) descEl.value = c.description || '';
        const bands = c.band_descriptors || {};
        const c1El = document.getElementById(`rubric_c1_${key}`);
        const b2El = document.getElementById(`rubric_b2_${key}`);
        const b1El = document.getElementById(`rubric_b1_${key}`);
        if (c1El) c1El.value = bands.c1 || '';
        if (b2El) b2El.value = bands.b2 || '';
        if (b1El) b1El.value = bands.b1 || '';
    });
    const settings = data.settings || {};
    const strictEl = document.getElementById('rubricStrictnessSelect');
    const langEl = document.getElementById('rubricLanguageSelect');
    const maxFbEl = document.getElementById('rubricMaxFeedbackInput');
    const minWpmEl = document.getElementById('rubricMinWpmInput');
    const maxWpmEl = document.getElementById('rubricMaxWpmInput');
    if (strictEl) strictEl.value = settings.examiner_strictness || 'standard';
    if (langEl) langEl.value = settings.feedback_language || 'vi';
    if (maxFbEl) maxFbEl.value = settings.max_feedback_items || 3;
    const wpm = settings.wpm_range || {};
    if (minWpmEl) minWpmEl.value = wpm.min || 110;
    if (maxWpmEl) maxWpmEl.value = wpm.max || 150;
    updateRubricTotalWeight();
}

function updateRubricTotalWeight() {
    let total = 0;
    criteriaKeys.forEach(key => {
        const numEl = document.getElementById(`rubric_weight_${key}_num`);
        if (numEl) total += parseInt(numEl.value) || 0;
    });
    const badge = document.getElementById('rubricTotalWeightBadge');
    const bar = document.getElementById('rubricWeightProgressBar');
    const alertText = document.getElementById('rubricWeightAlert');
    if (bar) bar.style.width = Math.min(total, 100) + '%';
    if (total === 100) {
        if (badge) { badge.className = 'badge bg-success fs-6 px-3 py-1 rounded-pill'; badge.innerText = t('rubric_total_valid') || '100% (Hợp lệ)'; }
        if (bar) bar.className = 'progress-bar bg-success';
        if (alertText) { alertText.className = 'mt-2 text-success fw-medium dynamic-text'; alertText.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i>${t('rubric_alert_ready') || 'Hợp lệ'}`; }
        if (btnSaveRubric) btnSaveRubric.removeAttribute('disabled');
    } else {
        if (badge) { badge.className = 'badge bg-danger fs-6 px-3 py-1 rounded-pill'; badge.innerText = `${total}% (Chưa đủ 100%)`; }
        if (bar) bar.className = 'progress-bar bg-danger';
        if (alertText) { alertText.className = 'mt-2 text-danger fw-medium dynamic-text'; alertText.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i>Tổng hiện tại: ${total}%`; }
        if (btnSaveRubric) btnSaveRubric.setAttribute('disabled', 'true');
    }
}

criteriaKeys.forEach(key => {
    const rangeEl = document.getElementById(`rubric_weight_${key}_range`);
    const numEl = document.getElementById(`rubric_weight_${key}_num`);
    if (rangeEl && numEl) {
        rangeEl.addEventListener('input', (e) => { numEl.value = e.target.value; updateRubricTotalWeight(); });
        numEl.addEventListener('input', (e) => { let val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0)); rangeEl.value = val; updateRubricTotalWeight(); });
    }
});

const btnAutoBalanceWeights = document.getElementById('btnAutoBalanceWeights');
if (btnAutoBalanceWeights) {
    btnAutoBalanceWeights.addEventListener('click', () => {
        criteriaKeys.forEach(key => {
            const r = document.getElementById(`rubric_weight_${key}_range`);
            const n = document.getElementById(`rubric_weight_${key}_num`);
            if (r) r.value = 25; if (n) n.value = 25;
        });
        updateRubricTotalWeight();
    });
}

function collectRubricFormData() {
    const criteriaObj = {};
    criteriaKeys.forEach(key => {
        const numEl = document.getElementById(`rubric_weight_${key}_num`);
        const descEl = document.getElementById(`rubric_desc_${key}`);
        const c1El = document.getElementById(`rubric_c1_${key}`);
        const b2El = document.getElementById(`rubric_b2_${key}`);
        const b1El = document.getElementById(`rubric_b1_${key}`);
        const weight = (parseFloat(numEl ? numEl.value : 25) || 25) / 100.0;
        const nameMapEN = { grammar: 'Grammatical Range & Accuracy', vocabulary: 'Lexical Resource & Vocabulary', pronunciation: 'Pronunciation & Intonation', fluency: 'Fluency & Coherence' };
        const nameMapVI = { grammar: 'Ngữ pháp (Grammar)', vocabulary: 'Từ vựng (Vocabulary)', pronunciation: 'Phát âm (Pronunciation)', fluency: 'Trôi chảy (Fluency)' };
        const nameMap = currentLanguage === 'vi' ? nameMapVI : nameMapEN;
        criteriaObj[key] = { name: nameMap[key] || key, weight, description: descEl ? descEl.value.trim() : '', band_descriptors: { c1: c1El ? c1El.value.trim() : '', b2: b2El ? b2El.value.trim() : '', b1: b1El ? b1El.value.trim() : '' } };
    });
    const strictEl = document.getElementById('rubricStrictnessSelect');
    const langEl = document.getElementById('rubricLanguageSelect');
    const maxFbEl = document.getElementById('rubricMaxFeedbackInput');
    const minWpmEl = document.getElementById('rubricMinWpmInput');
    const maxWpmEl = document.getElementById('rubricMaxWpmInput');
    return {
        version: (currentRubricData && currentRubricData.version) || '1.0',
        name: currentLanguage === 'vi' ? 'Chuẩn VSTEP B1-B2-C1 (Tiếng Việt)' : 'Official VSTEP Speaking Rubric (CEFR)',
        description: '',
        settings: { examiner_strictness: strictEl ? strictEl.value : 'standard', feedback_language: langEl ? langEl.value : (currentLanguage || 'vi'), max_feedback_items: parseInt(maxFbEl ? maxFbEl.value : 3) || 3, wpm_range: { min: parseInt(minWpmEl ? minWpmEl.value : 110) || 110, max: parseInt(maxWpmEl ? maxWpmEl.value : 150) || 150 } },
        criteria: criteriaObj
    };
}

const btnPresetEnglish = document.getElementById('btnPresetEnglish');
const btnPresetVietnamese = document.getElementById('btnPresetVietnamese');

function setActivePresetButton(lang) {
    if (!btnPresetEnglish || !btnPresetVietnamese) return;
    if (lang === 'en') {
        btnPresetEnglish.classList.add('active', 'btn-outline-primary'); btnPresetEnglish.classList.remove('btn-outline-secondary');
        btnPresetVietnamese.classList.remove('active', 'btn-outline-primary'); btnPresetVietnamese.classList.add('btn-outline-secondary');
    } else {
        btnPresetVietnamese.classList.add('active', 'btn-outline-primary'); btnPresetVietnamese.classList.remove('btn-outline-secondary');
        btnPresetEnglish.classList.remove('active', 'btn-outline-primary'); btnPresetEnglish.classList.add('btn-outline-secondary');
    }
}

if (btnPresetEnglish) btnPresetEnglish.addEventListener('click', () => { if (window.RUBRIC_PRESET_EN) { populateRubricForm(window.RUBRIC_PRESET_EN); setActivePresetButton('en'); } });
if (btnPresetVietnamese) btnPresetVietnamese.addEventListener('click', () => { if (window.RUBRIC_PRESET_VI) { populateRubricForm(window.RUBRIC_PRESET_VI); setActivePresetButton('vi'); } });

if (btnSaveRubric) {
    btnSaveRubric.addEventListener('click', async () => {
        let total = 0;
        criteriaKeys.forEach(key => { const n = document.getElementById(`rubric_weight_${key}_num`); if (n) total += parseInt(n.value) || 0; });
        if (total !== 100) { alert('Tổng trọng số phải là 100%. Hiện tại: ' + total + '%'); return; }
        const payload = collectRubricFormData();
        btnSaveRubric.setAttribute('disabled', 'true');
        btnSaveRubric.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Đang lưu...';
        try {
            const resp = await fetch(`${BACKEND_URL}/api/rubric`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const resData = await resp.json();
            if (!resp.ok) throw new Error(resData.detail || 'Lỗi lưu Rubric');
            currentRubricData = resData.rubric;
            alert('Đã lưu cấu hình Rubric thành công!');
            if (rubricModalEl && window.bootstrap) { const m = bootstrap.Modal.getInstance(rubricModalEl); if (m) m.hide(); }
        } catch (err) { alert('Lỗi: ' + err.message); }
        finally { btnSaveRubric.removeAttribute('disabled'); btnSaveRubric.innerHTML = '<i class="fa-solid fa-floppy-disk me-2"></i><span data-i18n="rubric_btn_save">Lưu cấu hình</span>'; }
    });
}

if (btnResetRubric) {
    btnResetRubric.addEventListener('click', async () => {
        if (!confirm('Bạn có chắc muốn khôi phục Rubric mặc định không?')) return;
        btnResetRubric.setAttribute('disabled', 'true');
        try {
            const resp = await fetch(`${BACKEND_URL}/api/rubric/reset?lang=${currentLanguage}`, { method: 'POST' });
            const resData = await resp.json();
            if (!resp.ok) throw new Error(resData.detail || 'Lỗi khôi phục');
            currentRubricData = resData.rubric;
            populateRubricForm(resData.rubric);
            setActivePresetButton(currentLanguage);
            alert('Đã khôi phục Rubric mặc định!');
        } catch (err) { alert('Lỗi: ' + err.message); }
        finally { btnResetRubric.removeAttribute('disabled'); }
    });
}

if (btnExportRubric) btnExportRubric.addEventListener('click', () => { window.location.href = `${BACKEND_URL}/api/rubric/export`; });

if (btnImportRubricTrigger && importRubricFileInput) {
    btnImportRubricTrigger.addEventListener('click', () => importRubricFileInput.click());
    importRubricFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]; if (!file) return;
        const formData = new FormData(); formData.append('file', file);
        btnImportRubricTrigger.setAttribute('disabled', 'true');
        btnImportRubricTrigger.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i>Đang nhập...';
        try {
            const resp = await fetch(`${BACKEND_URL}/api/rubric/import`, { method: 'POST', body: formData });
            const resData = await resp.json();
            if (!resp.ok) throw new Error(resData.detail || 'Lỗi nhập file');
            currentRubricData = resData.rubric;
            populateRubricForm(resData.rubric);
            alert('Đã nhập cấu hình Rubric từ file thành công!');
        } catch (err) { alert('Không thể nhập file: ' + err.message); }
        finally { btnImportRubricTrigger.removeAttribute('disabled'); btnImportRubricTrigger.innerHTML = '<i class="fa-solid fa-file-arrow-up me-1"></i><span data-i18n="rubric_btn_import">Nhập file JSON</span>'; importRubricFileInput.value = ''; }
    });
}


// ─────────────────────────────────────────────────────────────
// 5. TOPIC / TIMER
// ─────────────────────────────────────────────────────────────
const examPartSelect = document.getElementById('examPartSelect');
const topicInput = document.getElementById('topicInput');
const topicBadge = document.getElementById('topicBadge');
const timerDisplay = document.getElementById('timerDisplay');

const partData = {
    part1: { time: 180, topic: "Let's talk about your hometown. Where is your hometown? What do you like most about it?" },
    part2: { time: 180, topic: "Describe a time when you had to make a difficult decision. What was the situation and what did you decide?" },
    part3: { time: 240, topic: "Some people think that university education should be free for everyone. Do you agree or disagree?" }
};

let defaultTimeLeft = partData['part2'].time;
let timeLeft = defaultTimeLeft;

if (examPartSelect) {
    examPartSelect.addEventListener('change', (e) => {
        const p = e.target.value;
        if (topicInput) topicInput.value = partData[p].topic;
        defaultTimeLeft = partData[p].time;
        timeLeft = defaultTimeLeft;
        if (timerDisplay) timerDisplay.innerText = formatTime(timeLeft);
    });
}

if (topicInput) {
    topicInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            topicInput.blur();
            if (topicBadge) {
                topicBadge.innerHTML = '<i class="fa-solid fa-check me-1"></i>ĐÃ NHẬN ĐỀ';
                topicBadge.classList.add('success-state');
                setTimeout(() => { topicBadge.innerHTML = 'TOPIC'; topicBadge.classList.remove('success-state'); }, 2000);
            }
        }
    });
}


// ─────────────────────────────────────────────────────────────
// 6. HISTORY — Upgraded to store 4 criteria + filename
// ─────────────────────────────────────────────────────────────
let historyList = [];
try { historyList = JSON.parse(localStorage.getItem('vstep_history')) || []; } catch(e) { historyList = []; }

function saveHistoryToStorage() {
    localStorage.setItem('vstep_history', JSON.stringify(historyList));
}

/**
 * Add entry to history.
 * @param {number} score - Overall AI score
 * @param {number} grammar
 * @param {number} vocab
 * @param {number} pronun
 * @param {number} fluency
 * @param {string} textSaid - Transcript
 * @param {string|null} filename - Original filename (null for live recording)
 */
function addToHistory(score, grammar, vocab, pronun, fluency, textSaid, filename = null) {
    const now = new Date();
    const dateString = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN');
    const topicText = topicInput ? topicInput.value : '';

    historyList.unshift({
        id: Date.now().toString(),
        date: dateString,
        topic: topicText,
        score: score,
        textSaid: textSaid,
        grammar: grammar,
        vocabulary: vocab,
        pronunciation: pronun,
        fluency: fluency,
        filename: filename,        // ← NEW
        teacher_score: null        // ← NEW: null until teacher enters
    });

    saveHistoryToStorage();
    renderHistory();
    renderHistoryFull();
}

function deleteHistory(id) {
    if (confirm('Bạn có chắc chắn muốn xóa bài nói này khỏi lịch sử?')) {
        historyList = historyList.filter(item => item.id !== id);
        saveHistoryToStorage();
        renderHistory();
        renderHistoryFull();
    }
}
window.deleteHistory = deleteHistory;

function buildHistoryItemHTML(item) {
    const badgeColor = item.score == 0 ? 'bg-danger' : 'bg-primary';
    const textSaidFmt = item.textSaid ? `"${item.textSaid}"` : '(Không thu được giọng nói / Im lặng)';
    const criteriaHtml = (item.grammar !== undefined) ? `
        <div class="d-flex gap-2 flex-wrap mt-1">
            <small class="badge bg-secondary bg-opacity-10 text-secondary border">G: ${item.grammar ?? '-'}</small>
            <small class="badge bg-secondary bg-opacity-10 text-secondary border">V: ${item.vocabulary ?? '-'}</small>
            <small class="badge bg-secondary bg-opacity-10 text-secondary border">P: ${item.pronunciation ?? '-'}</small>
            <small class="badge bg-secondary bg-opacity-10 text-secondary border">F: ${item.fluency ?? '-'}</small>
            ${item.filename ? `<small class="badge bg-info bg-opacity-10 text-info border"><i class="fa-solid fa-file-audio me-1"></i>${item.filename.length > 20 ? item.filename.substring(0,20)+'...' : item.filename}</small>` : ''}
        </div>` : '';
    return `
        <div class="list-group-item bg-transparent border-bottom border-secondary border-opacity-25 py-3 px-0">
            <div class="d-flex w-100 justify-content-between mb-2">
                <h6 class="mb-1 dynamic-text fw-bold"><i class="fa-solid fa-clock me-2 text-muted"></i>${item.date}</h6>
                <div>
                    <span class="badge ${badgeColor} fs-6 rounded-pill me-2">Điểm: ${item.score}/10</span>
                    <button class="btn btn-sm btn-outline-danger rounded-circle shadow-sm" onclick="deleteHistory('${item.id}')" title="Xóa">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            <p class="mb-2 small dynamic-text opacity-75"><strong>Đề bài:</strong> ${item.topic}</p>
            ${criteriaHtml}
            <div class="p-2 rounded mt-2" style="background:var(--score-bg);border-left:3px solid var(--primary);">
                <small class="dynamic-text fst-italic"><strong>Bạn nói:</strong> ${textSaidFmt}</small>
            </div>
        </div>`;
}

function renderHistory() {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    if (historyList.length === 0) {
        container.innerHTML = '<div class="text-center my-5 dynamic-text opacity-75"><i class="fa-solid fa-folder-open fs-1 mb-3"></i><p>Chưa có dữ liệu lịch sử.</p></div>';
        return;
    }
    container.innerHTML = '<div class="list-group list-group-flush">' + historyList.map(buildHistoryItemHTML).join('') + '</div>';
}

function renderHistoryFull() {
    const container = document.getElementById('historyContainerFull');
    if (!container) return;
    if (historyList.length === 0) {
        container.innerHTML = '<div class="text-center my-5 dynamic-text opacity-75"><i class="fa-solid fa-folder-open fs-1 mb-3"></i><p>Chưa có dữ liệu lịch sử.</p></div>';
        return;
    }
    container.innerHTML = '<div class="list-group list-group-flush">' + historyList.map(buildHistoryItemHTML).join('') + '</div>';
}


// ─────────────────────────────────────────────────────────────
// 7. RECORDING & UPLOAD
// ─────────────────────────────────────────────────────────────
let timer;
let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let currentUploadFilename = null; // track filename for history

const btnRecord = document.getElementById('btnRecord');
const btnRecordText = document.getElementById('btnRecordText');
const visualizer = document.getElementById('visualizer');
const transcriptBox = document.getElementById('transcriptBox');
const liveText = document.getElementById('liveText');
const btnUpload = document.getElementById('btnUpload');
const audioFileInput = document.getElementById('audioFileInput');

async function setupRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];
            await sendAudioToBackend(audioBlob);
        };
    } catch (error) {
        console.error('Lỗi micro:', error);
    }
}
setupRecorder();

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

if (btnRecord) btnRecord.addEventListener('click', () => { if (!isRecording) startRecording(); else stopRecording(); });

function startRecording() {
    isRecording = true;
    currentUploadFilename = null;
    timeLeft = defaultTimeLeft;
    if (btnRecordText) btnRecordText.innerText = currentLanguage === 'en' ? 'Finish & Submit' : 'Kết thúc & Nộp bài';
    if (btnRecord) { btnRecord.classList.add('btn-recording'); btnRecord.querySelector('i').classList.replace('fa-microphone', 'fa-stop'); }
    if (visualizer) visualizer.classList.remove('d-none');
    if (transcriptBox) transcriptBox.style.display = 'block';
    if (liveText) liveText.innerHTML = 'Đang thu âm... <em>(AI sẽ phân tích sau khi bạn nộp bài)</em>';
    if (mediaRecorder && mediaRecorder.state === 'inactive') mediaRecorder.start();
    timer = setInterval(() => { timeLeft--; if (timerDisplay) timerDisplay.innerText = formatTime(timeLeft); if (timeLeft <= 0) stopRecording(); }, 1000);
}

function stopRecording() {
    isRecording = false;
    clearInterval(timer);
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    if (btnRecordText) btnRecordText.innerText = currentLanguage === 'en' ? 'AI is evaluating...' : 'AI đang chấm điểm...';
    if (btnRecord) { btnRecord.classList.remove('btn-recording'); btnRecord.classList.add('disabled'); btnRecord.querySelector('i').classList.replace('fa-stop', 'fa-spinner'); btnRecord.querySelector('i').classList.add('fa-spin'); }
    if (visualizer) visualizer.classList.add('d-none');
}

if (btnUpload) btnUpload.addEventListener('click', () => audioFileInput && audioFileInput.click());

if (audioFileInput) {
    audioFileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            currentUploadFilename = file.name;
            btnUpload.classList.add('disabled');
            btnUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>AI đang chấm điểm...';
            if (transcriptBox) transcriptBox.style.display = 'block';
            if (liveText) liveText.innerHTML = `Đang phân tích file <strong>${file.name}</strong>...`;
            try { await sendAudioToBackend(file); }
            catch (error) { console.error('Lỗi upload:', error); }
            finally {
                btnUpload.classList.remove('disabled');
                btnUpload.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-2"></i><span data-i18n="btn_upload_audio">Tải file âm thanh (.mp3, .wav) lên</span>';
                audioFileInput.value = '';
                currentUploadFilename = null;
            }
        }
    });
}

async function sendAudioToBackend(audioBlob) {
    const formData = new FormData();
    const fileName = audioBlob.name || 'recording.wav';
    formData.append('audio', audioBlob, fileName);
    if (topicInput) formData.append('topic', topicInput.value);
    if (examPartSelect) formData.append('part', examPartSelect.value);

    try {
        const response = await fetch(`${BACKEND_URL}/api/evaluate`, { method: 'POST', body: formData });
        if (!response.ok) {
            let errorDetail = 'Unknown Error';
            try { const errBody = await response.json(); errorDetail = errBody.detail || JSON.stringify(errBody); } catch(e) {}
            throw new Error(`HTTP error ${response.status}: ${errorDetail}`);
        }
        const data = await response.json();
        displayAIResult(data.user_transcript, data);
    } catch (error) {
        console.error(error);
        alert('Lỗi từ Backend:\n' + error.message);
    } finally {
        if (btnRecord) {
            btnRecord.classList.remove('disabled');
            if (btnRecordText) btnRecordText.innerText = currentLanguage === 'en' ? 'Record Again' : 'Bắt đầu thu âm lại';
            const icon = btnRecord.querySelector('i');
            if (icon) { icon.classList.remove('fa-spinner', 'fa-spin'); icon.classList.add('fa-microphone'); }
        }
        if (timerDisplay) timerDisplay.innerText = formatTime(defaultTimeLeft);
        if (transcriptBox) transcriptBox.style.display = 'none';
    }
}

function displayAIResult(userText, aiData) {
    // Switch to grade page and feedback tab
    navigateTo('grade');
    const feedbackTab = document.getElementById('tabFeedback');
    if (feedbackTab && window.bootstrap) bootstrap.Tab.getOrCreateInstance(feedbackTab).show();

    if (!userText || userText.trim() === '') {
        document.getElementById('overallScore').innerText = '0/10';
        ['Grammar', 'Vocab', 'Pronun', 'Fluency'].forEach(n => { const el = document.getElementById('score' + n); if (el) el.innerText = '0'; });
        document.getElementById('modelAnswer').innerHTML = '<p class="mb-0 text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation me-2"></i>Không có dữ liệu bài làm.</p>';
        document.getElementById('detailedFeedback').innerHTML = '<div class="alert alert-danger mb-0 border-0 text-center py-4"><i class="fa-solid fa-microphone-slash fs-1 mb-3"></i><h5>Không nhận diện được giọng nói!</h5></div>';
        addToHistory(0, 0, 0, 0, 0, '', currentUploadFilename);
        return;
    }

    document.getElementById('overallScore').innerText = aiData.overall_score + '/10';
    document.getElementById('scoreGrammar').innerText = aiData.criteria_scores.grammar;
    document.getElementById('scoreVocab').innerText = aiData.criteria_scores.vocabulary;
    document.getElementById('scorePronun').innerText = aiData.criteria_scores.pronunciation;
    document.getElementById('scoreFluency').innerText = aiData.criteria_scores.fluency;
    document.getElementById('modelAnswer').innerHTML = `<p class="mb-0 lh-lg dynamic-text">${aiData.model_answer}</p>`;

    let feedbackHTML = `<div class="alert alert-primary mb-4 border-0 shadow-sm" style="background:var(--model-bg);color:var(--text);">
        <div class="fw-bold mb-2"><i class="fa-solid fa-file-lines me-2 text-primary"></i>Văn bản AI nghe được từ bạn:</div>
        <div class="fst-italic lh-base">"${userText}"</div>
    </div>`;

    aiData.detailed_feedback.forEach(item => {
        let typeClass = item.type.toLowerCase();
        let icon = 'fa-triangle-exclamation';
        if (typeClass === 'grammar') icon = 'fa-spell-check';
        if (typeClass === 'vocabulary') icon = 'fa-book-font';
        feedbackHTML += `<div class="feedback-item ${typeClass} shadow-sm">
            <span class="badge bg-secondary mb-3 fs-6"><i class="fa-solid ${icon} me-2"></i>${item.type}</span>
            <div class="row mb-2 align-items-center"><div class="col-sm-3 fw-bold opacity-75 dynamic-text">Bạn đã nói:</div><div class="col-sm-9"><span class="text-danger text-decoration-line-through fw-medium">${item.error_text}</span></div></div>
            <div class="row mb-2 align-items-center"><div class="col-sm-3 fw-bold opacity-75 dynamic-text">AI sửa lại:</div><div class="col-sm-9"><span class="text-success fw-bold fs-5">${item.correction}</span></div></div>
            <div class="row mb-3"><div class="col-sm-3 fw-bold opacity-75 dynamic-text">Giải thích:</div><div class="col-sm-9"><span class="dynamic-text">${item.explanation}</span></div></div>
            <div class="mt-3 pt-3 border-top custom-border"><i class="fa-solid fa-lightbulb me-2 text-warning fs-5"></i><strong>Mẹo:</strong><span class="fst-italic mt-1 d-block opacity-75 dynamic-text">${item.advice}</span></div>
        </div>`;
    });
    document.getElementById('detailedFeedback').innerHTML = feedbackHTML;

    addToHistory(
        aiData.overall_score,
        aiData.criteria_scores.grammar,
        aiData.criteria_scores.vocabulary,
        aiData.criteria_scores.pronunciation,
        aiData.criteria_scores.fluency,
        userText,
        currentUploadFilename
    );
}

const btnRetry = document.getElementById('btnRetry');
if (btnRetry) {
    btnRetry.addEventListener('click', () => {
        document.getElementById('overallScore').innerText = '--/10';
        ['Grammar', 'Vocab', 'Pronun', 'Fluency'].forEach(n => { const el = document.getElementById('score' + n); if (el) el.innerText = '-'; });
        document.getElementById('detailedFeedback').innerHTML = '<div class="text-center my-5 dynamic-text opacity-75"><i class="fa-solid fa-clipboard-list fs-1 mb-3"></i><p>Hoàn thành bài thi để xem AI phân tích.</p></div>';
        document.getElementById('modelAnswer').innerHTML = '<p class="mb-0 fst-italic dynamic-text opacity-75">Bài nói mẫu sẽ hiển thị sau khi bạn nộp bài...</p>';
        if (topicInput) { topicInput.focus(); topicInput.select(); topicInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
}


// ─────────────────────────────────────────────────────────────
// 8. BATCH PROCESSING
// ─────────────────────────────────────────────────────────────
const btnSelectBatch = document.getElementById('btnSelectBatch');
const batchFileInput = document.getElementById('batchFileInput');
const batchFileCount = document.getElementById('batchFileCount');
const btnStartBatch = document.getElementById('btnStartBatch');
const batchProgressContainer = document.getElementById('batchProgressContainer');
const batchProgressText = document.getElementById('batchProgressText');
const batchProgressBar = document.getElementById('batchProgressBar');
const batchFileList = document.getElementById('batchFileList');
const batchExamPartSelect = document.getElementById('batchExamPartSelect');
const batchTopicInput = document.getElementById('batchTopicInput');
const batchTopicBadge = document.getElementById('batchTopicBadge');
const btnUploadBatchTxt = document.getElementById('btnUploadBatchTxt');
const batchTxtUploadInput = document.getElementById('batchTxtUploadInput');

if (batchExamPartSelect) {
    batchExamPartSelect.addEventListener('change', (e) => {
        if (batchTopicInput) batchTopicInput.value = partData[e.target.value].topic;
    });
}

if (batchTopicInput) {
    batchTopicInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); batchTopicInput.blur();
            if (batchTopicBadge) {
                batchTopicBadge.innerHTML = '<i class="fa-solid fa-check me-1"></i>ĐÃ NHẬN ĐỀ';
                batchTopicBadge.classList.add('success-state');
                setTimeout(() => { batchTopicBadge.innerHTML = 'TOPIC'; batchTopicBadge.classList.remove('success-state'); }, 2000);
            }
        }
    });
}

if (btnUploadBatchTxt && batchTxtUploadInput) {
    btnUploadBatchTxt.addEventListener('click', () => batchTxtUploadInput.click());
    batchTxtUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (batchTopicInput) batchTopicInput.value = ev.target.result;
            batchTxtUploadInput.value = '';
            if (batchTopicBadge) {
                batchTopicBadge.innerHTML = '<i class="fa-solid fa-check me-1"></i>ĐÃ TẢI FILE';
                batchTopicBadge.classList.add('success-state');
                setTimeout(() => { batchTopicBadge.innerHTML = 'TOPIC'; batchTopicBadge.classList.remove('success-state'); }, 2000);
            }
        };
        reader.readAsText(file);
    });
}

let batchFiles = [];

if (btnSelectBatch) {
    btnSelectBatch.addEventListener('click', () => batchFileInput && batchFileInput.click());

    if (batchFileInput) {
        batchFileInput.addEventListener('change', (e) => {
            batchFiles = Array.from(e.target.files);
            if (batchFiles.length > 0) {
                if (batchFileCount) batchFileCount.innerHTML = `<span class="text-success fw-bold"><i class="fa-solid fa-check-circle me-1"></i>Đã chọn ${batchFiles.length} file</span>`;
                if (btnStartBatch) btnStartBatch.removeAttribute('disabled');
                if (batchProgressContainer) batchProgressContainer.style.display = 'none';
                if (batchFileList) batchFileList.innerHTML = '';
                if (batchProgressBar) { batchProgressBar.style.width = '0%'; batchProgressBar.classList.remove('bg-success'); batchProgressBar.classList.add('progress-bar-animated', 'bg-primary'); }
                if (batchProgressText) batchProgressText.innerText = `0/${batchFiles.length}`;
            } else {
                if (batchFileCount) batchFileCount.innerText = 'Chưa chọn file nào.';
                if (btnStartBatch) btnStartBatch.setAttribute('disabled', 'true');
            }
        });
    }
}

if (btnStartBatch) {
    btnStartBatch.addEventListener('click', async () => {
        if (batchFiles.length === 0) return;

        btnStartBatch.setAttribute('disabled', 'true');
        if (btnSelectBatch) btnSelectBatch.setAttribute('disabled', 'true');
        if (batchProgressContainer) batchProgressContainer.style.display = 'block';
        if (batchFileList) batchFileList.innerHTML = '';

        for (let i = 0; i < batchFiles.length; i++) {
            const file = batchFiles[i];
            if (batchProgressText) batchProgressText.innerText = `${i}/${batchFiles.length}`;
            if (batchProgressBar) batchProgressBar.style.width = `${(i / batchFiles.length) * 100}%`;

            const listItemId = `batch-item-${i}`;
            if (batchFileList) batchFileList.innerHTML += `<li id="${listItemId}" class="list-group-item bg-transparent d-flex justify-content-between align-items-center"><span class="text-truncate" style="max-width:70%;"><i class="fa-solid fa-file-audio me-2 text-primary"></i>${file.name}</span><span class="badge bg-warning text-dark"><i class="fa-solid fa-spinner fa-spin me-1"></i>Đang chấm</span></li>`;
            if (batchFileList) batchFileList.scrollTop = batchFileList.scrollHeight;

            let success = false;
            while (!success) {
                try {
                    const formData = new FormData();
                    formData.append('audio', file, file.name);
                    if (batchTopicInput) formData.append('topic', batchTopicInput.value);
                    if (batchExamPartSelect) formData.append('part', batchExamPartSelect.value);

                    const response = await fetch(`${BACKEND_URL}/api/evaluate`, { method: 'POST', body: formData });
                    if (response.status === 429) throw new Error('429_RATE_LIMIT');
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

                    const data = await response.json();
                    const userText = data.user_transcript || '';

                    // Save to history with filename
                    addToHistory(
                        data.overall_score || 0,
                        data.criteria_scores ? data.criteria_scores.grammar : 0,
                        data.criteria_scores ? data.criteria_scores.vocabulary : 0,
                        data.criteria_scores ? data.criteria_scores.pronunciation : 0,
                        data.criteria_scores ? data.criteria_scores.fluency : 0,
                        userText,
                        file.name  // ← NEW: store filename
                    );

                    const li = document.getElementById(listItemId);
                    if (li) { const badge = li.querySelector('.badge'); if (badge) badge.outerHTML = `<span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>Xong (${data.overall_score}/10)</span>`; }
                    success = true;
                } catch (error) {
                    if (error.message === '429_RATE_LIMIT') {
                        const li = document.getElementById(listItemId);
                        if (li) { const badge = li.querySelector('.badge'); if (badge) badge.outerHTML = `<span class="badge bg-warning text-dark" id="countdown-${i}"><i class="fa-solid fa-clock me-1"></i>Đợi 60s</span>`; }
                        for (let s = 60; s > 0; s--) {
                            const cdBadge = document.getElementById(`countdown-${i}`);
                            if (cdBadge) cdBadge.innerHTML = `<i class="fa-solid fa-clock me-1"></i>Nghỉ ${s}s`;
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        const li2 = document.getElementById(listItemId);
                        if (li2) { const badge2 = li2.querySelector('.badge'); if (badge2) badge2.outerHTML = '<span class="badge bg-warning text-dark"><i class="fa-solid fa-spinner fa-spin me-1"></i>Đang chấm</span>'; }
                    } else {
                        console.error('Batch error on file', file.name, error);
                        const li = document.getElementById(listItemId);
                        if (li) { const badge = li.querySelector('.badge'); if (badge) badge.outerHTML = '<span class="badge bg-danger"><i class="fa-solid fa-triangle-exclamation me-1"></i>Lỗi</span>'; }
                        success = true;
                    }
                }
            }
            if (i < batchFiles.length - 1) await new Promise(r => setTimeout(r, 1500));
        }

        if (batchProgressText) batchProgressText.innerText = `${batchFiles.length}/${batchFiles.length}`;
        if (batchProgressBar) { batchProgressBar.style.width = '100%'; batchProgressBar.classList.remove('progress-bar-animated', 'bg-primary'); batchProgressBar.classList.add('bg-success'); }
        if (batchFileList) batchFileList.innerHTML += '<li class="list-group-item bg-success bg-opacity-10 text-success fw-bold text-center mt-2 border-0 rounded shadow-sm"><i class="fa-solid fa-check-circle me-2"></i>Hoàn tất!</li>';
        if (batchFileList) batchFileList.scrollTop = batchFileList.scrollHeight;
        if (btnSelectBatch) btnSelectBatch.removeAttribute('disabled');
        if (batchFileInput) batchFileInput.value = '';
        batchFiles = [];
    });
}


// ─────────────────────────────────────────────────────────────
// 9. COMPARISON TABLE — AI vs Teacher
// ─────────────────────────────────────────────────────────────

/**
 * Compute match% between AI total score and teacher score.
 * Formula: (1 - |AI - GV| / 10) * 100
 */
function computeMatchPct(aiScore, gvScore) {
    if (gvScore === null || gvScore === undefined || gvScore === '') return null;
    const ai = parseFloat(aiScore);
    const gv = parseFloat(gvScore);
    if (isNaN(ai) || isNaN(gv)) return null;
    return Math.max(0, (1 - Math.abs(ai - gv) / 10) * 100);
}

function matchBadgeHTML(pct) {
    if (pct === null) return '<span class="match-badge" style="color:var(--text-muted);">—</span>';
    if (pct >= 90) return `<span class="match-badge good">🟢 ${pct.toFixed(0)}%</span>`;
    if (pct >= 75) return `<span class="match-badge warning">🟡 ${pct.toFixed(0)}%</span>`;
    return `<span class="match-badge bad">🔴 ${pct.toFixed(0)}%</span>`;
}

function renderCompareTable() {
    const tbody = document.getElementById('comparisonTableBody');
    if (!tbody) return;

    // Filter items that have AI criteria scores
    const gradedItems = historyList.filter(item => item.grammar !== undefined && item.grammar !== null);

    // Update KPI: total files
    const kpiTotal = document.getElementById('kpiTotalFiles');
    if (kpiTotal) kpiTotal.textContent = gradedItems.length;

    if (gradedItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="text-center py-5" style="color:var(--text-muted);"><i class="fa-solid fa-layer-group fs-1 mb-3 d-block opacity-25"></i><span>Chưa có dữ liệu. Hãy chấm bài trước.</span></td></tr>';
        return;
    }

    let rows = '';
    gradedItems.forEach(item => {
        const gv = item.teacher_score;
        const pct = computeMatchPct(item.score, gv);
        const gvVal = (gv !== null && gv !== undefined && gv !== '') ? parseFloat(gv) : null;
        // GV* per criteria (distribute evenly from total GV score)
        const gvCrit = gvVal !== null ? gvVal.toFixed(1) : '—';
        const displayName = item.filename
            ? `<div class="filename-text">${item.filename.length > 22 ? item.filename.substring(0,22)+'…' : item.filename}</div><div class="filename-sub">${item.date}</div>`
            : `<div class="filename-text">[Ghi âm trực tiếp]</div><div class="filename-sub">${item.date}</div>`;

        rows += `<tr>
            <td class="filename-cell">${displayName}</td>
            <td class="ai-score">${item.grammar ?? '—'}</td><td>${gvCrit}</td>
            <td class="ai-score">${item.vocabulary ?? '—'}</td><td>${gvCrit}</td>
            <td class="ai-score">${item.pronunciation ?? '—'}</td><td>${gvCrit}</td>
            <td class="ai-score">${item.fluency ?? '—'}</td><td>${gvCrit}</td>
            <td class="ai-score fw-bold">${item.score}</td>
            <td><input type="number" class="gv-input" id="gv-input-${item.id}" min="0" max="10" step="0.5" value="${gv !== null && gv !== undefined ? gv : ''}" placeholder="0-10" oninput="onGVInputChange('${item.id}', this.value)"></td>
            <td id="match-cell-${item.id}">${matchBadgeHTML(pct)}</td>
        </tr>`;
    });
    tbody.innerHTML = rows;
    updateDashboardStats();
}

function onGVInputChange(id, value) {
    const item = historyList.find(h => h.id === id);
    if (!item) return;
    const gv = value === '' ? null : parseFloat(value);
    const pct = computeMatchPct(item.score, gv);
    const matchCell = document.getElementById(`match-cell-${id}`);
    if (matchCell) matchCell.innerHTML = matchBadgeHTML(pct);
    // Temp store (not saved until btnSaveTeacherScores)
    item._tempTeacherScore = gv;
    updateDashboardStats();
}
window.onGVInputChange = onGVInputChange;

// Auto-detect GV scores from filename
const btnAutoDetect = document.getElementById('btnAutoDetect');
if (btnAutoDetect) {
    btnAutoDetect.addEventListener('click', async () => {
        const gradedItems = historyList.filter(item => item.filename);
        let detected = 0;
        for (const item of gradedItems) {
            try {
                const resp = await fetch(`${BACKEND_URL}/api/parse-grade?filename=${encodeURIComponent(item.filename)}`);
                const data = await resp.json();
                if (data.found && data.score !== null) {
                    item._tempTeacherScore = data.score;
                    const inputEl = document.getElementById(`gv-input-${item.id}`);
                    if (inputEl) {
                        inputEl.value = data.score;
                        const pct = computeMatchPct(item.score, data.score);
                        const matchCell = document.getElementById(`match-cell-${item.id}`);
                        if (matchCell) matchCell.innerHTML = matchBadgeHTML(pct);
                        detected++;
                    }
                }
            } catch(e) {
                // Parse locally as fallback
                const match = item.filename.match(/_grade_(\d+)/i);
                if (match) {
                    const score = parseInt(match[1]);
                    if (score >= 0 && score <= 10) {
                        item._tempTeacherScore = score;
                        const inputEl = document.getElementById(`gv-input-${item.id}`);
                        if (inputEl) {
                            inputEl.value = score;
                            const pct = computeMatchPct(item.score, score);
                            const matchCell = document.getElementById(`match-cell-${item.id}`);
                            if (matchCell) matchCell.innerHTML = matchBadgeHTML(pct);
                            detected++;
                        }
                    }
                }
            }
        }
        updateDashboardStats();
        if (detected > 0) {
            alert(`Đã tự động phát hiện điểm GV cho ${detected} file từ tên file!`);
        } else {
            alert('Không tìm thấy điểm GV trong tên file nào. Đảm bảo tên file có dạng: xxx_grade_4.mp3');
        }
    });
}

// Save teacher scores
const btnSaveTeacherScores = document.getElementById('btnSaveTeacherScores');
if (btnSaveTeacherScores) {
    btnSaveTeacherScores.addEventListener('click', () => {
        let saved = 0;
        historyList.forEach(item => {
            if (item._tempTeacherScore !== undefined) {
                item.teacher_score = item._tempTeacherScore;
                delete item._tempTeacherScore;
                saved++;
            }
        });
        saveHistoryToStorage();
        updateDashboardStats();
        if (saved > 0) alert(`Đã lưu điểm GV cho ${saved} bài!`);
        else alert('Chưa có điểm GV nào được nhập. Hãy nhập hoặc dùng Auto-detect trước.');
    });
}

// Render dashboard on button click
const btnRenderDashboard = document.getElementById('btnRenderDashboard');
if (btnRenderDashboard) {
    btnRenderDashboard.addEventListener('click', () => {
        updateDashboardStats();
        drawComparisonChart();
    });
}


// ─────────────────────────────────────────────────────────────
// 10. DASHBOARD — KPI, Agreement bar, Chart
// ─────────────────────────────────────────────────────────────
let comparisonChartInstance = null;

function updateDashboardStats() {
    const gradedItems = historyList.filter(item => item.grammar !== undefined);
    const withGV = gradedItems.filter(item => {
        const gv = item._tempTeacherScore !== undefined ? item._tempTeacherScore : item.teacher_score;
        return gv !== null && gv !== undefined && gv !== '';
    });

    const kpiAgreement = document.getElementById('kpiAgreement');
    const kpiMAE = document.getElementById('kpiMAE');
    const agreementSection = document.getElementById('agreementSection');
    const agreementBarFill = document.getElementById('agreementBarFill');
    const agreementPct = document.getElementById('agreementPct');
    const agreementHint = document.getElementById('agreementHint');

    if (withGV.length === 0) {
        if (kpiAgreement) kpiAgreement.textContent = '--%';
        if (kpiMAE) kpiMAE.textContent = '--';
        if (agreementSection) agreementSection.style.display = 'none';
        return;
    }

    // Compute per-item match%
    const matchPcts = withGV.map(item => {
        const gv = item._tempTeacherScore !== undefined ? item._tempTeacherScore : item.teacher_score;
        return computeMatchPct(item.score, gv);
    }).filter(p => p !== null);

    const avgMatch = matchPcts.length > 0 ? matchPcts.reduce((a, b) => a + b, 0) / matchPcts.length : 0;

    // MAE
    const maes = withGV.map(item => {
        const gv = item._tempTeacherScore !== undefined ? item._tempTeacherScore : item.teacher_score;
        return Math.abs(item.score - parseFloat(gv));
    });
    const mae = maes.reduce((a, b) => a + b, 0) / maes.length;

    if (kpiAgreement) kpiAgreement.textContent = avgMatch.toFixed(0) + '%';
    if (kpiMAE) kpiMAE.textContent = mae.toFixed(2);

    if (agreementSection) agreementSection.style.display = '';
    if (agreementPct) agreementPct.textContent = avgMatch.toFixed(0) + '%';
    if (agreementBarFill) {
        agreementBarFill.style.width = avgMatch.toFixed(0) + '%';
        agreementBarFill.className = 'agreement-bar-fill ' + (avgMatch >= 90 ? 'good' : avgMatch >= 75 ? 'warning' : 'bad');
    }
    if (agreementHint) {
        if (avgMatch >= 90) {
            agreementHint.innerHTML = '<i class="fa-solid fa-circle-check me-1" style="color:#10b981;"></i>Đạt mục tiêu ≥ 90% — AI chấm đồng thuận tốt với giáo viên!';
        } else {
            agreementHint.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1" style="color:#f59e0b;"></i>Chưa đạt mục tiêu 90% — cần thêm ${(90 - avgMatch).toFixed(0)}% nữa.`;
        }
    }
}

function drawComparisonChart() {
    const canvas = document.getElementById('comparisonChart');
    const chartSection = document.getElementById('chartSection');
    if (!canvas || !chartSection) return;

    const gradedItems = historyList.filter(item => item.grammar !== undefined);
    const withGV = gradedItems.filter(item => {
        const gv = item._tempTeacherScore !== undefined ? item._tempTeacherScore : item.teacher_score;
        return gv !== null && gv !== undefined && gv !== '';
    });

    if (withGV.length === 0) { chartSection.style.display = 'none'; return; }
    chartSection.style.display = '';

    const labels = withGV.map((item, i) => item.filename ? item.filename.split('_grade_')[0].substring(0, 10) : `SV${i+1}`);
    const aiScores = withGV.map(item => item.score);
    const gvScores = withGV.map(item => {
        const gv = item._tempTeacherScore !== undefined ? item._tempTeacherScore : item.teacher_score;
        return parseFloat(gv);
    });

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    if (comparisonChartInstance) comparisonChartInstance.destroy();
    comparisonChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: '🤖 AI', data: aiScores, backgroundColor: 'rgba(99,102,241,0.75)', borderColor: '#6366f1', borderWidth: 1.5, borderRadius: 6 },
                { label: '👩‍🏫 Giáo Viên', data: gvScores, backgroundColor: 'rgba(6,182,212,0.75)', borderColor: '#06b6d4', borderWidth: 1.5, borderRadius: 6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', size: 13 } } } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { min: 0, max: 10, ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
            }
        }
    });
}


// ─────────────────────────────────────────────────────────────
// 11. INIT
// ─────────────────────────────────────────────────────────────
applyLanguage(currentLanguage);
renderHistory();

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLanguage);
    loadRubricData();
    checkAuth();
});
