/* ================================================================
   DEV TEST TOOL  —  ONLINE EDUCATION  —  REMOVE BEFORE FINAL DELIVERY
   Fills Cairo University online education data section by section.
   ================================================================ */
(function () {
    'use strict';

    // ── Cairo University online education data ────────────────────────────────
    const CAIRO_OL = {
        // Public Info (shared with main application)
        InstitutionName:          'Cairo University',
        PresidentName:            'Prof. Mohamed Samy Abdel-Sadak',
        OversightRightsEntity:    'Ministry',
        FoundationDate:           '1908-12-21',
        DateOfEstablishment:      '1952-01-01',
        ModeOfStudy:              'Online',
        LanguageOfInstruction:    'Arabic',
        StartOfTeaching:          '1909-01-01',
        MailingFullAddress:       'Cairo University, Giza, Egypt, 12613',
        DirectPhoneNumber:        '+20235676620',
        EmailAddress:             'info@cu.edu.eg',
        InstitutionalWebAddress:  'https://cu.edu.eg',
        Location:                 'Egypt / Giza',

        // Students
        OnlineStudents: 8500,

        // Academic staff for online programs
        Professor:           450,
        AssociateProfessor:  380,
        AssistantProfessor:  520,

        // Applicant
        ApplicantName:  'Ahmed Hassan',
        ApplicantEmail: 'ahmed.hassan@cu.edu.eg',
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

        // ── 1. Application Gate ───────────────────────────────────────────────
        {
            label: '1 / 6 — Application Gate (Yes)',
            fill() {
                const btnYes = document.getElementById('gateYes');
                if (btnYes) btnYes.click();
                scrollTo('#sec-gate');
            }
        },

        // ── 2. Public Info ────────────────────────────────────────────────────
        {
            label: '2 / 6 — Public Info',
            fill() {
                set('InstitutionName',         CAIRO_OL.InstitutionName);
                set('PresidentName',           CAIRO_OL.PresidentName);
                set('FoundationDate',          CAIRO_OL.FoundationDate);
                set('DateOfEstablishment',     CAIRO_OL.DateOfEstablishment);
                set('StartOfTeaching',         CAIRO_OL.StartOfTeaching);
                set('MailingFullAddress',      CAIRO_OL.MailingFullAddress);
                set('DirectPhoneNumber',       CAIRO_OL.DirectPhoneNumber);
                set('EmailAddress',            CAIRO_OL.EmailAddress);
                set('InstitutionalWebAddress', CAIRO_OL.InstitutionalWebAddress);
                set('Location',                CAIRO_OL.Location);
                selectOption('OversightRightsEntity', CAIRO_OL.OversightRightsEntity);
                selectOption('ModeOfStudy',           CAIRO_OL.ModeOfStudy);
                selectOption('LanguageOfInstruction', CAIRO_OL.LanguageOfInstruction);
                scrollTo('#sec-general');
            }
        },

        // ── 3. Online Programs ────────────────────────────────────────────────
        {
            label: '3 / 6 — Online Programs',
            fill() {
                const progInput = document.querySelector('[name="ProgramFile"]');
                if (progInput) attachFile(progInput, makePDF('Cairo_Online_Programs.pdf'));
                scrollTo('#sec-programs');
            }
        },

        // ── 4. Number of Students ─────────────────────────────────────────────
        {
            label: '4 / 6 — Number of Students',
            fill() {
                set('OnlineStudents', CAIRO_OL.OnlineStudents);
                scrollTo('#sec-students');
            }
        },

        // ── 5. Academic Staff ─────────────────────────────────────────────────
        {
            label: '5 / 6 — Academic Staff',
            fill() {
                set('Professor',           CAIRO_OL.Professor);
                set('AssociateProfessor',  CAIRO_OL.AssociateProfessor);
                set('AssistantProfessor',  CAIRO_OL.AssistantProfessor);
                scrollTo('#sec-faculty');
            }
        },

        // ── 6. Applicant Info ─────────────────────────────────────────────────
        {
            label: '6 / 6 — Applicant Info',
            fill() {
                set('Name',  CAIRO_OL.ApplicantName);
                set('Email', CAIRO_OL.ApplicantEmail);
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
    titleText.textContent = '🛠 Dev Fill — Cairo Online Education';
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
            setTimeout(() => advanceStep(), i * 700);
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
