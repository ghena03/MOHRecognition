/* ================================================================
   DEV TEST TOOL  —  POSTGRADUATE  —  REMOVE BEFORE FINAL DELIVERY
   Fills Cairo University postgraduate data section by section.
   ================================================================ */
(function () {
    'use strict';

    // ── Cairo University postgraduate data ────────────────────────────────────
    const CAIRO_PG = {
        // Public Info (shared with main application)
        InstitutionName:          'Cairo University',
        PresidentName:            'Prof. Mohamed Samy Abdel-Sadak',
        OversightRightsEntity:    'Ministry',
        FoundationDate:           '1908-12-21',
        DateOfEstablishment:      '1952-01-01',
        ModeOfStudy:              'On-campus',
        LanguageOfInstruction:    'Arabic',
        StartOfTeaching:          '1909-01-01',
        MailingFullAddress:       'Cairo University, Giza, Egypt, 12613',
        DirectPhoneNumber:        '+20235676620',
        EmailAddress:             'info@cu.edu.eg',
        InstitutionalWebAddress:  'https://cu.edu.eg',
        Country:                  'Egypt',
        City:                     'Giza',

        // Programs: Cairo University offers Master, PhD, and Higher Diploma
        HasMaster:  true,
        HasPhD:     true,
        HasDiploma: false,

        // Students
        MasterStudents:  15400,
        PhDStudents:      5200,
        DiplomaStudents:     0,

        // Academic staff — per program type
        MasterProfessor:     1180,
        MasterAssociate:      920,
        MasterAssistant:     1040,

        PhDProfessor:         780,
        PhDAssociate:         560,
        PhDAssistant:         680,

        DiplomaProfessor:       0,
        DiplomaAssociate:       0,
        DiplomaAssistant:       0,

        // Applicant
        ApplicantName:  'Ahmed Hassan',
        ApplicantWorkPlace: 'Office of the President, Cairo University',
    };

    // ── File helpers ──────────────────────────────────────────────────────────
    function makePDF(name) {
        const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n% Demo: ${name}`;
        return new File([content], name, { type: 'application/pdf' });
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

    // ── Form helpers ──────────────────────────────────────────────────────────
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
        if (el.type === 'checkbox') { el.checked = !!value; el.dispatchEvent(new Event('change', { bubbles: true })); return; }
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
        if (opt) el.value = opt.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }


    function scrollTo(id) {
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ── Steps ─────────────────────────────────────────────────────────────────
    const STEPS = [

        // ── 1. Public Info ────────────────────────────────────────────────────
        {
            label: '1 / 5 — Public Info',
            fill() {
                set('InstitutionName',         CAIRO_PG.InstitutionName);
                set('PresidentName',           CAIRO_PG.PresidentName);
                set('FoundationDate',          CAIRO_PG.FoundationDate);
                set('DateOfEstablishment',     CAIRO_PG.DateOfEstablishment);
                set('StartOfTeaching',         CAIRO_PG.StartOfTeaching);
                set('MailingFullAddress',      CAIRO_PG.MailingFullAddress);
                set('DirectPhoneNumber',       CAIRO_PG.DirectPhoneNumber);
                set('EmailAddress',            CAIRO_PG.EmailAddress);
                set('InstitutionalWebAddress', CAIRO_PG.InstitutionalWebAddress);
                set('Country',                 CAIRO_PG.Country);
                set('City',                    CAIRO_PG.City);
                selectOption('OversightRightsEntity', CAIRO_PG.OversightRightsEntity);
                selectOption('ModeOfStudy',           CAIRO_PG.ModeOfStudy);
                selectOption('LanguageOfInstruction', CAIRO_PG.LanguageOfInstruction);
                scrollTo('#sec-general');
            }
        },

        // ── 2. Programs ───────────────────────────────────────────────────────
        {
            label: '2 / 5 — Postgraduate Programs',
            fill() {
                // Check degree boxes — triggers visibility of file upload cards
                setId('chkMaster',  CAIRO_PG.HasMaster);
                setId('chkPhD',     CAIRO_PG.HasPhD);
                setId('chkDiploma', CAIRO_PG.HasDiploma);

                // Attach program PDF files
                setTimeout(() => {
                    if (CAIRO_PG.HasMaster) {
                        const masterInput = document.querySelector('[name="MasterFile"]');
                        if (masterInput) attachFile(masterInput, makePDF('Cairo_Master_Programs.pdf'));
                    }
                    if (CAIRO_PG.HasPhD) {
                        const phdInput = document.querySelector('[name="PhDFile"]');
                        if (phdInput) attachFile(phdInput, makePDF('Cairo_PhD_Programs.pdf'));
                    }
                    if (CAIRO_PG.HasDiploma) {
                        const dipInput = document.querySelector('[name="DiplomaFile"]');
                        if (dipInput) attachFile(dipInput, makePDF('Cairo_HigherDiploma_Programs.pdf'));
                    }
                }, 300);

                scrollTo('#sec-programs');
            }
        },

        // ── 3. Number of Students ─────────────────────────────────────────────
        {
            label: '3 / 5 — Number of Students',
            fill() {
                set('MasterStudents',  CAIRO_PG.MasterStudents);
                set('PhDStudents',     CAIRO_PG.PhDStudents);
                set('DiplomaStudents', CAIRO_PG.DiplomaStudents);
                scrollTo('#sec-students');
            }
        },

        // ── 4. Academic Staff ─────────────────────────────────────────────────
        {
            label: '4 / 5 — Academic Staff',
            fill() {
                set('MasterProfessor',   CAIRO_PG.MasterProfessor);
                set('MasterAssociate',   CAIRO_PG.MasterAssociate);
                set('MasterAssistant',   CAIRO_PG.MasterAssistant);
                set('PhDProfessor',      CAIRO_PG.PhDProfessor);
                set('PhDAssociate',      CAIRO_PG.PhDAssociate);
                set('PhDAssistant',      CAIRO_PG.PhDAssistant);
                set('DiplomaProfessor',  CAIRO_PG.DiplomaProfessor);
                set('DiplomaAssociate',  CAIRO_PG.DiplomaAssociate);
                set('DiplomaAssistant',  CAIRO_PG.DiplomaAssistant);
                scrollTo('#sec-faculty');
            }
        },

        // ── 5. Applicant Info ─────────────────────────────────────────────────
        {
            label: '5 / 5 — Applicant Info',
            fill() {
                set('Name',      CAIRO_PG.ApplicantName);
                set('WorkPlace', CAIRO_PG.ApplicantWorkPlace);

                // Set "No" for online continuation (default safe)
                const radioNo = document.querySelector('input[name="ApplyOnline"][value="no"]');
                if (radioNo) { radioNo.checked = true; radioNo.dispatchEvent(new Event('change', { bubbles: true })); }

                scrollTo('#sec-user');
            }
        },
    ];

    let currentStep = 0;

    // ── Widget ────────────────────────────────────────────────────────────────
    const widget = document.createElement('div');
    Object.assign(widget.style, {
        marginTop: '16px', padding: '14px 16px', background: '#f5f3ff',
        border: '1.5px solid #ddd6fe', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', gap: '8px',
    });

    const titleText = document.createElement('div');
    titleText.textContent = '🛠 Dev Fill — Cairo Postgraduate';
    Object.assign(titleText.style, { color: '#5b21b6', fontWeight: '700', fontSize: '13px' });

    const label = document.createElement('div');
    label.textContent = STEPS[0].label;
    Object.assign(label.style, { color: '#374151', fontSize: '12px' });

    const progress = document.createElement('div');
    Object.assign(progress.style, { background: '#ddd6fe', borderRadius: '4px', height: '5px', overflow: 'hidden' });
    const bar = document.createElement('div');
    Object.assign(bar.style, {
        background: '#7c3aed', height: '100%',
        width: `${(1 / STEPS.length) * 100}%`, transition: 'width .3s',
    });
    progress.appendChild(bar);

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '8px', flexWrap: 'wrap' });

    const fillBtn = document.createElement('button');
    fillBtn.textContent = 'Fill Next Section →';
    Object.assign(fillBtn.style, {
        background: '#7c3aed', color: '#fff', border: 'none',
        borderRadius: '8px', padding: '7px 16px',
        cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: '1',
    });

    const fillAllBtn = document.createElement('button');
    fillAllBtn.textContent = 'Fill All ⚡';
    Object.assign(fillAllBtn.style, {
        background: 'transparent', color: '#5b21b6', border: '1.5px solid #7c3aed',
        borderRadius: '8px', padding: '7px 14px',
        cursor: 'pointer', fontWeight: '600', fontSize: '13px',
    });

    const doneMsg = document.createElement('div');
    doneMsg.textContent = '✅ All sections filled! Press Submit Application to finish.';
    Object.assign(doneMsg.style, { color: '#15803d', fontSize: '12px', fontWeight: '600', display: 'none' });

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
            setTimeout(() => advanceStep(), i * 600);
        }
    });

    btnRow.appendChild(fillBtn);
    btnRow.appendChild(fillAllBtn);
    widget.appendChild(titleText);
    widget.appendChild(label);
    widget.appendChild(progress);
    widget.appendChild(btnRow);
    widget.appendChild(doneMsg);

    const welcomeCard = document.querySelector('section.welcome .welcome-card');
    if (welcomeCard) welcomeCard.appendChild(widget);
    else document.body.appendChild(widget);
})();
