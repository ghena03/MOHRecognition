/* ================================================================
   DEV TEST TOOL  —  REMOVE BEFORE FINAL DELIVERY
   ================================================================
   Drop this file and remove the <script> tag in UniDashboard.cshtml
   to fully remove this tool from the build.
   ================================================================ */

(function () {
    'use strict';

    // ── Data ──────────────────────────────────────────────────────────────────

    const COLLEGES = [
        { name: 'College of Engineering', type: 'Scientific',  students: '1800' },
        { name: 'Medicine',               type: 'Medical',     students: '950'  },
        { name: 'Dentistry',              type: 'Medical',     students: '400'  },
        { name: 'College of Humanities',  type: 'Humanities',  students: '620'  },
        { name: 'College of Law',         type: 'Humanities',  students: '480'  },
    ];

    const PROGRAMS = [
        { program: 'Computer Science',        degree: 'Bachelor',       years: '4', system: 'Credit Hours',     acc: '2020-03-15', grad: '2024-06-30' },
        { program: 'Software Engineering',    degree: 'Bachelor',       years: '4', system: 'Credit Hours',     acc: '2021-02-10', grad: '2025-06-30' },
        { program: 'Internal Medicine',       degree: 'Bachelor',       years: '6', system: 'Semester Program', acc: '2019-07-01', grad: '2023-05-20' },
        { program: 'Dentistry',               degree: 'Bachelor',       years: '5', system: 'Semester Program', acc: '2018-09-01', grad: '2023-06-15' },
        { program: 'Business Administration', degree: 'Bachelor',       years: '4', system: 'Credit Hours',     acc: '2016-03-15', grad: '2020-06-20' },
        { program: 'Data Science',            degree: 'Master',         years: '2', system: 'Credit Hours',     acc: '2022-09-01', grad: '2024-08-20' },
        { program: 'MBA',                     degree: 'Master',         years: '2', system: 'Credit Hours',     acc: '2018-08-20', grad: '2022-07-31' },
        { program: 'Cybersecurity',           degree: 'Higher Diploma', years: '1', system: 'Yearly Program',   acc: '2022-06-01', grad: '2023-06-30' },
    ];

    const HOSPITALS = [
        { spec: 'Medicine',  name: 'King Hussein Medical Center',     beds: '300', dental: null  },
        { spec: 'Medicine',  name: 'Jordan University Hospital',      beds: '250', dental: null  },
        { spec: 'Dentistry', name: 'Royal Medical Services - Dental', beds: null,  dental: '80'  },
    ];

    const LABS = [
        { computers: '45', labs: '12' },
        { computers: '30', labs: '8'  },
    ];

    const ACCREDITATION_BODIES = [
        { name: 'ABET – Accreditation Board for Engineering and Technology', type: 'International' },
        { name: 'WASC Senior College and University Commission',             type: 'International' },
        { name: 'National Accreditation Commission',                        type: 'Local'         },
    ];

    const PICTURE_CARDS = ['library', 'hospital', 'faculties', 'laboratories', 'facilities'];

    const DUMMY_PDF =
        '%PDF-1.4\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n' +
        '2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj\n' +
        '3 0 obj<</Type /Page /MediaBox [0 0 3 3]>>endobj\n' +
        'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
        '0000000058 00000 n \n0000000115 00000 n \n' +
        'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF\n';

    // ── Utilities ─────────────────────────────────────────────────────────────

    const delay = ms => new Promise(r => setTimeout(r, ms));

    function pdf(name) {
        return new File([DUMMY_PDF], name || 'dummy.pdf', { type: 'application/pdf' });
    }

    function attachFile(input, file) {
        if (!input || !file) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async function fetchXlsx(staffType) {
        try {
            const r = await fetch(`/Home/DownloadAcademicRankExcelTemplate?staffType=${staffType}`);
            return r.ok ? await r.arrayBuffer() : null;
        } catch { return null; }
    }

    function setVal(el, value) {
        if (typeof el === 'string') el = document.getElementById(el);
        if (!el) return;
        try {
            const proto  = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            setter ? setter.call(el, value) : (el.value = value);
        } catch { el.value = value; }
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function setByName(parent, name, value) {
        const root = typeof parent === 'string' ? document.getElementById(parent) : parent;
        const el   = root?.querySelector(`[name="${name}"]`);
        if (el) setVal(el, value);
    }

    function firstOption(id) {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (!el) return '';
        for (const o of el.options) if (o.value) return o.value;
        return '';
    }

    function bestOption(id, preferred) {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (!el) return preferred;
        return Array.from(el.options).find(o => o.value === preferred)?.value || firstOption(el);
    }

    function waitMutation(container, ms = 6000) {
        return new Promise(resolve => {
            const t = setTimeout(() => { ob.disconnect(); resolve(); }, ms);
            const ob = new MutationObserver(() => { clearTimeout(t); ob.disconnect(); setTimeout(resolve, 120); });
            ob.observe(container, { childList: true, subtree: true });
        });
    }

    function stampRow(container) {
        const rows = container.querySelectorAll('tbody tr');
        if (!rows.length) return;
        const last = rows[rows.length - 1];
        if (last.querySelector('th')) return;
        last.setAttribute('data-test-row', 'true');
        Object.assign(last.style, { outline: '2px dashed #f59e0b', background: '#fffbeb' });
    }

    // ── Section generators ────────────────────────────────────────────────────

    async function genPublicInfo() {
        const sec = document.getElementById('sec-general');
        if (!sec) { log('⚠ sec-general not found'); return; }

        setByName(sec, 'InstitutionName',           'Jordan International University');
        setByName(sec, 'FoundationDate',             '1990-09-01');
        setByName(sec, 'DateOfEstablishment',        '1990-09-01');
        setByName(sec, 'StartOfTeaching',            '1991-09-01');
        setByName(sec, 'PresidentName',              'Prof. Ahmad Al-Hassan');
        setByName(sec, 'MailingFullAddress',         '123 University Avenue, Amman 11942, Jordan');
        setByName(sec, 'DirectPhoneNumber',          '+962-6-5300000');
        setByName(sec, 'EmailAddress',               'admin@jiu.edu.jo');
        setByName(sec, 'InstitutionalWebAddress',    'https://www.jiu.edu.jo');

        const modeEl = sec.querySelector('[name="ModeOfStudy"]');
        if (modeEl) setVal(modeEl, 'On-campus');
        const langEl = sec.querySelector('[name="LanguageOfInstruction"]');
        if (langEl) setVal(langEl, bestOption(langEl, 'English'));
        const oversightEl = sec.querySelector('[name="OversightRightsEntity"]');
        if (oversightEl) setVal(oversightEl, 'Ministry');

        await delay(200);
        document.getElementById('btnSavePublic')?.click();
        await delay(600);
    }

    async function genAcademicInfo() {
        const sec = document.getElementById('sec-academic');
        if (!sec) { log('⚠ sec-academic not found'); return; }

        const typeEl = sec.querySelector('[name="TypeOfAcademicInstitution"]');
        if (typeEl) setVal(typeEl, 'Private');

        ['DegreeBSC', 'DegreeHigherDiploma', 'DegreeMaster'].forEach(n => {
            const cb = sec.querySelector(`[name="${n}"]`);
            if (cb && !cb.checked) cb.click();
        });

        // Educational systems
        ['SystemCreditHours', 'SystemSemesterProgram'].forEach(n => {
            const cb = sec.querySelector(`[name="${n}"]`);
            if (cb && !cb.checked) cb.click();
        });

        ['Scientific', 'Medical', 'Humanities'].forEach(cat => {
            const cb = sec.querySelector(`input[data-group="college-categories"][value="${cat}"]`);
            if (cb && !cb.checked) cb.click();
        });

        const recEl = sec.querySelector('[name="OfficialRecognitionInHomeCountry"]');
        if (recEl) setVal(recEl, 'Yes');
        const accEl = sec.querySelector('[name="OfficialAccreditationQualityInHomeCountry"]');
        if (accEl) setVal(accEl, 'Yes');

        setByName(sec, 'LocalStudentPopulation',     '3200');
        setByName(sec, 'ForeignStudentPopulation',   '550');
        setByName(sec, 'JordanianStudentPopulation', '2800');

        const staff = {
            StaffProfessorFullTimeCount:           '18', StaffProfessorPartTimeCount:           '4',
            StaffAssociateProfessorFullTimeCount:   '22', StaffAssociateProfessorPartTimeCount:  '6',
            StaffAssistantProfessorFullTimeCount:   '35', StaffAssistantProfessorPartTimeCount:  '8',
            StaffTeacherFullTimeCount:              '28', StaffTeacherPartTimeCount:             '10',
            StaffAssistantTeacherFullTimeCount:     '12', StaffAssistantTeacherPartTimeCount:    '5',
            StaffResearcherFullTimeCount:           '8',  StaffResearcherPartTimeCount:          '3',
            StaffOthersFullTimeCount:               '5',  StaffOthersPartTimeCount:              '2',
            StaffPractitionerMscFullTimeCount:      '6',  StaffPractitionerMscPartTimeCount:     '4',
            StaffPractitionerPscFullTimeCount:      '4',  StaffPractitionerPscPartTimeCount:     '2',
        };
        for (const [n, v] of Object.entries(staff)) setByName(sec, n, v);

        await delay(200);
        document.getElementById('btnSaveAcademic')?.click();
        await delay(600);
    }

    async function genRankExcels() {
        const sec = document.getElementById('sec-academic');
        if (!sec) { log('⚠ sec-academic not found for Excel upload'); return; }

        const inputs = Array.from(sec.querySelectorAll('.rank-staff-upload'));
        if (!inputs.length) { log('⚠ No rank-staff-upload inputs found'); return; }

        log(`Fetching Excel templates…`);
        const [ftBuf, ptBuf] = await Promise.all([fetchXlsx('fulltime'), fetchXlsx('parttime')]);
        if (!ftBuf || !ptBuf) { log('⚠ Could not fetch Excel templates'); return; }

        for (let i = 0; i < inputs.length; i++) {
            const inp     = inputs[i];
            const empType = inp.getAttribute('data-employment-type') || 'fulltime';
            const rank    = inp.getAttribute('data-rank-key') || `rank${i}`;
            const buf     = empType === 'fulltime' ? ftBuf : ptBuf;
            attachFile(inp, new File([buf], `${rank}_${empType}.xlsx`,
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            await delay(1200);
            log(`Excel ${i + 1}/${inputs.length}: ${rank} (${empType})`);
        }
    }

    async function genAdmissionDuration() {
        const sec = document.getElementById('sec-admission-duration');
        if (!sec) { log('⚠ sec-admission-duration not found'); return; }

        const durations = {
            'AdmissionStudy.DiplomaDuration':       '2 years',
            'AdmissionStudy.BScDuration':           '4 years',
            'AdmissionStudy.HigherDiplomaDuration': '1 year',
            'AdmissionStudy.MasterDuration':        '2 years',
            'AdmissionStudy.PhDDuration':           '3 years',
        };
        for (const [n, v] of Object.entries(durations)) {
            const el = sec.querySelector(`[name="${n}"]`);
            if (el) setVal(el, v);
        }

        ['Diploma', 'BSc', 'HigherDiploma', 'Master', 'PhD'].forEach(type => {
            const input = sec.querySelector(`[name="AdmissionStudy.${type}SamplePdf"]`);
            if (input) attachFile(input, pdf(`sample_${type}.pdf`));
        });

        await delay(200);
        document.getElementById('btnSaveAdmissionRequirement')?.click();
        await delay(800);
    }

    async function genColleges() {
        const c = document.getElementById('faculties-container');
        if (!c) { log('⚠ faculties-container not found'); return; }

        for (const row of COLLEGES) {
            setVal('fac_name',          row.name);
            setVal('fac_type',          bestOption('fac_type', row.type));
            setVal('fac_studentsCount', row.students);

            const btn = document.getElementById('fac_btnAdd');
            if (!btn || btn.disabled) { await delay(500); continue; }
            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampRow(c);
        }
    }

    async function genPrograms() {
        const c = document.getElementById('programs-container');
        if (!c) { log('⚠ programs-container not found'); return; }

        for (const row of PROGRAMS) {
            setVal('prg_faculty',  firstOption('prg_faculty'));
            setVal('prg_program',  row.program);
            setVal('prg_degree',   bestOption('prg_degree',  row.degree));
            setVal('prg_years',    row.years);
            setVal('prg_system',   bestOption('prg_system',  row.system));
            setVal('prg_acc',      row.acc);
            setVal('prg_gradlast', row.grad);

            const btn = document.getElementById('prg_addBtn') || c.querySelector('[data-prg-add]');
            if (!btn) { log('⚠ prg add btn not found'); continue; }
            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampRow(c);
        }
    }

    async function genMedicineDentistry() {
        const c = document.getElementById('medDenContainer')
               || document.querySelector('[data-partial-url*="MedicineDentistry"]');
        if (!c) { log('⚠ medDenContainer not found'); return; }

        const fields = {
            med_totalStudents: '950', den_totalStudents: '400',
            med_fullTimeProfessor: '8',                      med_partTimeClinicalProfessor: '3',
            med_fullTimeAssociateProfessor: '10',             med_partTimeClinicalAssociateProfessor: '4',
            med_fullTimeAssistantProfessor: '14',             med_partTimeClinicalAssistantProfessor: '5',
            med_fullTimeLecturerPhd: '6',                    med_partTimeClinicalLecturerPhd: '2',
            med_fullTimeLecturerMsc: '4',
            med_fullTimeAssistantLecturerPhd: '3',
            med_fullTimeAssistantLecturerMsc: '2',
            den_fullTimeProfessor: '5',                      den_partTimeClinicalProfessor: '2',
            den_fullTimeAssociateProfessor: '6',              den_partTimeClinicalAssociateProfessor: '2',
            den_fullTimeAssistantProfessor: '8',              den_partTimeClinicalAssistantProfessor: '3',
            den_fullTimeLecturerPhd: '3',                    den_partTimeClinicalLecturerPhd: '1',
            den_fullTimeLecturerMsc: '2',
            den_fullTimeAssistantLecturerPhd: '2',
            den_fullTimeAssistantLecturerMsc: '1',
        };
        for (const [id, v] of Object.entries(fields)) setVal(id, v);

        await delay(300);
        if (window.MedDenSave) { await window.MedDenSave(); await delay(400); }
        else log('⚠ MedDenSave not found — values set but not saved');
    }

    async function genInfrastructure() {
        const c = document.getElementById('infrastructureContainer');
        if (!c) { log('⚠ infrastructureContainer not found'); return; }

        setVal('infra_areaKm2',         '0.85');
        setVal('infra_campusesCount',   '3');
        setVal('infra_classroomsCount', '120');
        setVal('infra_librariesCount',  '4');
        setVal('infra_stadiumsCount',   '2');

        await delay(200);
        document.getElementById('btnSaveInfrastructure')?.click();
        await delay(500);
    }

    async function genLabs() {
        const c = document.getElementById('laboratoriesContainer');
        if (!c) { log('⚠ laboratoriesContainer not found'); return; }

        for (const row of LABS) {
            setVal('lab_facultyId',    firstOption('lab_facultyId'));
            setVal('lab_computers',    row.computers);
            setVal('lab_laboratories', row.labs);

            const btn = document.getElementById('lab_addBtn');
            if (!btn) { log('⚠ lab_addBtn not found'); continue; }
            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampRow(c);
        }
    }

    async function genLibrary() {
        const c = document.getElementById('libraryContainer');
        if (!c) { log('⚠ libraryContainer not found'); return; }

        setVal('lib_area',               '1200');
        setVal('lib_capacity',           '500');
        setVal('lib_numberOfBooks',      '20000');
        setVal('lib_paperJournals',      '350');
        setVal('lib_electronicBooks',    '5000');
        setVal('lib_electronicJournals', '1200');

        await delay(200);
        if (window.LibrarySave) { await window.LibrarySave(); }
        else { c.querySelector('button.btn-primary')?.click(); }
        await delay(400);
    }

    async function genAccreditationBodies() {
        const c = document.getElementById('accreditationBodiesContainer');
        if (!c) { log('⚠ accreditationBodiesContainer not found'); return; }

        for (const row of ACCREDITATION_BODIES) {
            setVal('accb_bodyName', row.name);
            setVal('accb_type',     bestOption('accb_type', row.type));
            attachFile(document.getElementById('accb_pdf'), pdf('accreditation_certificate.pdf'));

            const btn = document.getElementById('accb_addBtn');
            if (!btn) { log('⚠ accb_addBtn not found'); break; }
            const mut = waitMutation(c);
            btn.click();
            await mut;
            stampRow(c);
        }
    }

    async function genHospitals() {
        const c = document.getElementById('hospitalsContainer');
        if (!c) { log('⚠ hospitalsContainer not found'); return; }

        for (const fac of HOSPITALS) {
            // Set specialization and trigger capacity field visibility
            const specEl = document.getElementById('hosp_fac_specialization');
            if (specEl) {
                setVal(specEl, fac.spec);
                specEl.dispatchEvent(new Event('change', { bubbles: true }));
                if (window.HospFacilityToggleCapacity) window.HospFacilityToggleCapacity();
            }
            await delay(150);

            setVal('hosp_fac_name', fac.name);

            // Set capacity based on specialization
            if (fac.beds)   setVal('hosp_fac_beds',   fac.beds);
            if (fac.dental) setVal('hosp_fac_dental', fac.dental);

            attachFile(document.getElementById('hosp_fac_agreement_files'), pdf('hospital_agreement.pdf'));

            const mut = waitMutation(c);
            if (window.HospFacilityAdd) window.HospFacilityAdd();
            await mut;

            const rows = c.querySelectorAll('table tbody tr, .hosp-tbl tbody tr');
            if (rows.length) {
                const last = rows[rows.length - 1];
                last.setAttribute('data-test-row', 'true');
                Object.assign(last.style, { outline: '2px dashed #f59e0b', background: '#fffbeb' });
            }
            await delay(300);
        }
    }

    async function genURA() {
        const c = document.getElementById('uniRecAccContainer');
        if (!c) { log('⚠ uniRecAccContainer not found'); return; }

        if (!c.querySelector('input, button, select')) {
            if (window.LoadUniversityRecognitionAccreditationSection) {
                await window.LoadUniversityRecognitionAccreditationSection();
            } else {
                const url = c.getAttribute('data-load-url');
                if (url) { c.innerHTML = await (await fetch(url, { cache: 'no-store' })).text(); }
            }
            await delay(600);
        }

        const recInput = document.getElementById('ura_docs_local_recognition');
        if (recInput) {
            attachFile(recInput, pdf('local_recognition.pdf'));
            await delay(200);
            if (window.URAUploadSection) { await window.URAUploadSection('recognition'); await delay(800); }
        }

        const typeInput = document.getElementById('ura_docs_accreditation_type');
        if (typeInput) setVal(typeInput, bestOption(typeInput, 'Local'));

        const accInput = document.getElementById('ura_docs_accreditation');
        if (accInput) {
            attachFile(accInput, pdf('local_accreditation.pdf'));
            await delay(200);
            if (window.URAUploadSection) { await window.URAUploadSection('accreditation'); await delay(800); }
        }
    }

    async function genPictures() {
        const c = document.getElementById('picturesContainer');
        if (!c) { log('⚠ picturesContainer not found'); return; }

        if (!c.querySelector('.pic-upload-card')) {
            const url = c.getAttribute('data-load-url');
            if (url) { c.innerHTML = await (await fetch(url, { cache: 'no-store' })).text(); await delay(600); }
        }

        for (const cardId of PICTURE_CARDS) {
            const input = document.getElementById(`input_${cardId}`);
            if (!input) { log(`⚠ input_${cardId} not found`); continue; }
            attachFile(input, pdf(`${cardId}_photo.pdf`));
            await delay(200);
            if (window.PictureUploadCategory) { await window.PictureUploadCategory(cardId, `input_${cardId}`); await delay(700); }
        }
    }

    async function genSubmitFields() {
        setVal('subapp_name',      'Dr. Kamelia Qumsieh');
        setVal('subapp_workplace', 'Jordan International University');
        const ack = document.getElementById('subapp_ack');
        if (ack && !ack.checked) ack.click();
    }

    // ── Steps ─────────────────────────────────────────────────────────────────

    const STEPS = [
        { label: 'Public Info',                fn: genPublicInfo         },
        { label: 'Academic Info',              fn: genAcademicInfo       },
        { label: 'Rank Staff Excel Files',     fn: genRankExcels         },
        { label: 'Admission & Duration (PDFs)',fn: genAdmissionDuration  },
        { label: 'Colleges',                   fn: genColleges           },
        { label: 'Programs',                   fn: genPrograms           },
        { label: 'Medicine & Dentistry',       fn: genMedicineDentistry  },
        { label: 'Infrastructure',             fn: genInfrastructure     },
        { label: 'Laboratories',               fn: genLabs               },
        { label: 'Library',                    fn: genLibrary            },
        { label: 'Accreditation Bodies (PDFs)',fn: genAccreditationBodies},
        { label: 'Hospitals (PDFs)',           fn: genHospitals          },
        { label: 'University Rec. & Acc. Docs',fn: genURA                },
        { label: 'Pictures',                   fn: genPictures           },
        { label: 'Submit Fields',              fn: genSubmitFields       },
    ];

    // ── Clear ─────────────────────────────────────────────────────────────────

    async function clearTestRows() {
        const origConfirm = window.confirm;
        window.confirm = () => true;
        try {
            const sections = [
                { cId: 'faculties-container',          sel: '[data-fac-del]'             },
                { cId: 'programs-container',           sel: '[data-prg-del]'             },
                { cId: 'laboratoriesContainer',        sel: '[data-lab-action="delete"]' },
                { cId: 'accreditationBodiesContainer', sel: '[data-accb-del]'            },
            ];
            for (const { cId, sel } of sections) {
                const c = document.getElementById(cId);
                if (!c) continue;
                let rows;
                while ((rows = Array.from(c.querySelectorAll('[data-test-row="true"]'))).length) {
                    const btn = rows[0].querySelector(sel);
                    if (!btn) break;
                    const mut = waitMutation(c);
                    btn.click();
                    await mut;
                }
            }
            const hc = document.getElementById('hospitalsContainer');
            if (hc) {
                let rows;
                while ((rows = Array.from(hc.querySelectorAll('[data-test-row="true"]'))).length) {
                    const btn = rows[0].querySelector('button[onclick*="HospFacilityDelete"], .hosp-action-btn.danger');
                    if (!btn) { rows[0].removeAttribute('data-test-row'); continue; }
                    const mut = waitMutation(hc);
                    btn.click();
                    await mut;
                }
            }
        } finally { window.confirm = origConfirm; }
        log('✅ Test rows cleared');
    }

    // ── Logger ────────────────────────────────────────────────────────────────

    function log(msg) {
        console.log('[DevTool]', msg);
        const el = document.getElementById('_dt-log');
        if (!el) return;
        const line = document.createElement('div');
        line.textContent = msg;
        line.style.cssText = 'padding:1px 0;border-bottom:1px solid #1e293b;';
        el.prepend(line);
        while (el.children.length > 30) el.removeChild(el.lastChild);
    }

    function setProgress(current, total) {
        const bar = document.getElementById('_dt-bar-fill');
        const lbl = document.getElementById('_dt-progress-lbl');
        if (bar) bar.style.width = total > 0 ? `${Math.round((current / total) * 100)}%` : '0%';
        if (lbl) lbl.textContent = total > 0 ? `${current} / ${total}` : '';
    }

    // ── Main ──────────────────────────────────────────────────────────────────

    async function fillAll() {
        setProgress(0, STEPS.length);
        for (let i = 0; i < STEPS.length; i++) {
            const step = STEPS[i];
            log(`▶ [${i + 1}/${STEPS.length}] ${step.label}…`);
            setProgress(i, STEPS.length);
            try { await step.fn(); } catch (e) { log(`⚠ Error in ${step.label}: ${e.message}`); }
            if (i < STEPS.length - 1) await delay(300);
        }
        setProgress(STEPS.length, STEPS.length);
        log('✅ Done — all sections filled!');
    }

    // ── Panel ─────────────────────────────────────────────────────────────────

    function buildPanel() {
        const style = document.createElement('style');
        style.textContent = `
            #_dt-panel {
                position: fixed; bottom: 20px; right: 20px; z-index: 99999;
                background: #0f172a; color: #e2e8f0;
                border: 1px solid #1e293b; border-radius: 14px;
                padding: 14px 16px; width: 260px;
                box-shadow: 0 10px 40px rgba(0,0,0,.65);
                font-family: ui-monospace, 'Cascadia Code', monospace; font-size: 12px;
            }
            #_dt-panel ._dt-title {
                font-size: 11px; font-weight: 800; color: #f59e0b;
                letter-spacing: 1px; text-transform: uppercase;
                margin-bottom: 10px; display: flex; align-items: center;
                justify-content: space-between;
            }
            #_dt-fill {
                width: 100%; padding: 11px 0; border-radius: 9px; border: none;
                background: #16a34a; color: #fff; font-weight: 800; font-size: 13px;
                cursor: pointer; font-family: inherit; letter-spacing: .3px;
                transition: background .15s; margin-bottom: 8px;
            }
            #_dt-fill:hover:not(:disabled) { background: #15803d; }
            #_dt-fill:disabled { opacity: .45; cursor: not-allowed; }
            #_dt-clr {
                width: 100%; padding: 7px 0; border-radius: 7px; border: none;
                background: #1e293b; color: #94a3b8; font-weight: 600; font-size: 11px;
                cursor: pointer; font-family: inherit; transition: background .15s;
            }
            #_dt-clr:hover:not(:disabled) { background: #7f1d1d; color: #fca5a5; }
            #_dt-clr:disabled { opacity: .4; cursor: not-allowed; }
            #_dt-bar-track {
                height: 4px; background: #1e293b; border-radius: 99px;
                margin: 10px 0 2px; overflow: hidden;
            }
            #_dt-bar-fill {
                height: 100%; width: 0%; background: #16a34a;
                border-radius: 99px; transition: width .3s;
            }
            #_dt-progress-lbl {
                font-size: 10px; color: #475569; text-align: right;
                min-height: 12px; margin-bottom: 6px;
            }
            #_dt-log {
                max-height: 120px; overflow-y: auto;
                font-size: 10.5px; color: #64748b; line-height: 1.6;
                border-top: 1px solid #1e293b; padding-top: 6px; margin-top: 4px;
            }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = '_dt-panel';
        panel.innerHTML = `
            <div class="_dt-title">
                <span>⚙ DEV TOOL</span>
            </div>
            <button id="_dt-fill">▶ Fill Everything</button>
            <button id="_dt-clr">✕ Clear Test Rows</button>
            <div id="_dt-bar-track"><div id="_dt-bar-fill"></div></div>
            <div id="_dt-progress-lbl"></div>
            <div id="_dt-log"></div>
        `;
        document.body.appendChild(panel);

        const fillBtn = document.getElementById('_dt-fill');
        const clrBtn  = document.getElementById('_dt-clr');

        async function run(fn) {
            fillBtn.disabled = true;
            clrBtn.disabled  = true;
            try { await fn(); } finally {
                fillBtn.disabled = false;
                clrBtn.disabled  = false;
            }
        }

        fillBtn.addEventListener('click', () => run(fillAll));
        clrBtn .addEventListener('click', () => run(clearTestRows));

        log('Ready');
    }

    document.addEventListener('DOMContentLoaded', buildPanel);

})();
