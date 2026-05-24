/* ================================================================
   DEV TEST TOOL  —  REMOVE BEFORE FINAL DELIVERY
   Fills Cairo University data section by section for testing.
   ================================================================ */
(function () {
    'use strict';

    // ── Cairo University data ──────────────────────────────────────────────────
    const CAIRO = {
        // Public Info
        InstitutionName:           'Cairo University',
        PresidentName:             'Prof. Mohamed Samy Abdel-Sadak',
        MailingFullAddress:        'Cairo University, Giza, Egypt, 12613',
        DirectPhoneNumber:         '+20235676620',
        EmailAddress:              'info@cu.edu.eg',
        InstitutionalWebAddress:   'https://cu.edu.eg',
        FoundationDate:            '1908-12-21',
        DateOfEstablishment:       '1952-01-01',
        OversightRightsEntity:     'Public',
        ModeOfStudy:               'Full-time',
        LanguageOfInstruction:     'Arabic',
        StartOfTeaching:           '1909-01-01',

        // Academic Info
        TypeOfAcademicInstitution:  'University',
        DegreeBSC:                  true,
        DegreeMaster:               true,
        DegreePhD:                  true,
        DegreeDiploma:              false,
        DegreeHigherDiploma:        false,
        OfficialAccreditation:      'Accredited',
        LocalStudentPopulation:     201000,
        ForeignStudentPopulation:   6853,
        JordanianStudentPopulation: 120,
        TotalStudentPopulation:     207853,
        SystemSemesterProgram:      true,
        SystemCreditHours:          true,

        StaffProfessorFullTime:           3200, StaffProfessorPartTime:           400,
        StaffAssociateProfessorFullTime:  2800, StaffAssociateProfessorPartTime:  350,
        StaffAssistantProfessorFullTime:  4100, StaffAssistantProfessorPartTime:  600,
        StaffTeacherFullTime:             2100, StaffTeacherPartTime:             300,
        StaffAssistantTeacherFullTime:     900, StaffAssistantTeacherPartTime:    168,
        StaffOthersFullTime:               400, StaffOthersPartTime:              100,
        StaffResearcherFullTime:           300, StaffResearcherPartTime:           50,
        StaffPractitionerMscFullTime:      200, StaffPractitionerMscPartTime:     100,
        StaffPractitionerPscFullTime:      150, StaffPractitionerPscPartTime:      80,

        // Study Duration
        BScDuration:          '4', MasterDuration: '2', PhDDuration: '3',
        HigherDiplomaDuration:'1', DiplomaDuration:'2',

        // Infrastructure
        AreaKm2:           '6.7',
        CampusesCount:     '5',
        ClassroomsCount:   '1200',
        LibrariesCount:    '23',
        StadiumsCount:     '4',

        // Library
        LibArea:              '14000',
        LibCapacity:          '3500',
        LibBooks:             '850000',
        LibPaperJournals:     '12000',
        LibElectronicBooks:   '320000',
        LibElectronicJournals:'45000',

        // Colleges
        Colleges: [
            { name: 'Faculty of Engineering',                           type: 'Scientific',  students: 18000 },
            { name: 'Faculty of Medicine (Kasr Alaini)',                type: 'Medical',     students: 7000  },
            { name: 'Faculty of Computers and Artificial Intelligence', type: 'Scientific',  students: 5000  },
            { name: 'Faculty of Pharmacy',                              type: 'Scientific',  students: 4000  },
            { name: 'Faculty of Science',                               type: 'Scientific',  students: 16000 },
            { name: 'Faculty of Economics and Political Science',       type: 'Humanities',  students: 12000 },
            { name: 'Faculty of Law',                                   type: 'Humanities',  students: 25000 },
            { name: 'Faculty of Commerce',                              type: 'Humanities',  students: 30000 },
            { name: 'Faculty of Nursing',                               type: 'Medical',     students: 3000  },
            { name: 'Faculty of Oral and Dental Medicine',              type: 'Medical',     students: 2000  },
        ],

        // Programs
        Programs: [
            { faculty: 'Faculty of Engineering',                           program: 'Civil Engineering',        degree: 'Bachelor', years: 5, system: 'Credit Hours', acc: '2000-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Engineering',                           program: 'Electrical Engineering',   degree: 'Bachelor', years: 5, system: 'Credit Hours', acc: '2000-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Medicine (Kasr Alaini)',                program: 'Medicine and Surgery',     degree: 'Bachelor', years: 7, system: 'Yearly',        acc: '1995-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Computers and Artificial Intelligence', program: 'Computer Science',         degree: 'Bachelor', years: 4, system: 'Credit Hours', acc: '2010-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Computers and Artificial Intelligence', program: 'Artificial Intelligence',  degree: 'Bachelor', years: 4, system: 'Credit Hours', acc: '2015-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Pharmacy',                              program: 'Pharmacy',                  degree: 'Bachelor', years: 5, system: 'Semester',     acc: '2000-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Science',                               program: 'Mathematics',               degree: 'Bachelor', years: 4, system: 'Semester',     acc: '1999-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Science',                               program: 'Physics',                   degree: 'Bachelor', years: 4, system: 'Semester',     acc: '1999-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Economics and Political Science',       program: 'Economics',                 degree: 'Bachelor', years: 4, system: 'Semester',     acc: '1998-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Law',                                   program: 'Law',                       degree: 'Bachelor', years: 4, system: 'Yearly',        acc: '1998-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Commerce',                              program: 'Business Administration',   degree: 'Bachelor', years: 4, system: 'Semester',     acc: '1998-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Nursing',                               program: 'Nursing',                   degree: 'Bachelor', years: 4, system: 'Semester',     acc: '2005-01-01', gradlast: '2022-06-01' },
            { faculty: 'Faculty of Oral and Dental Medicine',              program: 'Dentistry',                 degree: 'Bachelor', years: 5, system: 'Semester',     acc: '2002-01-01', gradlast: '2022-06-01' },
        ],

        // Medicine Dentistry
        MedicineDentistry: {
            med_totalStudents:                       7200,
            med_fullTimeProfessor:                    245,  med_partTimeClinicalProfessor:              80,
            med_fullTimeAssociateProfessor:           312,  med_partTimeClinicalAssociateProfessor:     65,
            med_fullTimeAssistantProfessor:           486,  med_partTimeClinicalAssistantProfessor:    100,
            med_fullTimeLecturerPhd:                  380,  med_partTimeClinicalLecturerPhd:             70,
            med_fullTimeAssistantLecturerPhd:         210,  med_partTimeClinicalAssistantLecturerPhd:   45,
            med_fullTimeLecturerMsc:                  180,
            med_fullTimeAssistantLecturerMsc:         290,
            med_fullTimePractitionerPsc:              120,
            med_fullTimePractitionerMsc:               95,
            den_totalStudents:                       2100,
            den_fullTimeProfessor:                     42,  den_partTimeClinicalProfessor:              15,
            den_fullTimeAssociateProfessor:            58,  den_partTimeClinicalAssociateProfessor:     20,
            den_fullTimeAssistantProfessor:            89,  den_partTimeClinicalAssistantProfessor:     25,
            den_fullTimeLecturerPhd:                   67,  den_partTimeClinicalLecturerPhd:             12,
            den_fullTimeAssistantLecturerPhd:          45,  den_partTimeClinicalAssistantLecturerPhd:    8,
            den_fullTimeLecturerMsc:                   34,
            den_fullTimeAssistantLecturerMsc:          52,
            den_fullTimePractitionerPsc:               28,
            den_fullTimePractitionerMsc:               19,
        },

        // Laboratories
        Laboratories: [
            { category: 'Scientific',  computers: 680, labs: 95 },
            { category: 'Medical',     computers: 180, labs: 45 },
            { category: 'Humanities',  computers: 145, labs:  8 },
            { category: 'Applied',     computers:  90, labs: 12 },
        ],

        // Hospitals
        Hospitals: [
            { name: 'Kasr Al-Ainy Hospital',                        spec: 'Medicine',   beds: 1200, dental: 0   },
            { name: 'New Kasr Al-Ainy Teaching Hospital',           spec: 'Medicine',   beds: 800,  dental: 0   },
            { name: 'Cairo University Children\'s Hospital',        spec: 'Medicine',   beds: 300,  dental: 0   },
            { name: 'Cairo University Gynecology Hospital',         spec: 'Medicine',   beds: 450,  dental: 0   },
            { name: 'National Cancer Institute (NCI) – Cairo Uni',  spec: 'Medicine',   beds: 400,  dental: 0   },
            { name: 'Faculty of Oral and Dental Medicine Hospital', spec: 'Dentistry',  beds: 0,    dental: 250 },
        ],

        // Accreditation Bodies
        AccreditationBodies: [
            { name: 'National Authority for Quality Assurance and Accreditation of Education (NAQAAE)', type: 'National' },
            { name: 'Arab Network for Quality Assurance in Higher Education (ANQAHE)',                  type: 'Regional' },
        ],

        // Submit Application
        ApplicantName: 'Prof. Mohamed Samy Abdel-Sadak',
        WorkPlace:     'Office of the President, Cairo University',
    };

    // ── File helpers ───────────────────────────────────────────────────────────
    function makePDF(name) {
        const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n% Demo: ${name}`;
        return new File([content], name, { type: 'application/pdf' });
    }

    function makeXLSX(name) {
        const bytes = new Uint8Array([0x50,0x4B,0x03,0x04,0x14,0x00,0x00,0x00]);
        return new File([bytes], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }

    function attachFile(selector, file) {
        const input = typeof selector === 'string'
            ? document.querySelector(selector) : selector;
        if (!input) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // ── Form helpers ───────────────────────────────────────────────────────────
    function set(name, value) {
        const el = document.querySelector(`[name="${name}"]`);
        if (!el) return;
        if (el.type === 'checkbox') { el.checked = !!value; }
        else { el.value = value ?? ''; }
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function setId(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value ?? '';
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function selectOption(name, value) {
        const el = document.querySelector(`select[name="${name}"]`);
        if (!el) return;
        const opt = Array.from(el.options).find(o =>
            o.value.toLowerCase() === String(value).toLowerCase() ||
            o.text.toLowerCase().includes(String(value).toLowerCase())
        );
        if (opt) { el.value = opt.value; }
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function clickBtn(selector) {
        const el = document.querySelector(selector);
        if (el) setTimeout(() => el.click(), 200);
    }

    function scrollTo(id) {
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ── Steps ──────────────────────────────────────────────────────────────────
    const STEPS = [

        // ── 1. Public Info ────────────────────────────────────────────────────
        {
            label: '1 / 14 — Public Info',
            fill() {
                set('InstitutionName',         CAIRO.InstitutionName);
                set('PresidentName',           CAIRO.PresidentName);
                set('MailingFullAddress',      CAIRO.MailingFullAddress);
                set('DirectPhoneNumber',       CAIRO.DirectPhoneNumber);
                set('EmailAddress',            CAIRO.EmailAddress);
                set('InstitutionalWebAddress', CAIRO.InstitutionalWebAddress);
                set('FoundationDate',          CAIRO.FoundationDate);
                set('DateOfEstablishment',     CAIRO.DateOfEstablishment);
                set('StartOfTeaching',         CAIRO.StartOfTeaching);
                selectOption('OversightRightsEntity', CAIRO.OversightRightsEntity);
                selectOption('ModeOfStudy',           CAIRO.ModeOfStudy);
                selectOption('LanguageOfInstruction', CAIRO.LanguageOfInstruction);
                scrollTo('#sec-general');
            }
        },

        // ── 2. Academic Info + Staff Excel files ──────────────────────────────
        {
            label: '2 / 14 — Academic Info + Staff files',
            fill() {
                selectOption('TypeOfAcademicInstitution', CAIRO.TypeOfAcademicInstitution);
                set('DegreeDiploma',       CAIRO.DegreeDiploma);
                set('DegreeBSC',           CAIRO.DegreeBSC);
                set('DegreeHigherDiploma', CAIRO.DegreeHigherDiploma);
                set('DegreeMaster',        CAIRO.DegreeMaster);
                set('DegreePhD',           CAIRO.DegreePhD);
                selectOption('OfficialAccreditationQualityInHomeCountry', CAIRO.OfficialAccreditation);
                set('LocalStudentPopulation',      CAIRO.LocalStudentPopulation);
                set('ForeignStudentPopulation',    CAIRO.ForeignStudentPopulation);
                set('JordanianStudentPopulation',  CAIRO.JordanianStudentPopulation);
                set('TotalStudentPopulation',      CAIRO.TotalStudentPopulation);
                set('SystemSemesterProgram',       CAIRO.SystemSemesterProgram);
                set('SystemCreditHours',           CAIRO.SystemCreditHours);

                set('StaffProfessorFullTimeCount',           CAIRO.StaffProfessorFullTime);
                set('StaffProfessorPartTimeCount',           CAIRO.StaffProfessorPartTime);
                set('StaffAssociateProfessorFullTimeCount',  CAIRO.StaffAssociateProfessorFullTime);
                set('StaffAssociateProfessorPartTimeCount',  CAIRO.StaffAssociateProfessorPartTime);
                set('StaffAssistantProfessorFullTimeCount',  CAIRO.StaffAssistantProfessorFullTime);
                set('StaffAssistantProfessorPartTimeCount',  CAIRO.StaffAssistantProfessorPartTime);
                set('StaffTeacherFullTimeCount',             CAIRO.StaffTeacherFullTime);
                set('StaffTeacherPartTimeCount',             CAIRO.StaffTeacherPartTime);
                set('StaffAssistantTeacherFullTimeCount',    CAIRO.StaffAssistantTeacherFullTime);
                set('StaffAssistantTeacherPartTimeCount',    CAIRO.StaffAssistantTeacherPartTime);
                set('StaffOthersFullTimeCount',              CAIRO.StaffOthersFullTime);
                set('StaffOthersPartTimeCount',              CAIRO.StaffOthersPartTime);
                set('StaffResearcherFullTimeCount',          CAIRO.StaffResearcherFullTime);
                set('StaffResearcherPartTimeCount',          CAIRO.StaffResearcherPartTime);
                set('StaffPractitionerMscFullTimeCount',     CAIRO.StaffPractitionerMscFullTime);
                set('StaffPractitionerMscPartTimeCount',     CAIRO.StaffPractitionerMscPartTime);
                set('StaffPractitionerPscFullTimeCount',     CAIRO.StaffPractitionerPscFullTime);
                set('StaffPractitionerPscPartTimeCount',     CAIRO.StaffPractitionerPscPartTime);

                const rankLabels = {
                    'Professor':           'Professor',
                    'AssociateProfessor':  'Associate_Professor',
                    'AssistantProfessor':  'Assistant_Professor',
                    'Teacher':             'Lecturer_(PhD_Holders)',
                    'AssistantTeacher':    'Lecturer_(MSc_Holders)',
                    'Others':             'Assistant_Lecturer_(MSc_Holders)',
                    'Researcher':          'Assistant_Lecturer_(BSc_Holders)',
                    'PractitionerMsc':     'Practitioner_(MSc_Holders)',
                    'PractitionerPsc':     'Practitioner_(BSc_Holders)',
                };
                ['fulltime', 'parttime'].forEach(type => {
                    Object.entries(rankLabels).forEach(([rankKey, label]) => {
                        const input = document.querySelector(
                            `input.rank-staff-upload[data-rank-key="${rankKey}"][data-employment-type="${type}"]`
                        );
                        const typeName = type === 'fulltime' ? 'Full_Time' : 'Part_Time';
                        if (input) attachFile(input, makeXLSX(`Cairo_${label}_${typeName}.xlsx`));
                    });
                });

                ['Scientific', 'Humanities', 'Medical', 'Applied'].forEach(cat => {
                    const cb = document.querySelector(`input[data-group="college-categories"][value="${cat}"]`);
                    if (cb && !cb.checked) {
                        cb.checked = true;
                        cb.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });

                scrollTo('#sec-academic');
                // Save so CollegeCategoriesCsv reaches session before Laboratories step runs
                setTimeout(() => clickBtn('#btnSaveAcademic'), 500);
            }
        },

        // ── 3. Colleges ───────────────────────────────────────────────────────
        {
            label: '3 / 14 — Colleges',
            async fill() {
                scrollTo('#sec-faculties');
                for (const col of CAIRO.Colleges) {
                    try {
                        const res = await fetch('/Home/FacultiesAdd', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                facultyName:   col.name,
                                collegeType:   col.type,
                                studentsCount: String(col.students),
                            }).toString()
                        });
                        const html = await res.text();
                        const c = document.getElementById('faculties-container');
                        if (c) c.innerHTML = html;
                        await delay(250);
                    } catch (e) { console.warn('College add failed:', col.name, e); }
                }
            }
        },

        // ── 4. Programs ───────────────────────────────────────────────────────
        {
            label: '4 / 14 — Programs',
            async fill() {
                scrollTo('#sec-programs');
                const container = document.getElementById('programs-container');
                if (container) {
                    const r = await fetch('/Home/ProgramsPartial');
                    container.innerHTML = await r.text();
                    await delay(300);
                }

                const buildMap = () => {
                    const map = {};
                    const sel = document.getElementById('prg_faculty');
                    if (sel) Array.from(sel.options).forEach(o => { if (o.value) map[o.text.trim()] = o.value; });
                    return map;
                };
                let facultyMap = buildMap();
                const addUrl = document.getElementById('programs-container')?.getAttribute('data-add-url') || '/Home/ProgramsAdd';

                for (const prog of CAIRO.Programs) {
                    const facultyId = facultyMap[prog.faculty];
                    if (!facultyId) { console.warn('Faculty not found:', prog.faculty); continue; }
                    try {
                        const res = await fetch(addUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                program:                      prog.program,
                                facultyId:                    facultyId,
                                degreeAwarded:                prog.degree,
                                numberOfYears:                String(prog.years),
                                educationalSystem:            prog.system,
                                accreditationDate:            prog.acc,
                                graduationDateOfLastRegiment: prog.gradlast,
                            }).toString()
                        });
                        const html = await res.text();
                        const c = document.getElementById('programs-container');
                        if (c) { c.innerHTML = html; facultyMap = buildMap(); }
                        await delay(250);
                    } catch (e) { console.warn('Program add failed:', prog.program, e); }
                }
            }
        },

        // ── 5. Medicine Colleges ──────────────────────────────────────────────
        {
            label: '5 / 14 — Medicine Colleges',
            fill() {
                scrollTo('#sec-med');
                const md = CAIRO.MedicineDentistry;
                const fields = [
                    'med_totalStudents',
                    'med_fullTimeProfessor',           'med_partTimeClinicalProfessor',
                    'med_fullTimeAssociateProfessor',  'med_partTimeClinicalAssociateProfessor',
                    'med_fullTimeAssistantProfessor',  'med_partTimeClinicalAssistantProfessor',
                    'med_fullTimeLecturerPhd',         'med_partTimeClinicalLecturerPhd',
                    'med_fullTimeAssistantLecturerPhd','med_partTimeClinicalAssistantLecturerPhd',
                    'med_fullTimeLecturerMsc',
                    'med_fullTimeAssistantLecturerMsc',
                    'med_fullTimePractitionerPsc',
                    'med_fullTimePractitionerMsc',
                    'den_totalStudents',
                    'den_fullTimeProfessor',           'den_partTimeClinicalProfessor',
                    'den_fullTimeAssociateProfessor',  'den_partTimeClinicalAssociateProfessor',
                    'den_fullTimeAssistantProfessor',  'den_partTimeClinicalAssistantProfessor',
                    'den_fullTimeLecturerPhd',         'den_partTimeClinicalLecturerPhd',
                    'den_fullTimeAssistantLecturerPhd','den_partTimeClinicalAssistantLecturerPhd',
                    'den_fullTimeLecturerMsc',
                    'den_fullTimeAssistantLecturerMsc',
                    'den_fullTimePractitionerPsc',
                    'den_fullTimePractitionerMsc',
                ];
                fields.forEach(id => setId(id, md[id] ?? ''));
                setTimeout(() => window.MedDenSave?.(), 400);
            }
        },

        // ── 6. Hospitals + Agreement PDFs ─────────────────────────────────────
        {
            label: '6 / 14 — Hospitals + Agreement PDFs',
            async fill() {
                scrollTo('#sec-hosp');
                const addUrl = document.getElementById('hospitalsContainer')
                    ?.getAttribute('data-facility-add-url') || '/Home/AddHospital';

                for (const h of CAIRO.Hospitals) {
                    try {
                        const fd = new FormData();
                        fd.append('Name',               h.name);
                        fd.append('Specialization',     h.spec);
                        fd.append('BedCapacity',        String(h.beds   || ''));
                        fd.append('DentalChairCapacity',String(h.dental || ''));
                        fd.append('AgreementDocuments', makePDF(`Cairo_${h.name.replace(/[^a-zA-Z0-9]/g,'_')}_Agreement.pdf`));
                        await fetch(addUrl, { method: 'POST', body: fd });
                        await delay(300);
                    } catch (e) { console.warn('Hospital add failed:', h.name, e); }
                }
                const container = document.getElementById('hospitalsContainer');
                const loadUrl = container?.getAttribute('data-load-url') || '/Home/HospitalsPartial';
                if (container) {
                    const r = await fetch(loadUrl);
                    container.innerHTML = await r.text();
                }
            }
        },

        // ── 7. Study Duration + Admission PDFs ───────────────────────────────
        {
            label: '7 / 14 — Study Duration + Admission PDFs',
            fill() {
                set('AdmissionStudy.BScDuration',           CAIRO.BScDuration);
                set('AdmissionStudy.MasterDuration',        CAIRO.MasterDuration);
                set('AdmissionStudy.PhDDuration',           CAIRO.PhDDuration);
                set('AdmissionStudy.HigherDiplomaDuration', CAIRO.HigherDiplomaDuration);
                set('AdmissionStudy.DiplomaDuration',       CAIRO.DiplomaDuration);

                attachFile('[name="AdmissionStudy.BScSamplePdf"]',           makePDF('Cairo_BSc_Admission_Requirements.pdf'));
                attachFile('[name="AdmissionStudy.MasterSamplePdf"]',        makePDF('Cairo_Master_Admission_Requirements.pdf'));
                attachFile('[name="AdmissionStudy.PhDSamplePdf"]',           makePDF('Cairo_PhD_Admission_Requirements.pdf'));
                attachFile('[name="AdmissionStudy.DiplomaSamplePdf"]',       makePDF('Cairo_Diploma_Admission_Requirements.pdf'));
                attachFile('[name="AdmissionStudy.HigherDiplomaSamplePdf"]', makePDF('Cairo_Higher_Diploma_Admission_Requirements.pdf'));

                scrollTo('#sec-admission-duration');
            }
        },

        // ── 8. Infrastructure ─────────────────────────────────────────────────
        {
            label: '8 / 14 — Infrastructure',
            fill() {
                setId('infra_areaKm2',       CAIRO.AreaKm2);
                setId('infra_campusesCount',  CAIRO.CampusesCount);
                setId('infra_classroomsCount',CAIRO.ClassroomsCount);
                setId('infra_librariesCount', CAIRO.LibrariesCount);
                setId('infra_stadiumsCount',  CAIRO.StadiumsCount);
                scrollTo('#sec-infra');
                setTimeout(() => clickBtn('#btnSaveInfrastructure'), 400);
            }
        },

        // ── 9. Library ────────────────────────────────────────────────────────
        {
            label: '9 / 14 — Library',
            fill() {
                setId('lib_area',              CAIRO.LibArea);
                setId('lib_capacity',          CAIRO.LibCapacity);
                setId('lib_numberOfBooks',     CAIRO.LibBooks);
                setId('lib_paperJournals',     CAIRO.LibPaperJournals);
                setId('lib_electronicBooks',   CAIRO.LibElectronicBooks);
                setId('lib_electronicJournals',CAIRO.LibElectronicJournals);
                scrollTo('#sec-library');
                setTimeout(() => clickBtn('#btnSaveLibrary'), 400);
            }
        },

        // ── 10. Photos / Media — upload one PDF per category via API ──────────
        {
            label: '10 / 14 — Photos / Media',
            async fill() {
                scrollTo('#sec-pictures');
                const uploadUrl = '/Home/UploadPicture';
                const subjects = [
                    { subject: 'Library photos',      file: 'Cairo_Library_Photos.pdf'      },
                    { subject: 'Hospital photos',     file: 'Cairo_Hospital_Photos.pdf'     },
                    { subject: 'Colleges photos',     file: 'Cairo_Colleges_Photos.pdf'     },
                    { subject: 'Laboratories photos', file: 'Cairo_Laboratories_Photos.pdf' },
                    { subject: 'Facilities photos',   file: 'Cairo_Facilities_Photos.pdf'   },
                ];

                for (const item of subjects) {
                    try {
                        const fd = new FormData();
                        fd.append('file',    makePDF(item.file));
                        fd.append('subject', item.subject);
                        await fetch(uploadUrl, { method: 'POST', body: fd });
                        await delay(200);
                    } catch (e) { console.warn('Photo upload failed:', item.subject, e); }
                }

                // Reload via proper section loader so bindings stay intact
                if (window.LoadPicturesSection) {
                    await window.LoadPicturesSection();
                } else {
                    const container = document.getElementById('picturesContainer');
                    const loadUrl = container?.getAttribute('data-load-url') || '/Home/PicturesPartial';
                    if (container) {
                        const r = await fetch(loadUrl);
                        container.innerHTML = await r.text();
                    }
                }
            }
        },

        // ── 11. Accreditation Bodies + PDF ────────────────────────────────────
        {
            label: '11 / 14 — Accreditation Bodies',
            async fill() {
                scrollTo('#sec-uni-rec-accr');
                const addUrl = '/Home/AccreditationBodiesAdd';

                for (const body of CAIRO.AccreditationBodies) {
                    try {
                        const fd = new FormData();
                        fd.append('AccreditationBodyName', body.name);
                        fd.append('AccreditationType',     body.type);
                        fd.append('PdfFile', makePDF(`Cairo_Accreditation_${body.type}.pdf`));
                        await fetch(addUrl, { method: 'POST', body: fd });
                        await delay(300);
                    } catch (e) { console.warn('Accreditation body add failed:', body.name, e); }
                }
            }
        },

        // ── 12. University Recognition & Accreditation Documents ─────────────
        {
            label: '12 / 14 — URA Documents',
            async fill() {
                scrollTo('#sec-uni-rec-accr');

                const container = document.getElementById('uniRecAccContainer');
                const saveUrl   = container?.getAttribute('data-docs-save-url') || '/Home/SaveUniversityRecognitionDocuments';

                // Upload Local Recognition doc
                try {
                    const fd = new FormData();
                    fd.append('LocalRecognitionDocuments', makePDF('Cairo_Local_Recognition_Certificate.pdf'));
                    await fetch(saveUrl, { method: 'POST', body: fd });
                    await delay(300);
                } catch (e) { console.warn('URA LocalRecognition upload failed:', e); }

                // Upload International Accreditation doc
                try {
                    const fd = new FormData();
                    fd.append('InternationalAccreditationDocuments', makePDF('Cairo_International_Accreditation_Certificate.pdf'));
                    await fetch(saveUrl, { method: 'POST', body: fd });
                    await delay(300);
                } catch (e) { console.warn('URA InternationalAccreditation upload failed:', e); }

                // Refresh via the proper loader so bindings stay intact
                if (window.LoadUniversityRecognitionAccreditationSection) {
                    await window.LoadUniversityRecognitionAccreditationSection();
                } else if (container) {
                    const loadUrl = container.getAttribute('data-load-url') || '/Home/UniversityRecognitionAccreditationPartial';
                    const r = await fetch(loadUrl, { cache: 'no-store' });
                    container.innerHTML = await r.text();
                }
            }
        },

        // ── 13. Laboratories ─────────────────────────────────────────────────
        {
            label: '13 / 14 — Laboratories',
            async fill() {
                scrollTo('#sec-labs');

                // Ensure college categories are in session regardless of whether
                // the Academic Info save (step 2) succeeded.
                const categoriesCsv = [...new Set(CAIRO.Laboratories.map(r => r.category))].join(';');
                try {
                    await fetch('/Home/AutoSaveAcademicInfo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ CollegeCategoriesCsv: categoriesCsv }).toString()
                    });
                } catch (e) { console.warn('Category pre-save failed:', e); }

                const container = document.getElementById('laboratoriesContainer');
                const addUrl = container?.getAttribute('data-add-url') || '/Home/AddOrUpdateLaboratory';

                for (const row of CAIRO.Laboratories) {
                    try {
                        const res = await fetch(addUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                FacultyId:    row.category,
                                Computers:    String(row.computers),
                                Laboratories: String(row.labs),
                            }).toString()
                        });
                        if (!res.ok) console.warn('Lab row failed:', row.category, await res.text());
                        await delay(250);
                    } catch (e) { console.warn('Lab row error:', row.category, e); }
                }

                // Reload via the proper section loader so bindings stay intact
                if (window.LoadLaboratoriesSection) {
                    await window.LoadLaboratoriesSection();
                }
            }
        },

        // ── 14. Finish & Submit ───────────────────────────────────────────────
        {
            label: '14 / 14 — Finish & Submit',
            async fill() {
                scrollTo('#sec-submit-application');

                // Reload via the proper section loader so ack/postgrad bindings stay intact
                if (window.LoadSubmitApplicationSection) {
                    await window.LoadSubmitApplicationSection();
                    await delay(200);
                }

                setId('subapp_name',      CAIRO.ApplicantName);
                setId('subapp_workplace', CAIRO.WorkPlace);
            }
        },
    ];

    // ── Widget UI ─────────────────────────────────────────────────────────────
    let currentStep = 0;

    const widget = document.createElement('div');
    Object.assign(widget.style, {
        marginTop:    '18px',
        background:   '#f3f0ff',
        border:       '1.5px solid #7c3aed',
        borderRadius: '12px',
        padding:      '14px 18px',
        display:      'flex',
        flexDirection:'column',
        gap:          '10px',
        fontFamily:   'system-ui, sans-serif',
        width:        '100%',
        boxSizing:    'border-box',
    });

    const titleText = document.createElement('div');
    titleText.textContent = '🛠 Dev Fill — Cairo University';
    Object.assign(titleText.style, { color:'#5b21b6', fontWeight:'700', fontSize:'13px' });

    const label = document.createElement('div');
    label.textContent = STEPS[0].label;
    Object.assign(label.style, { color:'#374151', fontSize:'12px' });

    const progress = document.createElement('div');
    Object.assign(progress.style, { background:'#ddd6fe', borderRadius:'4px', height:'5px', overflow:'hidden' });
    const bar = document.createElement('div');
    Object.assign(bar.style, {
        background:'#7c3aed', height:'100%',
        width: `${(1/STEPS.length)*100}%`, transition:'width .3s'
    });
    progress.appendChild(bar);

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display:'flex', gap:'8px', flexWrap:'wrap' });

    const fillBtn = document.createElement('button');
    fillBtn.textContent = 'Fill Next Section →';
    Object.assign(fillBtn.style, {
        background:'#7c3aed', color:'#fff', border:'none',
        borderRadius:'8px', padding:'7px 16px',
        cursor:'pointer', fontWeight:'600', fontSize:'13px', flex:'1',
    });

    const fillAllBtn = document.createElement('button');
    fillAllBtn.textContent = 'Fill All ⚡';
    Object.assign(fillAllBtn.style, {
        background:'transparent', color:'#5b21b6', border:'1.5px solid #7c3aed',
        borderRadius:'8px', padding:'7px 14px',
        cursor:'pointer', fontWeight:'600', fontSize:'13px',
    });

    const seedBtn = document.createElement('button');
    seedBtn.textContent = '💾 Save to DB';
    Object.assign(seedBtn.style, {
        background:'#166534', color:'#fff', border:'none',
        borderRadius:'8px', padding:'7px 14px',
        cursor:'pointer', fontWeight:'600', fontSize:'13px', width:'100%',
    });
    seedBtn.title = 'Creates a persistent Cairo University record in PostgreSQL so data survives restarts';

    const doneMsg = document.createElement('div');
    doneMsg.textContent = '✅ All sections filled!';
    Object.assign(doneMsg.style, { color:'#15803d', fontSize:'12px', fontWeight:'600', display:'none' });

    function advanceStep() {
        STEPS[currentStep].fill();
        currentStep++;
        const pct = (Math.min(currentStep, STEPS.length) / STEPS.length) * 100;
        bar.style.width = pct + '%';
        if (currentStep >= STEPS.length) {
            fillBtn.style.display    = 'none';
            fillAllBtn.style.display = 'none';
            doneMsg.style.display    = 'block';
            label.textContent        = 'All done!';
        } else {
            label.textContent = STEPS[currentStep].label;
        }
    }

    fillBtn.addEventListener('click', advanceStep);
    fillAllBtn.addEventListener('click', () => {
        const remaining = STEPS.length - currentStep;
        for (let i = 0; i < remaining; i++) {
            setTimeout(() => advanceStep(), i * 700);
        }
    });

    seedBtn.addEventListener('click', async () => {
        seedBtn.disabled = true;
        seedBtn.textContent = '⏳ Saving...';
        try {
            const res = await fetch('/Home/DevSeedCairoUniversity', { method: 'POST' });
            const data = await res.json();
            seedBtn.textContent = `✅ ${data.message}`;
            seedBtn.style.background = '#14532d';
        } catch (e) {
            seedBtn.textContent = '❌ Failed — check console';
            seedBtn.style.background = '#991b1b';
            seedBtn.disabled = false;
        }
    });

    btnRow.appendChild(fillBtn);
    btnRow.appendChild(fillAllBtn);
    widget.appendChild(titleText);
    widget.appendChild(seedBtn);
    widget.appendChild(label);
    widget.appendChild(progress);
    widget.appendChild(btnRow);
    widget.appendChild(doneMsg);

    // Inject into the welcome card
    const welcomeCard = document.querySelector('#sec-instructions .welcome-card');
    if (welcomeCard) welcomeCard.appendChild(widget);
    else document.body.appendChild(widget);
})();
