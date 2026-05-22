/* ================================================================
   DEV TEST TOOL  —  REMOVE BEFORE FINAL DELIVERY
   ================================================================ */

(function () {
    'use strict';

    // ── Random helpers ────────────────────────────────────────────────────────
    const rand   = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick   = arr => arr[Math.floor(Math.random() * arr.length)];
    const randId = () => Math.random().toString(36).substring(2, 6).toUpperCase();

    // ── Random pools ──────────────────────────────────────────────────────────
    const UNIS = [
        'Jordan International University', 'Arabian Gulf University',
        'Al-Ahliyya Amman University',     'Middle East University',
        'Applied Science University',       'Petra University',
        'Philadelphia University',          'Zarqa University',
        'Jerash University',                'Irbid National University',
        'Al-Balqa Applied University',      'Hashemite University',
        'Al-Isra University',               'Al-Zaytoonah University',
        'Jadara University',                'Amman Arab University',
    ];

    const PRESIDENTS = [
        'Prof. Ahmad Al-Hassan',    'Prof. Mohammad Al-Rashid',
        'Prof. Khalid Al-Zubi',     'Prof. Sami Al-Tarawneh',
        'Prof. Nidal Al-Omari',     'Prof. Bassam Al-Khatib',
        'Prof. Imad Al-Dabbas',     'Prof. Walid Al-Masri',
        'Prof. Rana Al-Omoush',     'Prof. Feras Al-Shawabkeh',
        'Prof. Lina Al-Barakat',    'Prof. Omar Al-Nabulsi',
    ];

    const CITIES = ['Amman', 'Irbid', 'Zarqa', 'Aqaba', 'Salt', 'Karak', 'Ajloun', 'Mafraq'];

    const COLLEGE_POOLS = [
        { name: 'College of Engineering',          type: 'Scientific',  students: () => rand(800,  2500) },
        { name: 'College of Information Technology',type: 'Scientific', students: () => rand(600,  1800) },
        { name: 'College of Medicine',             type: 'Medical',     students: () => rand(400,  1200) },
        { name: 'College of Dentistry',            type: 'Medical',     students: () => rand(200,  700)  },
        { name: 'College of Pharmacy',             type: 'Medical',     students: () => rand(300,  900)  },
        { name: 'College of Humanities',           type: 'Humanities',  students: () => rand(500,  1500) },
        { name: 'College of Law',                  type: 'Humanities',  students: () => rand(300,  800)  },
        { name: 'College of Business',             type: 'Humanities',  students: () => rand(700,  2000) },
        { name: 'College of Science',              type: 'Scientific',  students: () => rand(500,  1400) },
        { name: 'College of Nursing',              type: 'Medical',     students: () => rand(200,  600)  },
    ];

    const PROGRAM_POOLS = [
        { program: 'Computer Science',         degree: 'Bachelor', years: '4', system: 'Credit Hours'     },
        { program: 'Software Engineering',     degree: 'Bachelor', years: '4', system: 'Credit Hours'     },
        { program: 'Civil Engineering',        degree: 'Bachelor', years: '5', system: 'Credit Hours'     },
        { program: 'Internal Medicine',        degree: 'Bachelor', years: '6', system: 'Semester Program' },
        { program: 'Dentistry',                degree: 'Bachelor', years: '5', system: 'Semester Program' },
        { program: 'Business Administration',  degree: 'Bachelor', years: '4', system: 'Credit Hours'     },
        { program: 'Data Science',             degree: 'Master',   years: '2', system: 'Credit Hours'     },
        { program: 'MBA',                      degree: 'Master',   years: '2', system: 'Credit Hours'     },
        { program: 'Cybersecurity',            degree: 'Higher Diploma', years: '1', system: 'Yearly Program' },
        { program: 'Nursing',                  degree: 'Bachelor', years: '4', system: 'Semester Program' },
        { program: 'Law',                      degree: 'Bachelor', years: '4', system: 'Credit Hours'     },
        { program: 'Electrical Engineering',   degree: 'Bachelor', years: '4', system: 'Credit Hours'     },
        { program: 'Pharmacy',                 degree: 'Bachelor', years: '5', system: 'Semester Program' },
        { program: 'Artificial Intelligence',  degree: 'Master',   years: '2', system: 'Credit Hours'     },
    ];

    const HOSPITAL_POOLS = [
        { spec: 'Medicine',  name: 'King Hussein Medical Center',      beds: () => rand(200, 500), dental: null              },
        { spec: 'Medicine',  name: 'Jordan University Hospital',       beds: () => rand(150, 400), dental: null              },
        { spec: 'Medicine',  name: 'Princess Basma Teaching Hospital', beds: () => rand(120, 350), dental: null              },
        { spec: 'Dentistry', name: 'Royal Medical Services - Dental',  beds: null,                 dental: () => rand(50,120)},
        { spec: 'Dentistry', name: 'Jordan Dental Center',             beds: null,                 dental: () => rand(40,100)},
    ];

    const ACCB_POOLS = [
        { name: 'ABET – Accreditation Board for Engineering and Technology', type: 'International' },
        { name: 'WASC Senior College and University Commission',             type: 'International' },
        { name: 'National Accreditation Commission',                         type: 'Local'         },
        { name: 'Association to Advance Collegiate Schools of Business',     type: 'International' },
        { name: 'Accreditation Council for Pharmacy Education',              type: 'International' },
        { name: 'Higher Education Accreditation Commission – Jordan',        type: 'Local'         },
    ];

    const PICTURE_CARDS = ['library', 'hospital', 'faculties', 'laboratories', 'facilities'];

    const DUMMY_PDF =
        '%PDF-1.4\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n' +
        '2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj\n' +
        '3 0 obj<</Type /Page /MediaBox [0 0 3 3]>>endobj\n' +
        'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
        '0000000058 00000 n \n0000000115 00000 n \n' +
        'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF\n';

    // ── Pick random data for this run ─────────────────────────────────────────
    // (frozen once per page load so a single run is internally consistent)
    const RUN = (() => {
        const uniName  = pick(UNIS);
        const city     = pick(CITIES);
        const slug     = uniName.replace(/\s+/g, '').toLowerCase().substring(0, 10);
        const id       = randId();
        const year     = rand(1975, 2005);
        const colleges = shuffle(COLLEGE_POOLS).slice(0, rand(3, 5));
        const programs = shuffle(PROGRAM_POOLS).slice(0, rand(4, 7));
        const hospitals= shuffle(HOSPITAL_POOLS).slice(0, rand(1, 3));
        const accbs    = shuffle(ACCB_POOLS).slice(0, rand(1, 3));

        return {
            uniName, city, id, year, colleges, programs, hospitals, accbs,
            president:       pick(PRESIDENTS),
            address:         `${rand(1,999)} University St, ${city} ${rand(10000,99999)}, Jordan`,
            phone:           `+962-${rand(2,9)}-${rand(1000000,9999999)}`,
            email:           `admin@${slug}${id.toLowerCase()}.edu.jo`,
            website:         `https://www.${slug}${id.toLowerCase()}.edu.jo`,
            localStudents:   rand(1500, 8000),
            foreignStudents: rand(100,  1200),
            jordanStudents:  rand(1000, 6000),
            areaKm2:         (rand(30, 200) / 100).toFixed(2),
            campuses:        rand(1, 5),
            classrooms:      rand(50, 250),
            libraries:       rand(1, 6),
            stadiums:        rand(1, 4),
            libArea:         rand(500, 3000),
            libCapacity:     rand(200, 1500),
            libBooks:        rand(5000, 60000),
            libPaperJournals:rand(100, 800),
            libEbooks:       rand(1000, 15000),
            libEjournals:    rand(300, 3000),
            staff: randomStaff(),
        };
    })();

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function randomStaff() {
        // Values chosen so doctorate holders ≥ 50%, senior rank ≥ 10% of total,
        // and student capacity (≈182) always exceeds the safe TotalStudentPopulation (150).
        return {
            StaffProfessorFullTimeCount:              String(rand(40, 60)),
            StaffProfessorPartTimeCount:              String(rand(5,  12)),
            StaffAssociateProfessorFullTimeCount:     String(rand(30, 50)),
            StaffAssociateProfessorPartTimeCount:     String(rand(6,  14)),
            StaffAssistantProfessorFullTimeCount:     String(rand(40, 60)),
            StaffAssistantProfessorPartTimeCount:     String(rand(8,  18)),
            StaffTeacherFullTimeCount:                String(rand(20, 40)),
            StaffTeacherPartTimeCount:                String(rand(6,  16)),
            StaffAssistantTeacherFullTimeCount:       String(rand(15, 25)),
            StaffAssistantTeacherPartTimeCount:       String(rand(5,  12)),
            StaffResearcherFullTimeCount:             String(rand(5,  15)),
            StaffResearcherPartTimeCount:             String(rand(2,  8)),
            StaffOthersFullTimeCount:                 String(rand(8,  16)),
            StaffOthersPartTimeCount:                 String(rand(2,  7)),
            StaffPractitionerMscFullTimeCount:        String(rand(5,  12)),
            StaffPractitionerMscPartTimeCount:        String(rand(2,  7)),
            StaffPractitionerPscFullTimeCount:        String(rand(4,  10)),
            StaffPractitionerPscPartTimeCount:        String(rand(2,  6)),
        };
    }

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
            const t  = setTimeout(() => { ob.disconnect(); resolve(); }, ms);
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

        setByName(sec, 'InstitutionName',        RUN.uniName);
        setByName(sec, 'FoundationDate',         `${RUN.year}-09-01`);
        setByName(sec, 'DateOfEstablishment',    `${RUN.year}-09-01`);
        setByName(sec, 'StartOfTeaching',        `${RUN.year + 1}-09-01`);
        setByName(sec, 'PresidentName',          RUN.president);
        setByName(sec, 'MailingFullAddress',     RUN.address);
        setByName(sec, 'DirectPhoneNumber',      RUN.phone);
        setByName(sec, 'EmailAddress',           RUN.email);
        setByName(sec, 'InstitutionalWebAddress',RUN.website);

        const modeEl = sec.querySelector('[name="ModeOfStudy"]');
        if (modeEl) setVal(modeEl, pick(['On-campus', 'Online', 'Hybrid']));
        const langEl = sec.querySelector('[name="LanguageOfInstruction"]');
        if (langEl) setVal(langEl, bestOption(langEl, pick(['English', 'Arabic'])));
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
        if (typeEl) setVal(typeEl, pick(['Private', 'Public', 'Semi-Government']));

        ['DegreeBSC', 'DegreeHigherDiploma', 'DegreeMaster'].forEach(n => {
            const cb = sec.querySelector(`[name="${n}"]`);
            if (cb && !cb.checked) cb.click();
        });

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

        // Use student counts that fit within the staff capacity so all ratios pass
        const safeTotal = 150;
        setByName(sec, 'LocalStudentPopulation',     String(Math.min(RUN.localStudents,   safeTotal - 10)));
        setByName(sec, 'ForeignStudentPopulation',   String(10));
        setByName(sec, 'JordanianStudentPopulation', String(Math.min(RUN.jordanStudents,  safeTotal - 10)));
        setByName(sec, 'TotalStudentPopulation',     String(safeTotal));
        setByName(sec, 'StudentsToFacultyRatio',     '15');
        setByName(sec, 'DoctorateHoldersPercentage', '80');

        for (const [n, v] of Object.entries(RUN.staff)) setByName(sec, n, v);

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
            'AdmissionStudy.DiplomaDuration':       `${rand(1,3)} year${rand(1,3)>1?'s':''}`,
            'AdmissionStudy.BScDuration':           `${rand(3,5)} years`,
            'AdmissionStudy.HigherDiplomaDuration': `${rand(1,2)} year${rand(1,2)>1?'s':''}`,
            'AdmissionStudy.MasterDuration':        `${rand(1,3)} years`,
            'AdmissionStudy.PhDDuration':           `${rand(3,5)} years`,
        };
        for (const [n, v] of Object.entries(durations)) {
            const el = sec.querySelector(`[name="${n}"]`);
            if (el) setVal(el, v);
        }

        ['Diploma', 'BSc', 'HigherDiploma', 'Master', 'PhD'].forEach(type => {
            const input = sec.querySelector(`[name="AdmissionStudy.${type}SamplePdf"]`);
            if (input) attachFile(input, pdf(`sample_${type}_${RUN.id}.pdf`));
        });

        await delay(200);
        document.getElementById('btnSaveAdmissionRequirement')?.click();
        await delay(800);
    }

    async function genColleges() {
        const c = document.getElementById('faculties-container');
        if (!c) { log('⚠ faculties-container not found'); return; }

        for (const row of RUN.colleges) {
            setVal('fac_name',          row.name);
            setVal('fac_type',          bestOption('fac_type', row.type));
            setVal('fac_studentsCount', String(row.students()));

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

        // Random accreditation/graduation years per program
        for (const row of RUN.programs) {
            const accYear  = rand(2010, 2022);
            const gradYear = rand(2022, 2025);
            setVal('prg_faculty',  firstOption('prg_faculty'));
            setVal('prg_program',  row.program);
            setVal('prg_degree',   bestOption('prg_degree', row.degree));
            setVal('prg_years',    row.years);
            setVal('prg_system',   bestOption('prg_system', row.system));
            setVal('prg_acc',      `${accYear}-${String(rand(1,12)).padStart(2,'0')}-${String(rand(1,28)).padStart(2,'0')}`);
            setVal('prg_gradlast', `${gradYear}-06-${String(rand(1,30)).padStart(2,'0')}`);

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

        const medStud = rand(400, 1200); const denStud = rand(150, 600);
        const fields = {
            med_totalStudents:                      String(medStud),
            den_totalStudents:                      String(denStud),
            med_fullTimeProfessor:                  String(rand(5,  15)),
            med_partTimeClinicalProfessor:           String(rand(2,  8)),
            med_fullTimeAssociateProfessor:          String(rand(8,  18)),
            med_partTimeClinicalAssociateProfessor:  String(rand(3,  10)),
            med_fullTimeAssistantProfessor:          String(rand(10, 22)),
            med_partTimeClinicalAssistantProfessor:  String(rand(4,  12)),
            med_fullTimeLecturerPhd:                 String(rand(4,  12)),
            med_partTimeClinicalLecturerPhd:         String(rand(1,  6)),
            med_fullTimeLecturerMsc:                 String(rand(3,  9)),
            med_fullTimeAssistantLecturerPhd:        String(rand(2,  8)),
            med_fullTimeAssistantLecturerMsc:        String(rand(1,  5)),
            den_fullTimeProfessor:                   String(rand(3,  10)),
            den_partTimeClinicalProfessor:            String(rand(1,  5)),
            den_fullTimeAssociateProfessor:           String(rand(4,  12)),
            den_partTimeClinicalAssociateProfessor:   String(rand(2,  7)),
            den_fullTimeAssistantProfessor:           String(rand(5,  14)),
            den_partTimeClinicalAssistantProfessor:   String(rand(2,  8)),
            den_fullTimeLecturerPhd:                  String(rand(2,  7)),
            den_partTimeClinicalLecturerPhd:          String(rand(1,  4)),
            den_fullTimeLecturerMsc:                  String(rand(1,  5)),
            den_fullTimeAssistantLecturerPhd:         String(rand(1,  4)),
            den_fullTimeAssistantLecturerMsc:         String(rand(1,  3)),
        };
        for (const [id, v] of Object.entries(fields)) setVal(id, v);

        await delay(300);
        if (window.MedDenSave) { await window.MedDenSave(); await delay(400); }
        else log('⚠ MedDenSave not found — values set but not saved');
    }

    async function genInfrastructure() {
        const c = document.getElementById('infrastructureContainer');
        if (!c) { log('⚠ infrastructureContainer not found'); return; }

        setVal('infra_areaKm2',         RUN.areaKm2);
        setVal('infra_campusesCount',   String(RUN.campuses));
        setVal('infra_classroomsCount', String(RUN.classrooms));
        setVal('infra_librariesCount',  String(RUN.libraries));
        setVal('infra_stadiumsCount',   String(RUN.stadiums));

        await delay(200);
        document.getElementById('btnSaveInfrastructure')?.click();
        await delay(500);
    }

    async function genLabs() {
        const c = document.getElementById('laboratoriesContainer');
        if (!c) { log('⚠ laboratoriesContainer not found'); return; }

        const rows = [
            { computers: rand(20, 80), labs: rand(5, 20) },
            { computers: rand(20, 80), labs: rand(5, 20) },
        ];
        for (const row of rows) {
            setVal('lab_facultyId',    firstOption('lab_facultyId'));
            setVal('lab_computers',    String(row.computers));
            setVal('lab_laboratories', String(row.labs));

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

        setVal('lib_area',               String(RUN.libArea));
        setVal('lib_capacity',           String(RUN.libCapacity));
        setVal('lib_numberOfBooks',      String(RUN.libBooks));
        setVal('lib_paperJournals',      String(RUN.libPaperJournals));
        setVal('lib_electronicBooks',    String(RUN.libEbooks));
        setVal('lib_electronicJournals', String(RUN.libEjournals));

        await delay(200);
        if (window.LibrarySave) { await window.LibrarySave(); }
        else { c.querySelector('button.btn-primary')?.click(); }
        await delay(400);
    }

    async function genAccreditationBodies() {
        const c = document.getElementById('accreditationBodiesContainer');
        if (!c) { log('⚠ accreditationBodiesContainer not found'); return; }

        for (const row of RUN.accbs) {
            setVal('accb_bodyName', row.name);
            setVal('accb_type',     bestOption('accb_type', row.type));
            attachFile(document.getElementById('accb_pdf'), pdf(`accreditation_${RUN.id}.pdf`));

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

        for (const fac of RUN.hospitals) {
            const specEl = document.getElementById('hosp_fac_specialization');
            if (specEl) {
                setVal(specEl, fac.spec);
                specEl.dispatchEvent(new Event('change', { bubbles: true }));
                if (window.HospFacilityToggleCapacity) window.HospFacilityToggleCapacity();
            }
            await delay(150);

            setVal('hosp_fac_name', fac.name);

            if (fac.beds)   setVal('hosp_fac_beds',   String(fac.beds()));
            if (fac.dental) setVal('hosp_fac_dental',  String(fac.dental()));

            attachFile(document.getElementById('hosp_fac_agreement_files'), pdf(`hospital_agreement_${RUN.id}.pdf`));

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
        const c = document.getElementById('uniRecAccContainer')
               || document.querySelector('[data-partial-url*="MedicineDentistry"]');
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
            attachFile(recInput, pdf(`local_recognition_${RUN.id}.pdf`));
            await delay(200);
            if (window.URAUploadSection) { await window.URAUploadSection('recognition'); await delay(800); }
        }

        const typeInput = document.getElementById('ura_docs_accreditation_type');
        if (typeInput) setVal(typeInput, bestOption(typeInput, pick(['Local', 'International'])));

        const accInput = document.getElementById('ura_docs_accreditation');
        if (accInput) {
            attachFile(accInput, pdf(`local_accreditation_${RUN.id}.pdf`));
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
            attachFile(input, pdf(`${cardId}_${RUN.id}.pdf`));
            await delay(200);
            if (window.PictureUploadCategory) { await window.PictureUploadCategory(cardId, `input_${cardId}`); await delay(700); }
        }
    }

    async function genSubmitFields() {
        setVal('subapp_name',      pick(PRESIDENTS).replace('Prof.', 'Dr.'));
        setVal('subapp_workplace', RUN.uniName);
        const ack = document.getElementById('subapp_ack');
        if (ack && !ack.checked) ack.click();
    }

    // ── Steps ─────────────────────────────────────────────────────────────────

    const STEPS = [
        { label: 'Public Info',                 fn: genPublicInfo          },
        { label: 'Academic Info',               fn: genAcademicInfo        },
        { label: 'Rank Staff Excel Files',      fn: genRankExcels          },
        { label: 'Admission & Duration (PDFs)', fn: genAdmissionDuration   },
        { label: 'Colleges',                    fn: genColleges            },
        { label: 'Programs',                    fn: genPrograms            },
        { label: 'Medicine & Dentistry',        fn: genMedicineDentistry   },
        { label: 'Infrastructure',              fn: genInfrastructure      },
        { label: 'Laboratories',                fn: genLabs                },
        { label: 'Library',                     fn: genLibrary             },
        { label: 'Accreditation Bodies (PDFs)', fn: genAccreditationBodies },
        { label: 'Hospitals (PDFs)',            fn: genHospitals           },
        { label: 'University Rec. & Acc. Docs', fn: genURA                 },
        { label: 'Pictures',                    fn: genPictures            },
        { label: 'Submit Fields',               fn: genSubmitFields        },
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
        log(`✅ Done — ${RUN.uniName} (${RUN.id})`);
    }

    // ── Panel ─────────────────────────────────────────────────────────────────

    function buildPanel() {
        const style = document.createElement('style');
        style.textContent = `
            #_dt-panel {
                position: fixed; bottom: 20px; right: 20px; z-index: 99999;
                background: #0f172a; color: #e2e8f0;
                border: 1px solid #1e293b; border-radius: 14px;
                padding: 14px 16px; width: 270px;
                box-shadow: 0 10px 40px rgba(0,0,0,.65);
                font-family: ui-monospace, 'Cascadia Code', monospace; font-size: 12px;
            }
            #_dt-panel ._dt-title {
                font-size: 11px; font-weight: 800; color: #f59e0b;
                letter-spacing: 1px; text-transform: uppercase;
                margin-bottom: 4px; display: flex; align-items: center;
                justify-content: space-between;
            }
            #_dt-uni-label {
                font-size: 10px; color: #64748b; margin-bottom: 10px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
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
                <span style="color:#475569;font-size:9px;">#${RUN.id}</span>
            </div>
            <div id="_dt-uni-label">📍 ${RUN.uniName}</div>
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

        log(`Ready — ${RUN.uniName}`);
    }

    document.addEventListener('DOMContentLoaded', buildPanel);

})();
