/* ================================================================
   DEV TEST TOOL  —  REMOVE BEFORE FINAL DELIVERY
   ================================================================
   Drop this file and remove the <script> tag in UniDashboard.cshtml
   to fully remove this tool from the build.
   ================================================================ */

(function () {
    'use strict';

    // ── Fake data ──────────────────────────────────────────────────

    const COLLEGES = [
        { name: 'College of Engineering', type: 'Scientific',  students: '1800' },
        { name: 'Medicine',               type: 'Medical',     students: '950'  },
        { name: 'Dentistry',              type: 'Medical',     students: '400'  },
        { name: 'College of Humanities',  type: 'Humanities',  students: '620'  },
        { name: 'College of Law',         type: 'Humanities',  students: '480'  },
    ];

    const PROGRAMS = [
        { program: 'Computer Science',       degree: 'Bachelor',       years: '4', system: 'Credit Hours',     acc: '2020-03-15', grad: '2024-06-30' },
        { program: 'Software Engineering',   degree: 'Bachelor',       years: '4', system: 'Credit Hours',     acc: '2021-02-10', grad: '2025-06-30' },
        { program: 'Internal Medicine',      degree: 'Bachelor',       years: '6', system: 'Semester Program', acc: '2019-07-01', grad: '2023-05-20' },
        { program: 'Dentistry',              degree: 'Bachelor',       years: '5', system: 'Semester Program', acc: '2018-09-01', grad: '2023-06-15' },
        { program: 'Business Administration',degree: 'Bachelor',       years: '4', system: 'Credit Hours',     acc: '2016-03-15', grad: '2020-06-20' },
        { program: 'Data Science',           degree: 'Master',         years: '2', system: 'Credit Hours',     acc: '2022-09-01', grad: '2024-08-20' },
        { program: 'MBA',                    degree: 'Master',         years: '2', system: 'Credit Hours',     acc: '2018-08-20', grad: '2022-07-31' },
        { program: 'Cybersecurity',          degree: 'Higher Diploma', years: '1', system: 'Yearly Program',   acc: '2022-06-01', grad: '2023-06-30' },
    ];

    const HOSPITALS = [
        { spec: 'Medicine',  name: 'King Hussein Medical Center',   major: 'Internal Medicine' },
        { spec: 'Medicine',  name: 'Jordan University Hospital',    major: 'General Surgery'   },
        { spec: 'Dentistry', name: 'Royal Medical Services - Dental', major: 'Orthodontics'   },
    ];

    const LABS = [
        { computers: '45', workshops: '8',  labs: '12' },
        { computers: '30', workshops: '5',  labs: '8'  },
    ];

    const ACCREDITATION_BODIES = [
        { name: 'ABET – Accreditation Board for Engineering and Technology', type: 'International' },
        { name: 'WASC Senior College and University Commission',             type: 'International' },
        { name: 'National Accreditation Commission',                        type: 'National'      },
    ];

    // ── Utilities ──────────────────────────────────────────────────

    const delay = ms => new Promise(r => setTimeout(r, ms));

    /** Set a native input/select value and fire input+change so listeners react. */
    function setVal(id, value) {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (!el) return false;
        try {
            const proto = el.tagName === 'SELECT'
                ? window.HTMLSelectElement.prototype
                : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) setter.call(el, value); else el.value = value;
        } catch { el.value = value; }
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    /** Set value on an element found by [name=...] inside a parent. */
    function setByName(parent, name, value) {
        const el = (typeof parent === 'string' ? document.getElementById(parent) : parent)
            ?.querySelector(`[name="${name}"]`);
        if (!el) return false;
        return setVal(el, value);
    }

    /** Return the value of the first non-empty <option> in a <select>. */
    function firstOption(selectId) {
        const el = document.getElementById(selectId);
        if (!el) return '';
        for (const o of el.options) { if (o.value) return o.value; }
        return '';
    }

    /** Best-match option value: exact match → first non-empty fallback. */
    function bestOption(selectId, preferred) {
        const el = document.getElementById(selectId);
        if (!el) return preferred;
        const exact = Array.from(el.options).find(o => o.value === preferred);
        return exact ? exact.value : firstOption(selectId);
    }

    /** Wait until container's subtree mutates (AJAX re-render). */
    function waitMutation(container, ms = 5000) {
        return new Promise(resolve => {
            const timer = setTimeout(() => { obs.disconnect(); resolve(); }, ms);
            const obs = new MutationObserver(() => {
                clearTimeout(timer);
                obs.disconnect();
                setTimeout(resolve, 100);
            });
            obs.observe(container, { childList: true, subtree: true });
        });
    }

    /** Tag the last <tbody tr> inside container as a test row. */
    function stampLastRow(container) {
        const rows = container.querySelectorAll('tbody tr');
        if (!rows.length) return null;
        const last = rows[rows.length - 1];
        if (last.querySelector('th')) return null;
        last.setAttribute('data-test-row', 'true');
        last.style.outline = '2px dashed #f59e0b';
        last.style.background = '#fffbeb';
        return last;
    }

    function log(msg) {
        const el = document.getElementById('_dt-status');
        if (el) el.textContent = msg;
        console.log('[DevTool]', msg);
    }

    // ── Section generators ─────────────────────────────────────────

    async function genPublicInfo() {
        const sec = document.getElementById('sec-general');
        if (!sec) { log('sec-general not found — skipped'); return; }

        setByName(sec, 'InstitutionName',        'Jordan International University');
        setByName(sec, 'FoundationDate',          '1990-09-01');
        setByName(sec, 'DateOfEstablishment',     '1990-09-01');
        setByName(sec, 'StartOfTeaching',         '1991-09-01');

        const modeEl = sec.querySelector('[name="ModeOfStudy"]');
        if (modeEl) setVal(modeEl, 'On-campus');

        const langEl = sec.querySelector('[name="LanguageOfInstruction"]');
        if (langEl) setVal(langEl, bestOption(langEl.id, 'English'));

        const oversightEl = sec.querySelector('[name="OversightRightsEntity"]');
        if (oversightEl) setVal(oversightEl, 'Ministry');

        setByName(sec, 'PresidentName',             'Prof. Ahmad Al-Hassan');
        setByName(sec, 'MailingFullAddress',         '123 University Avenue, Amman 11942, Jordan');
        setByName(sec, 'DirectPhoneNumber',          '+962-6-5300000');
        setByName(sec, 'EmailAddress',               'admin@jiu.edu.jo');
        setByName(sec, 'InstitutionalWebAddress',    'https://www.jiu.edu.jo');

        await delay(200);
        document.getElementById('btnSavePublic')?.click();
        await delay(600);
        log('✓ Public Info saved');
    }

    async function genAcademicInfo() {
        const sec = document.getElementById('sec-academic');
        if (!sec) { log('sec-academic not found — skipped'); return; }

        // Institution type
        const typeEl = sec.querySelector('[name="TypeOfAcademicInstitution"]');
        if (typeEl) setVal(typeEl, 'Private');

        // Degrees
        ['DegreeBSC', 'DegreeHigherDiploma', 'DegreeMaster'].forEach(name => {
            const cb = sec.querySelector(`[name="${name}"]`);
            if (cb && !cb.checked) cb.click();
        });

        // College categories — check Scientific, Medical, Humanities
        ['Scientific', 'Medical', 'Humanities'].forEach(cat => {
            const cb = sec.querySelector(`input[data-group="college-categories"][value="${cat}"]`);
            if (cb && !cb.checked) cb.click();
        });

        // Recognition / accreditation
        const recEl = sec.querySelector('[name="OfficialRecognitionInHomeCountry"]');
        if (recEl) setVal(recEl, 'Yes');
        const accEl = sec.querySelector('[name="OfficialAccreditationQualityInHomeCountry"]');
        if (accEl) setVal(accEl, 'Yes');

        // Student population
        setByName(sec, 'LocalStudentPopulation',    '3200');
        setByName(sec, 'ForeignStudentPopulation',  '550');
        setByName(sec, 'JordanianStudentPopulation','2800');
        // Total is calculated automatically

        // Academic staff (full-time rank matrix)
        const staffFT = {
            'StaffProfessorFullTimeCount':          '18',
            'StaffProfessorPartTimeCount':          '4',
            'StaffAssociateProfessorFullTimeCount': '22',
            'StaffAssociateProfessorPartTimeCount': '6',
            'StaffAssistantProfessorFullTimeCount': '35',
            'StaffAssistantProfessorPartTimeCount': '8',
            'StaffTeacherFullTimeCount':            '28',
            'StaffTeacherPartTimeCount':            '10',
            'StaffAssistantTeacherFullTimeCount':   '12',
            'StaffAssistantTeacherPartTimeCount':   '5',
            'StaffResearcherFullTimeCount':         '8',
            'StaffResearcherPartTimeCount':         '3',
            'StaffOthersFullTimeCount':             '5',
            'StaffOthersPartTimeCount':             '2',
            'StaffPractitionerMscFullTimeCount':    '6',
            'StaffPractitionerMscPartTimeCount':    '4',
            'StaffPractitionerPscFullTimeCount':    '4',
            'StaffPractitionerPscPartTimeCount':    '2',
        };
        for (const [name, val] of Object.entries(staffFT)) {
            setByName(sec, name, val);
        }

        await delay(200);
        document.getElementById('btnSaveAcademic')?.click();
        await delay(600);
        log('✓ Academic Info saved');
    }

    async function genAdmissionDuration() {
        const sec = document.getElementById('sec-admission-duration');
        if (!sec) { log('sec-admission-duration not found — skipped'); return; }

        const durations = {
            'AdmissionStudy.DiplomaDuration':       '2 years',
            'AdmissionStudy.BScDuration':           '4 years',
            'AdmissionStudy.HigherDiplomaDuration': '1 year',
            'AdmissionStudy.MasterDuration':        '2 years',
            'AdmissionStudy.PhDDuration':           '3 years',
        };
        for (const [name, val] of Object.entries(durations)) {
            const el = sec.querySelector(`[name="${name}"]`);
            if (el) setVal(el, val);
        }

        await delay(200);
        document.getElementById('btnSaveAdmissionRequirement')?.click();
        await delay(600);
        log('✓ Admission & Study Duration saved');
    }

    async function genColleges() {
        const c = document.getElementById('faculties-container');
        if (!c) { log('faculties-container not found — skipped'); return; }

        for (const row of COLLEGES) {
            setVal('fac_name', row.name);
            setVal('fac_type', bestOption('fac_type', row.type));
            setVal('fac_studentsCount', row.students);

            const btn = document.getElementById('fac_btnAdd');
            if (!btn || btn.disabled) { await delay(500); continue; }

            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampLastRow(c);
            log(`✓ College: ${row.name}`);
        }
    }

    async function genPrograms() {
        const c = document.getElementById('programs-container');
        if (!c) { log('programs-container not found — skipped'); return; }

        for (const row of PROGRAMS) {
            setVal('prg_faculty', firstOption('prg_faculty'));
            setVal('prg_program', row.program);
            setVal('prg_degree',  bestOption('prg_degree',  row.degree));
            setVal('prg_years',   row.years);
            setVal('prg_system',  bestOption('prg_system',  row.system));
            setVal('prg_acc',     row.acc);
            setVal('prg_gradlast', row.grad);

            const btn = document.getElementById('prg_addBtn') || c.querySelector('[data-prg-add]');
            if (!btn) { log('prg add btn not found'); continue; }

            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampLastRow(c);
            log(`✓ Program: ${row.program}`);
        }
    }

    async function genMedicineDentistry() {
        const c = document.getElementById('medDenContainer') || document.querySelector('[data-partial-url*="MedicineDentistry"]');
        if (!c) { log('medDenContainer not found — skipped'); return; }

        const fields = {
            // Medicine students
            'med_totalStudents': '950',
            // Dentistry students
            'den_totalStudents': '400',
            // Medicine staff
            'med_fullTimeProfessor':                      '8',
            'med_partTimeClinicalProfessor':               '3',
            'med_fullTimeAssociateProfessor':              '10',
            'med_partTimeClinicalAssociateProfessor':       '4',
            'med_fullTimeAssistantProfessor':              '14',
            'med_partTimeClinicalAssistantProfessor':       '5',
            'med_fullTimeLecturerPhd':                     '6',
            'med_partTimeClinicalLecturerPhd':              '2',
            'med_fullTimeLecturerMsc':                     '4',
            'med_fullTimeAssistantLecturerPhd':             '3',
            'med_fullTimeAssistantLecturerMsc':             '2',
            // Dentistry staff
            'den_fullTimeProfessor':                       '5',
            'den_partTimeClinicalProfessor':                '2',
            'den_fullTimeAssociateProfessor':               '6',
            'den_partTimeClinicalAssociateProfessor':       '2',
            'den_fullTimeAssistantProfessor':               '8',
            'den_partTimeClinicalAssistantProfessor':       '3',
            'den_fullTimeLecturerPhd':                     '3',
            'den_partTimeClinicalLecturerPhd':              '1',
            'den_fullTimeLecturerMsc':                     '2',
            'den_fullTimeAssistantLecturerPhd':             '2',
            'den_fullTimeAssistantLecturerMsc':             '1',
        };

        for (const [id, val] of Object.entries(fields)) {
            setVal(id, val);
        }

        await delay(300);
        if (window.MedDenSave) {
            await window.MedDenSave();
            log('✓ Medicine & Dentistry saved');
        } else {
            log('⚠ MedDenSave not found — fields filled but not saved');
        }
        await delay(400);
    }

    async function genInfrastructure() {
        const c = document.getElementById('infrastructureContainer');
        if (!c) { log('infrastructureContainer not found — skipped'); return; }

        setVal('infra_areaKm2',          '0.85');
        setVal('infra_campusesCount',    '3');
        setVal('infra_classroomsCount',  '120');
        setVal('infra_librariesCount',   '4');
        setVal('infra_stadiumsCount',    '2');

        await delay(200);
        const btn = document.getElementById('btnSaveInfrastructure');
        if (btn) {
            btn.click();
            await delay(500);
            log('✓ Infrastructure saved');
        } else {
            log('⚠ btnSaveInfrastructure not found');
        }
    }

    async function genLabs() {
        const c = document.getElementById('laboratoriesContainer');
        if (!c) { log('laboratoriesContainer not found — skipped'); return; }

        for (const row of LABS) {
            setVal('lab_facultyId',    firstOption('lab_facultyId'));
            setVal('lab_computers',    row.computers);
            setVal('lab_workshops',    row.workshops);
            setVal('lab_laboratories', row.labs);

            const btn = document.getElementById('lab_addBtn');
            if (!btn) { log('lab_addBtn not found'); continue; }

            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampLastRow(c);
            log(`✓ Lab row: PCs=${row.computers}`);
        }
    }

    async function genLibrary() {
        const c = document.getElementById('libraryContainer');
        if (!c) { log('libraryContainer not found — skipped'); return; }

        setVal('lib_area',              '1200');
        setVal('lib_capacity',          '500');
        setVal('lib_arabicBooks',       '8000');
        setVal('lib_englishBooks',      '12000');
        setVal('lib_paperJournals',     '350');
        setVal('lib_electronicBooks',   '5000');
        setVal('lib_electronicJournals','1200');

        await delay(200);
        if (window.LibrarySave) {
            await window.LibrarySave();
            log('✓ Library saved');
        } else {
            const btn = c.querySelector('button.btn-primary');
            if (btn) { btn.click(); await delay(400); }
            log('✓ Library saved (btn click)');
        }
        await delay(400);
    }

    async function genAccreditationBodies() {
        const c = document.getElementById('accreditationBodiesContainer');
        if (!c) { log('accreditationBodiesContainer not found — skipped'); return; }

        for (const row of ACCREDITATION_BODIES) {
            setVal('accb_bodyName', row.name);
            setVal('accb_type', bestOption('accb_type', row.type));
            // Skip PDF — dev mode

            const btn = document.getElementById('accb_addBtn');
            if (!btn) { log('accb_addBtn not found'); break; }

            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampLastRow(c);
            log(`✓ Accreditation Body: ${row.name}`);
        }
    }

    async function genHospitals() {
        const c = document.getElementById('hospitalsContainer');
        if (!c) { log('hospitalsContainer not found — skipped'); return; }

        // Set bed capacity for Medicine
        setVal('hosp_cap_specialization', 'Medicine');
        document.getElementById('hosp_cap_specialization')
            ?.dispatchEvent(new Event('change', { bubbles: true }));
        if (window.HospCapacityToggleLabel) window.HospCapacityToggleLabel();
        await delay(200);
        setVal('hosp_cap_value', '300');

        const mut0 = waitMutation(c);
        if (window.HospSaveCapacity) window.HospSaveCapacity();
        await mut0;
        log('✓ Hospital bed capacity saved');

        for (const fac of HOSPITALS) {
            setVal('hosp_fac_specialization', fac.spec);
            setVal('hosp_fac_name',  fac.name);
            setVal('hosp_fac_major', fac.major);

            const mut = waitMutation(c);
            if (window.HospFacilityAdd) window.HospFacilityAdd();
            await mut;

            const trs = c.querySelectorAll('table tbody tr, .hosp-tbl tbody tr');
            if (trs.length) {
                const last = trs[trs.length - 1];
                last.setAttribute('data-test-row', 'true');
                last.style.outline = '2px dashed #f59e0b';
                last.style.background = '#fffbeb';
            }
            log(`✓ Hospital: ${fac.name}`);
        }
    }

    async function genSubmitApplication() {
        const c = document.getElementById('submitApplicationContainer');
        if (!c) { log('submitApplicationContainer not found — skipped'); return; }

        setVal('subapp_name',      'Dr. Kamelia Qumsieh');
        setVal('subapp_workplace', 'Jordan International University');

        const ack = document.getElementById('subapp_ack');
        if (ack && !ack.checked) ack.click();

        log('✓ Submit Application fields filled — click Submit manually to finalize');
    }

    // ── Main generate (all sections) ──────────────────────────────

    async function generateAll() {
        log('Step 1/9 — Public Info…');
        await genPublicInfo();

        log('Step 2/9 — Academic Info…');
        await genAcademicInfo();
        await delay(400);

        log('Step 3/9 — Admission & Study Duration…');
        await genAdmissionDuration();

        log('Step 4/9 — Colleges…');
        await genColleges();
        await delay(1500); // wait for program dropdowns to refresh

        log('Step 5/9 — Programs…');
        await genPrograms();
        await delay(600);

        log('Step 6/9 — Medicine & Dentistry…');
        await genMedicineDentistry();

        log('Step 7/9 — Infrastructure…');
        await genInfrastructure();

        log('Step 8/9 — Laboratories…');
        await genLabs();
        await delay(400);

        log('Step 9/9 — Library, Accreditation Bodies & Submit fields…');
        await genLibrary();
        await genAccreditationBodies();
        await genHospitals();
        await genSubmitApplication();

        log('✅ All sections filled! Review then click Submit.');
    }

    // ── Clear test rows ────────────────────────────────────────────

    async function clearAll() {
        log('Clearing test rows…');
        const origConfirm = window.confirm;
        window.confirm = () => true;

        try {
            const delegated = [
                { cId: 'faculties-container',          delSel: '[data-fac-del]'             },
                { cId: 'programs-container',           delSel: '[data-prg-del]'             },
                { cId: 'laboratoriesContainer',        delSel: '[data-lab-action="delete"]' },
                { cId: 'accreditationBodiesContainer', delSel: '[data-accb-del]'            },
            ];

            for (const sec of delegated) {
                const c = document.getElementById(sec.cId);
                if (!c) continue;
                let testRows;
                while ((testRows = Array.from(c.querySelectorAll('[data-test-row="true"]'))).length) {
                    const btn = testRows[0].querySelector(sec.delSel);
                    if (!btn) break;
                    const mut = waitMutation(c);
                    btn.click();
                    await mut;
                }
            }

            const hospC = document.getElementById('hospitalsContainer');
            if (hospC) {
                let testRows;
                while ((testRows = Array.from(hospC.querySelectorAll('[data-test-row="true"]'))).length) {
                    const row = testRows[0];
                    const delBtn = row.querySelector('button[onclick*="HospFacilityDelete"]')
                                || row.querySelector('.hosp-action-btn.danger');
                    if (!delBtn) { row.removeAttribute('data-test-row'); continue; }
                    const mut = waitMutation(hospC);
                    delBtn.click();
                    await mut;
                }
            }

        } finally {
            window.confirm = origConfirm;
        }
        log('✅ Test rows cleared');
    }

    // ── Panel UI ───────────────────────────────────────────────────

    function buildPanel() {
        const css = document.createElement('style');
        css.textContent = `
            #_dt-panel {
                position: fixed; bottom: 24px; right: 24px; z-index: 99999;
                background: #0f172a; color: #e2e8f0;
                border: 1px solid #334155; border-radius: 14px;
                padding: 16px 18px; min-width: 240px;
                box-shadow: 0 8px 32px rgba(0,0,0,.55);
                font-family: ui-monospace, 'Cascadia Code', monospace; font-size: 12px;
            }
            #_dt-panel ._dt-head {
                font-weight: 800; font-size: 13px; color: #f59e0b;
                margin-bottom: 10px; letter-spacing: .5px; user-select: none;
            }
            #_dt-panel ._dt-btn {
                display: block; width: 100%; padding: 8px 12px;
                border-radius: 8px; border: none; cursor: pointer;
                font-weight: 700; font-size: 12px; margin-bottom: 6px;
                font-family: inherit; transition: background .15s;
            }
            #_dt-panel ._dt-btn:disabled { opacity: .45; cursor: not-allowed; }
            #_dt-panel ._dt-all  { background: #16a34a; color: #fff; }
            #_dt-panel ._dt-all:hover:not(:disabled)  { background: #15803d; }
            #_dt-panel ._dt-pub  { background: #0891b2; color: #fff; }
            #_dt-panel ._dt-pub:hover:not(:disabled)  { background: #0e7490; }
            #_dt-panel ._dt-acad { background: #7c3aed; color: #fff; }
            #_dt-panel ._dt-acad:hover:not(:disabled) { background: #6d28d9; }
            #_dt-panel ._dt-prg  { background: #2563eb; color: #fff; }
            #_dt-panel ._dt-prg:hover:not(:disabled)  { background: #1d4ed8; }
            #_dt-panel ._dt-sub  { background: #ea580c; color: #fff; }
            #_dt-panel ._dt-sub:hover:not(:disabled)  { background: #c2410c; }
            #_dt-panel ._dt-clr  { background: #dc2626; color: #fff; }
            #_dt-panel ._dt-clr:hover:not(:disabled)  { background: #b91c1c; }
            #_dt-panel ._dt-div  { border-top: 1px solid #334155; margin: 8px 0; }
            #_dt-status {
                margin-top: 6px; font-size: 11px; color: #94a3b8;
                min-height: 14px; word-break: break-all; line-height: 1.5;
            }
        `;
        document.head.appendChild(css);

        const panel = document.createElement('div');
        panel.id = '_dt-panel';
        panel.innerHTML = `
            <div class="_dt-head">⚙ DEV TEST TOOL</div>
            <button id="_dt-all-btn"  class="_dt-btn _dt-all">▶ Fill Everything</button>
            <div class="_dt-div"></div>
            <button id="_dt-pub-btn"  class="_dt-btn _dt-pub">① Public Info</button>
            <button id="_dt-acad-btn" class="_dt-btn _dt-acad">② Academic Info</button>
            <button id="_dt-adm-btn"  class="_dt-btn _dt-pub">③ Admission & Duration</button>
            <button id="_dt-col-btn"  class="_dt-btn _dt-prg">④ Colleges</button>
            <button id="_dt-prg-btn"  class="_dt-btn _dt-prg">⑤ Programs (${PROGRAMS.length})</button>
            <button id="_dt-med-btn"  class="_dt-btn _dt-acad">⑥ Medicine/Dentistry</button>
            <button id="_dt-inf-btn"  class="_dt-btn _dt-pub">⑦ Infrastructure</button>
            <button id="_dt-lab-btn"  class="_dt-btn _dt-prg">⑧ Labs</button>
            <button id="_dt-lib-btn"  class="_dt-btn _dt-pub">⑨ Library</button>
            <button id="_dt-acc-btn"  class="_dt-btn _dt-acad">⑩ Accreditation Bodies</button>
            <button id="_dt-hosp-btn" class="_dt-btn _dt-prg">⑪ Hospitals</button>
            <button id="_dt-sub-btn"  class="_dt-btn _dt-sub">⑫ Fill Submit Fields</button>
            <div class="_dt-div"></div>
            <button id="_dt-clr-btn"  class="_dt-btn _dt-clr">✕ Clear Test Rows</button>
            <div id="_dt-status">Ready</div>
        `;
        document.body.appendChild(panel);

        const allBtns = panel.querySelectorAll('._dt-btn');

        async function run(fn) {
            allBtns.forEach(b => b.disabled = true);
            try { await fn(); } finally { allBtns.forEach(b => b.disabled = false); }
        }

        document.getElementById('_dt-all-btn') .addEventListener('click', () => run(generateAll));
        document.getElementById('_dt-pub-btn') .addEventListener('click', () => run(genPublicInfo));
        document.getElementById('_dt-acad-btn').addEventListener('click', () => run(genAcademicInfo));
        document.getElementById('_dt-adm-btn') .addEventListener('click', () => run(genAdmissionDuration));
        document.getElementById('_dt-col-btn') .addEventListener('click', () => run(genColleges));
        document.getElementById('_dt-prg-btn') .addEventListener('click', () => run(genPrograms));
        document.getElementById('_dt-med-btn') .addEventListener('click', () => run(genMedicineDentistry));
        document.getElementById('_dt-inf-btn') .addEventListener('click', () => run(genInfrastructure));
        document.getElementById('_dt-lab-btn') .addEventListener('click', () => run(genLabs));
        document.getElementById('_dt-lib-btn') .addEventListener('click', () => run(genLibrary));
        document.getElementById('_dt-acc-btn') .addEventListener('click', () => run(genAccreditationBodies));
        document.getElementById('_dt-hosp-btn').addEventListener('click', () => run(genHospitals));
        document.getElementById('_dt-sub-btn') .addEventListener('click', () => run(genSubmitApplication));
        document.getElementById('_dt-clr-btn') .addEventListener('click', () => run(clearAll));
    }

    document.addEventListener('DOMContentLoaded', buildPanel);

})();
