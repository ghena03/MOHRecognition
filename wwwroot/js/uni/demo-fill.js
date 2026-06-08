/* ================================================================
   EXPLAINABLE DEMO FILL TOOL — Dev / recording use only
   Field-by-field, typing effect, scroll + highlight per field.
   Fills in strict page order. Includes all Excel / PDF uploads.
   ----------------------------------------------------------------
   window.demoFillBachelorApplicationExplainable()
   window.demoFillPostgraduateApplicationExplainable()
   window.demoFillOnlineApplicationExplainable()
   window.stopDemoFill()
   ================================================================ */
(function (w) {
    'use strict';

    // ── Highlight CSS ─────────────────────────────────────────────────────
    const _style = document.createElement('style');
    _style.textContent = `
        .demo-active-field {
            outline: 3px solid #b51b3b !important;
            box-shadow: 0 0 8px rgba(181,27,59,0.4) !important;
            transition: outline 0.2s ease, box-shadow 0.2s ease;
        }
    `;
    document.head.appendChild(_style);

    // ── Timing ────────────────────────────────────────────────────────────
    const FIELD_DELAY   = 100;
    const TYPING_DELAY  = 12;
    const SECTION_DELAY = 250;
    const SCROLL_DELAY  = 150;
    const UPLOAD_DELAY  = 150;

    // ── State ─────────────────────────────────────────────────────────────
    let _cancelled        = false;
    let _paused           = false;
    let _resumeResolve    = null;
    let _setStatus        = () => {};
    let _speedMultiplier  = 1.0;   // 1 = fast (~1 min), 3.5 = normal, 9 = slow (original)

    const SPEED_PRESETS = [
        { label:'▷ Normal', mult:4.5 },
        { label:'⚡ Fast',   mult:1.0 },
    ];
    let _speedIdx = 0;   // default: Normal

    // ── DOM shortcuts ─────────────────────────────────────────────────────
    async function sleep(ms) {
        await new Promise(r => setTimeout(r, Math.round(ms * _speedMultiplier)));
        while (_paused && !_cancelled) {
            await new Promise(res => { _resumeResolve = res; });
        }
        _resumeResolve = null;
    }
    const q     = sel => document.querySelector(sel);
    const qi    = id  => document.getElementById(id);
    const qn    = nm  => document.querySelector(`[name="${nm}"]`);
    const qs    = nm  => document.querySelector(`select[name="${nm}"]`);

    function inViewport(el) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top >= -80 && r.bottom <= window.innerHeight + 80;
    }

    // ── Core field actions ────────────────────────────────────────────────
    async function scrollToField(el) {
        if (!el || _cancelled || _speedMultiplier === 0) return;
        if (!inViewport(el)) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(SCROLL_DELAY);
        }
    }

    async function highlight(el) {
        if (!el || _cancelled || _speedMultiplier === 0) return;
        el.classList.add('demo-active-field');
        await sleep(60);
    }

    function unhighlight(el) { el?.classList.remove('demo-active-field'); }

    async function typeField(el, value, label) {
        if (!el || _cancelled) return;
        if (label) _setStatus(`Typing: ${label}`);
        await scrollToField(el);
        await highlight(el);
        el.focus();
        el.value = '';
        for (const ch of String(value)) {
            if (_cancelled) { unhighlight(el); return; }
            el.value += ch;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(TYPING_DELAY);
        }
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(FIELD_DELAY);
        unhighlight(el);
    }

    async function setField(el, value, label) {
        if (!el || _cancelled) return;
        if (label) _setStatus(`Setting: ${label}`);
        await scrollToField(el);
        await highlight(el);
        el.focus();
        el.value = String(value);
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(Math.round(FIELD_DELAY * 0.65));
        unhighlight(el);
    }

    async function selectField(el, value, label) {
        if (!el || _cancelled) return;
        if (label) _setStatus(`Selecting: ${label}`);
        await scrollToField(el);
        await highlight(el);
        const opt = Array.from(el.options).find(o =>
            o.value.toLowerCase() === String(value).toLowerCase() ||
            o.text.toLowerCase().includes(String(value).toLowerCase())
        );
        if (opt) el.value = opt.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(FIELD_DELAY);
        unhighlight(el);
    }

    async function clickField(el, label) {
        if (!el || _cancelled) return;
        if (label) _setStatus(`Clicking: ${label}`);
        await scrollToField(el);
        await highlight(el);
        if (!el.checked) { el.checked = true; }
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(FIELD_DELAY);
        unhighlight(el);
    }

    async function attachFileToInput(el, file, label) {
        if (!el || _cancelled) return;
        if (label) _setStatus(`Attaching: ${label}`);
        await scrollToField(el);
        await highlight(el);
        try {
            const dt = new DataTransfer();
            dt.items.add(file);
            el.files = dt.files;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) { console.warn('[demo] DataTransfer failed:', label, e); }
        await sleep(Math.round(FIELD_DELAY * 0.65));
        unhighlight(el);
    }

    async function sectionHeader(sel, label) {
        if (_cancelled) return;
        if (label) _setStatus(`— ${label} —`);
        if (_speedMultiplier !== 0) {
            const el = q(sel);
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        }
        await sleep(SECTION_DELAY);
    }

    // Click a save button and wait for the server round-trip
    function showDemoToast(label) {
        if (!document.getElementById('demoToastStyle')) {
            const s = document.createElement('style');
            s.id = 'demoToastStyle';
            s.textContent = `
                .demo-toast {
                    position: fixed; top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 999999;
                    background: #16a34a; color: #fff; border-radius: 12px;
                    padding: 18px 32px; font-family: system-ui, sans-serif;
                    font-size: 15px; font-weight: 700; display: flex;
                    align-items: center; gap: 10px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.28);
                    animation: demoToastIn 0.25s ease;
                    text-align: center;
                }
                .demo-toast.fade-out { animation: demoToastOut 0.3s ease forwards; }
                @keyframes demoToastIn  { from { opacity:0; transform:translate(-50%,-50%) scale(0.88); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
                @keyframes demoToastOut { from { opacity:1; transform:translate(-50%,-50%) scale(1); } to { opacity:0; transform:translate(-50%,-50%) scale(0.88); } }
            `;
            document.head.appendChild(s);
        }
        const t = document.createElement('div');
        t.className = 'demo-toast';
        t.innerHTML = `<span>✓</span><span>${label} saved successfully</span>`;
        document.body.appendChild(t);
        setTimeout(() => {
            t.classList.add('fade-out');
            setTimeout(() => t.remove(), 300);
        }, 2500);
    }

    async function saveSection(btnId, label) {
        if (_cancelled) return;
        const btn = qi(btnId);
        if (!btn) return;
        _setStatus(`Saving: ${label}...`);
        await scrollToField(btn);
        await highlight(btn);
        btn.click();
        await sleep(250);   // allow AJAX + re-render
        unhighlight(btn);
        showDemoToast(label);
        _setStatus(`Saved: ${label}`);
        await sleep(100);
    }

    // ── File generators ───────────────────────────────────────────────────
    function makePDF(name) {
        const lbl = (name||'').replace(/[<>()\\%\x00-\x1F]/g,'_').substring(0,50);
        const stream = 'BT /F1 12 Tf 50 750 Td ('+lbl+') Tj ET';
        const defs = [
            '<</Type/Catalog/Pages 2 0 R>>',
            '<</Type/Pages/Kids[3 0 R]/Count 1>>',
            '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>',
            '<</Length '+stream.length+'>>\nstream\n'+stream+'\nendstream',
        ];
        let body='%PDF-1.4\n', offs=[0];
        defs.forEach((d,i)=>{ offs.push(body.length); body+=(i+1)+' 0 obj\n'+d+'\nendobj\n'; });
        const xp=body.length, n=defs.length+1;
        body+='xref\n0 '+n+'\n0000000000 65535 f \n';
        for(let i=1;i<n;i++) body+=offs[i].toString().padStart(10,'0')+' 00000 n \n';
        body+='trailer\n<</Size '+n+'/Root 1 0 R>>\nstartxref\n'+xp+'\n%%EOF';
        return new File([body], name, { type:'application/pdf' });
    }

    function makeXLSX(name) {
        function crc32(buf) {
            var t=[], c; for(var i=0;i<256;i++){c=i;for(var j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[i]=c>>>0;}
            var crc=0xFFFFFFFF; for(var i=0;i<buf.length;i++)crc=(t[(crc^buf[i])&0xFF]^(crc>>>8))>>>0; return(crc^0xFFFFFFFF)>>>0;
        }
        function u16(n){return[n&0xFF,(n>>8)&0xFF];}
        function u32(n){return[n&0xFF,(n>>8)&0xFF,(n>>16)&0xFF,(n>>24)&0xFF];}
        function s(str){return Array.from(new TextEncoder().encode(str));}
        var files=[
            {n:'[Content_Types].xml',d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'},
            {n:'_rels/.rels',d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
            {n:'xl/workbook.xml',d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'},
            {n:'xl/_rels/workbook.xml.rels',d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'},
            {n:'xl/worksheets/sheet1.xml',d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Staff List</t></is></c></row></sheetData></worksheet>'},
        ];
        var all=[],locals=[],offset=0;
        files.forEach(function(f){
            var nb=s(f.n),db=s(f.d),crc=crc32(db);
            var hdr=[0x50,0x4B,0x03,0x04,0x14,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...u32(crc),...u32(db.length),...u32(db.length),...u16(nb.length),0x00,0x00,...nb];
            locals.push({nb,db,crc,offset});all.push(...hdr,...db);offset+=hdr.length+db.length;
        });
        var cdStart=offset;
        locals.forEach(function(e){
            var cd=[0x50,0x4B,0x01,0x02,0x14,0x00,0x14,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...u32(e.crc),...u32(e.db.length),...u32(e.db.length),...u16(e.nb.length),0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...u32(e.offset),...e.nb];
            all.push(...cd);offset+=cd.length;
        });
        all.push(0x50,0x4B,0x05,0x06,0x00,0x00,0x00,0x00,...u16(files.length),...u16(files.length),...u32(offset-cdStart),...u32(cdStart),0x00,0x00);
        return new File([new Uint8Array(all)],name,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    }

    // ── Staff rank upload (count FT → upload FT → count PT → upload PT) ──
    // sectionLabel must match the exact text shown on the page card title
    async function fillRankCard(rankKey, ftCountName, ptCountName, ftCount, ptCount, sectionLabel) {
        if (_cancelled) return;
        const safeLabel = sectionLabel.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/ +/g, '_');

        // Full-Time count
        await setField(qn(ftCountName), ftCount, `${sectionLabel} – Full-Time Count`);
        if (_cancelled) return;

        // Full-Time Excel upload
        _setStatus(`Uploading Excel: ${sectionLabel} – Full-Time`);
        const ftInput = q(`.rank-staff-upload[data-rank-key="${rankKey}"][data-employment-type="fulltime"]`);
        if (ftInput) {
            await scrollToField(ftInput);
            await highlight(ftInput);
        }
        const ftFile = makeXLSX(`Cairo_${safeLabel}_Full_Time.xlsx`);
        if (ftInput) {
            try { const dt = new DataTransfer(); dt.items.add(ftFile); ftInput.files = dt.files; } catch(e) {}
        }
        const ftFd = new FormData();
        ftFd.append('file', ftFile); ftFd.append('rankKey', rankKey); ftFd.append('employmentType', 'fulltime');
        try {
            await fetch('/Home/UploadAcademicRankStaffFile', { method: 'POST', body: ftFd });
            const ftNote = ftInput?.closest('.rank-upload-shell')?.querySelector('.rank-upload-note');
            if (ftNote) ftNote.textContent = ftFile.name;
        } catch(e) { console.warn('[demo] Excel upload failed:', sectionLabel, 'fulltime'); }
        await sleep(UPLOAD_DELAY);
        if (ftInput) unhighlight(ftInput);
        if (_cancelled) return;

        // Part-Time count
        await setField(qn(ptCountName), ptCount, `${sectionLabel} – Part-Time Count`);
        if (_cancelled) return;

        // Part-Time Excel upload
        _setStatus(`Uploading Excel: ${sectionLabel} – Part-Time`);
        const ptInput = q(`.rank-staff-upload[data-rank-key="${rankKey}"][data-employment-type="parttime"]`);
        if (ptInput) {
            await scrollToField(ptInput);
            await highlight(ptInput);
        }
        const ptFile = makeXLSX(`Cairo_${safeLabel}_Part_Time.xlsx`);
        if (ptInput) {
            try { const dt = new DataTransfer(); dt.items.add(ptFile); ptInput.files = dt.files; } catch(e) {}
        }
        const ptFd = new FormData();
        ptFd.append('file', ptFile); ptFd.append('rankKey', rankKey); ptFd.append('employmentType', 'parttime');
        try {
            await fetch('/Home/UploadAcademicRankStaffFile', { method: 'POST', body: ptFd });
            const ptNote = ptInput?.closest('.rank-upload-shell')?.querySelector('.rank-upload-note');
            if (ptNote) ptNote.textContent = ptFile.name;
        } catch(e) { console.warn('[demo] Excel upload failed:', sectionLabel, 'parttime'); }
        await sleep(UPLOAD_DELAY);
        if (ptInput) unhighlight(ptInput);
    }

    async function uploadPhoto(subject, label) {
        if (_cancelled) return;
        _setStatus(`Uploading photo: ${label}`);
        const fd = new FormData();
        fd.append('file', makePDF(`Cairo_${subject.replace(/ /g,'_')}.pdf`));
        fd.append('subject', subject);
        try { await fetch('/Home/UploadPicture', { method: 'POST', body: fd }); } catch(e) {}
        await sleep(UPLOAD_DELAY);
    }

    async function uploadURADoc(docType, fileName, label) {
        if (_cancelled) return;
        _setStatus(`Uploading: ${label}`);
        const container = qi('uniRecAccContainer');
        const url = container?.getAttribute('data-docs-save-url') || '/Home/SaveUniversityRecognitionDocuments';
        const fd = new FormData();
        fd.append(docType, makePDF(fileName));
        try { await fetch(url, { method: 'POST', body: fd }); } catch(e) {}
        await sleep(UPLOAD_DELAY);
    }

    // ── Toast ─────────────────────────────────────────────────────────────
    function showToast(msg) {
        const t = document.createElement('div');
        Object.assign(t.style, {
            position:'fixed', bottom:'32px', right:'28px', zIndex:'99999',
            background:'#15803d', color:'#fff', padding:'14px 24px',
            borderRadius:'10px', fontWeight:'700', fontSize:'14px',
            boxShadow:'0 4px 20px rgba(0,0,0,.22)', transition:'opacity .5s',
        });
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),500); }, 5000);
    }

    // ════════════════════════════════════════════════════════════════════════
    //  BACHELOR  —  window.demoFillBachelorApplicationExplainable()
    //
    //  Cairo University data (public, governmental, Egypt)
    //  Founded 21 Dec 1908 · State university from 15 Mar 1925
    //  ~256 000 students · 25 faculties
    // ════════════════════════════════════════════════════════════════════════
    w.demoFillBachelorApplicationExplainable = async function () {
        _cancelled = false;

        // ── 1. Public Info ───────────────────────────────────────────────
        await sectionHeader('#sec-general', 'Public Info');
        await typeField(qn('InstitutionName'),         'Cairo University',                               'Institution Name');        if (_cancelled) return;
        await selectField(qs('OversightRightsEntity'), 'Ministry',                                       'Oversight Entity');        if (_cancelled) return;
        await setField(qn('FoundationDate'),           '1908-12-21',                                     'Foundation Date');         if (_cancelled) return;
        await setField(qn('DateOfEstablishment'),      '1925-03-15',                                     'Date of Establishment');   if (_cancelled) return;
        await selectField(qs('ModeOfStudy'),           'On-campus',                                      'Mode of Study');           if (_cancelled) return;
        await selectField(qs('LanguageOfInstruction'), 'Arabic only',                                    'Language of Instruction'); if (_cancelled) return;
        await setField(qn('StartOfTeaching'),          '1909-09-01',                                     'Start of Teaching');       if (_cancelled) return;
        await typeField(qn('PresidentName'),           'Prof. Dr. Mohamed Othman Elkhosht',              'President Name');          if (_cancelled) return;
        await typeField(qn('MailingFullAddress'),      'Cairo University Road, Orman, Giza 12613, Egypt','Mailing Address');         if (_cancelled) return;
        await typeField(qn('DirectPhoneNumber'),       '+20235676105',                                   'Phone Number');            if (_cancelled) return;
        await typeField(qn('EmailAddress'),            'info@cu.edu.eg',                                 'Email Address');           if (_cancelled) return;
        await typeField(qn('InstitutionalWebAddress'), 'https://cu.edu.eg',                              'Website');                 if (_cancelled) return;
        await saveSection('btnSavePublic', 'Public Info');                                                                              if (_cancelled) return;

        // ── 2. Academic Info ─────────────────────────────────────────────
        await sectionHeader('#sec-academic', 'Academic Info');

        // 2a. Institution type + Degrees (same grid row)
        await selectField(qs('TypeOfAcademicInstitution'), 'Governmental', 'Type of Academic Institution'); if (_cancelled) return;
        await clickField(qn('DegreeDiploma'),                               'Degree: Diploma');              if (_cancelled) return;
        await clickField(qn('DegreeBSC'),                                   'Degree: BSc');                  if (_cancelled) return;
        await clickField(qn('DegreeHigherDiploma'),                         'Degree: Higher Diploma');       if (_cancelled) return;
        await clickField(qn('DegreeMaster'),                                'Degree: Master');               if (_cancelled) return;
        await clickField(qn('DegreePhD'),                                   'Degree: PhD');                  if (_cancelled) return;

        // 2b. Official accreditation
        await selectField(qs('OfficialAccreditationQualityInHomeCountry'), 'Yes', 'Accreditation in Home Country'); if (_cancelled) return;

        // 2c. College categories
        await clickField(q('input[data-group="college-categories"][value="Scientific"]'),  'College Category: Scientific');  if (_cancelled) return;
        await clickField(q('input[data-group="college-categories"][value="Humanities"]'),  'College Category: Humanities');  if (_cancelled) return;
        await clickField(q('input[data-group="college-categories"][value="Medical"]'),     'College Category: Medical');     if (_cancelled) return;

        // 2d. Student population
        await setField(qn('LocalStudentPopulation'),     '248200', 'Local Student Population');     if (_cancelled) return;
        await setField(qn('ForeignStudentPopulation'),   '7800',   'Foreign Student Population');   if (_cancelled) return;
        await setField(qn('JordanianStudentPopulation'), '380',    'Jordanian Student Population'); if (_cancelled) return;

        // 2e. Academic staff by rank — count FT → upload FT → count PT → upload PT (page order)
        await fillRankCard('Professor',         'StaffProfessorFullTimeCount',          'StaffProfessorPartTimeCount',          '3200', '450',  'Professor');                          if (_cancelled) return;
        await fillRankCard('AssociateProfessor','StaffAssociateProfessorFullTimeCount', 'StaffAssociateProfessorPartTimeCount', '2800', '380',  'Associate Professor');                if (_cancelled) return;
        await fillRankCard('AssistantProfessor','StaffAssistantProfessorFullTimeCount', 'StaffAssistantProfessorPartTimeCount', '4200', '520',  'Assistant Professor');                if (_cancelled) return;
        await fillRankCard('Teacher',           'StaffTeacherFullTimeCount',            'StaffTeacherPartTimeCount',            '2600', '310',  'Lecturer (PhD Holders)');             if (_cancelled) return;
        await fillRankCard('AssistantTeacher',  'StaffAssistantTeacherFullTimeCount',   'StaffAssistantTeacherPartTimeCount',   '1800', '220',  'Lecturer (MSc Holders)');             if (_cancelled) return;
        await fillRankCard('Others',            'StaffOthersFullTimeCount',             'StaffOthersPartTimeCount',             '950',  '130',  'Assistant Lecturer (MSc Holders)');   if (_cancelled) return;
        await fillRankCard('Researcher',        'StaffResearcherFullTimeCount',         'StaffResearcherPartTimeCount',         '720',  '95',   'Assistant Lecturer (BSc Holders)');   if (_cancelled) return;
        await fillRankCard('PractitionerMsc',   'StaffPractitionerMscFullTimeCount',    'StaffPractitionerMscPartTimeCount',    '380',  '55',   'Practitioner (MSc Holders)');         if (_cancelled) return;
        await fillRankCard('PractitionerPsc',   'StaffPractitionerPscFullTimeCount',    'StaffPractitionerPscPartTimeCount',    '290',  '42',   'Practitioner (BSc Holders)');         if (_cancelled) return;

        // 2f. Educational system
        await clickField(qn('SystemYearlyProgram'),  'System: Yearly Program');  if (_cancelled) return;
        await clickField(qn('SystemSemesterProgram'),'System: Semester');        if (_cancelled) return;
        await clickField(qn('SystemCreditHours'),    'System: Credit Hours');    if (_cancelled) return;

        await saveSection('btnSaveAcademic', 'Academic Info');                                                                         if (_cancelled) return;

        // ── 3. Admission Requirements & Study Duration ───────────────────
        await sectionHeader('#sec-admission-duration', 'Admission Requirements & Study Duration');

        // Duration fields (text inputs, in page order: Diploma, BSc, Higher Diploma, Master, PhD)
        await setField(qn('AdmissionStudy.DiplomaDuration'),       '2 years',          'Diploma Duration');         if (_cancelled) return;
        await setField(qn('AdmissionStudy.BScDuration'),           '4 years',          'BSc Duration');             if (_cancelled) return;
        await setField(qn('AdmissionStudy.HigherDiplomaDuration'), '1 year',           'Higher Diploma Duration');  if (_cancelled) return;
        await setField(qn('AdmissionStudy.MasterDuration'),        '2 years',          'Master Duration');          if (_cancelled) return;
        await setField(qn('AdmissionStudy.PhDDuration'),           '3 years minimum',  'PhD Duration');             if (_cancelled) return;

        // Sample PDF file inputs — attach to UI for visual effect, then save via API directly
        // (bypasses client-side PDF-presence validation which fails silently with DataTransfer)
        const admPdfDefs = [
            ['AdmissionStudy.DiplomaSamplePdf',       'Cairo_Diploma_Admission_Requirements.pdf',        'Diploma Sample PDF'],
            ['AdmissionStudy.BScSamplePdf',           'Cairo_BSc_Admission_Requirements.pdf',            'BSc Sample PDF'],
            ['AdmissionStudy.HigherDiplomaSamplePdf', 'Cairo_Higher_Diploma_Admission_Requirements.pdf', 'Higher Diploma Sample PDF'],
            ['AdmissionStudy.MasterSamplePdf',        'Cairo_Master_Admission_Requirements.pdf',         'Master Sample PDF'],
            ['AdmissionStudy.PhDSamplePdf',           'Cairo_PhD_Admission_Requirements.pdf',            'PhD Sample PDF'],
        ];
        for (const [nm, fn, lbl] of admPdfDefs) {
            await attachFileToInput(qn(nm), makePDF(fn), lbl);
            if (_cancelled) return;
        }

        // Save directly via both admission endpoints — no button click needed
        _setStatus('Saving: Admission Requirements...');
        try {
            await fetch('/Home/AutoSaveDuration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'Duration.DiplomaObtain':       '2 years',
                    'Duration.BachelorObtain':      '4 years',
                    'Duration.HigherDiplomaObtain': '1 year',
                    'Duration.MasterObtain':        '2 years',
                    'Duration.PhDObtain':           '3 years minimum',
                }).toString(),
            });
            const admFd = new FormData();
            admFd.append('diplomaDuration',       '2 years');
            admFd.append('bScDuration',           '4 years');
            admFd.append('higherDiplomaDuration', '1 year');
            admFd.append('masterDuration',        '2 years');
            admFd.append('phdDuration',           '3 years minimum');
            admFd.append('diplomaSamplePdf',       makePDF('Cairo_Diploma_Admission_Requirements.pdf'));
            admFd.append('bScSamplePdf',           makePDF('Cairo_BSc_Admission_Requirements.pdf'));
            admFd.append('higherDiplomaSamplePdf', makePDF('Cairo_Higher_Diploma_Admission_Requirements.pdf'));
            admFd.append('masterSamplePdf',        makePDF('Cairo_Master_Admission_Requirements.pdf'));
            admFd.append('phdSamplePdf',           makePDF('Cairo_PhD_Admission_Requirements.pdf'));
            await fetch('/Home/SaveAdmissionStudyFromUni', { method: 'POST', body: admFd });
        } catch(e) { console.warn('[demo] Admission save failed:', e); }
        showDemoToast('Admission Requirements');
        _setStatus('Saved: Admission Requirements');
        await sleep(100);
        if (_cancelled) return;

        // ── 4. Colleges ──────────────────────────────────────────────────
        await sectionHeader('#sec-faculties', 'Colleges');
        const colleges = [
            { name:'Faculty of Engineering',                           type:'Scientific',  students:18500 },
            { name:'Faculty of Science',                               type:'Scientific',  students:14000 },
            { name:'Faculty of Computers and Artificial Intelligence', type:'Scientific',  students:6000  },
            { name:'Faculty of Pharmacy',                              type:'Scientific',  students:4500  },
            { name:'Faculty of Arts',                                  type:'Humanities',  students:18000 },
            { name:'Faculty of Commerce',                              type:'Humanities',  students:32000 },
            { name:'Faculty of Law',                                   type:'Humanities',  students:22000 },
            { name:'Faculty of Medicine (Kasr Alaini)',                type:'Medical',     students:7500  },
            { name:'Faculty of Oral and Dental Medicine',              type:'Medical',     students:2200  },
            { name:'Faculty of Veterinary Medicine',                   type:'Medical',     students:3100  },
        ];
        for (const col of colleges) {
            if (_cancelled) return;
            _setStatus(`Adding College: ${col.name}`);
            try {
                const res = await fetch('/Home/FacultiesAdd', {
                    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
                    body: new URLSearchParams({ facultyName:col.name, collegeType:col.type, studentsCount:String(col.students) }).toString(),
                });
                const c = qi('faculties-container');
                if (c) c.innerHTML = await res.text();
            } catch(e) { console.warn('[demo] College failed:', col.name); }
            await sleep(250);
        }

        // ── 5. Programs ──────────────────────────────────────────────────
        await sectionHeader('#sec-programs', 'Programs');
        const progContainer = qi('programs-container');
        if (progContainer) {
            try { progContainer.innerHTML = await (await fetch('/Home/ProgramsPartial')).text(); } catch(e) {}
            await sleep(100);
        }
        const buildFacultyMap = () => {
            const map = {};
            const sel = qi('prg_faculty');
            if (sel) Array.from(sel.options).forEach(o => { if (o.value) map[o.text.trim()] = o.value; });
            return map;
        };
        let facMap = buildFacultyMap();
        const progAddUrl = progContainer?.getAttribute('data-add-url') || '/Home/ProgramsAdd';
        const programs = [
            { program:'Civil Engineering',              faculty:'Faculty of Engineering',                           degree:'BSc',    years:'5', system:'Semester', acc:'2002-06-01', gradlast:'2024-06-30' },
            { program:'Architecture',                   faculty:'Faculty of Engineering',                           degree:'BSc',    years:'5', system:'Semester', acc:'2002-06-01', gradlast:'2024-06-30' },
            { program:'Computer Science',               faculty:'Faculty of Computers and Artificial Intelligence', degree:'BSc',    years:'4', system:'Semester', acc:'2009-06-01', gradlast:'2024-06-30' },
            { program:'Artificial Intelligence',        faculty:'Faculty of Computers and Artificial Intelligence', degree:'BSc',    years:'4', system:'Semester', acc:'2018-06-01', gradlast:'2024-06-30' },
            { program:'Medicine (MBBCh)',               faculty:'Faculty of Medicine (Kasr Alaini)',                degree:'BSc',    years:'6', system:'Yearly',   acc:'1998-06-01', gradlast:'2024-06-30' },
            { program:'Pharmacy',                       faculty:'Faculty of Pharmacy',                             degree:'BSc',    years:'5', system:'Semester', acc:'2003-06-01', gradlast:'2024-06-30' },
            { program:'Business Administration',        faculty:'Faculty of Commerce',                             degree:'BSc',    years:'4', system:'Semester', acc:'2004-06-01', gradlast:'2024-06-30' },
            { program:'MBA',                            faculty:'Faculty of Commerce',                             degree:'Master', years:'2', system:'Semester', acc:'2010-06-01', gradlast:'2023-06-30' },
            { program:'PhD in Engineering',             faculty:'Faculty of Engineering',                          degree:'PhD',    years:'3', system:'Semester', acc:'2005-06-01', gradlast:'2023-06-30' },
        ];
        for (const prog of programs) {
            if (_cancelled) return;
            _setStatus(`Adding Program: ${prog.program}`);
            const fId = facMap[prog.faculty];
            if (!fId) { console.warn('[demo] Faculty not found:', prog.faculty); continue; }
            try {
                const res = await fetch(progAddUrl, {
                    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
                    body: new URLSearchParams({ program:prog.program, facultyId:fId, degreeAwarded:prog.degree, numberOfYears:prog.years, educationalSystem:prog.system, accreditationDate:prog.acc, graduationDateOfLastRegiment:prog.gradlast }).toString(),
                });
                if (progContainer) { progContainer.innerHTML = await res.text(); facMap = buildFacultyMap(); }
            } catch(e) { console.warn('[demo] Program failed:', prog.program); }
            await sleep(250);
        }

        // ── 6. Medicine & Dentistry ──────────────────────────────────────
        await sectionHeader('#sec-med', 'Medicine & Dentistry Colleges');
        const medFields = [
            // ── Total Students ──────────────────────────────────────────
            ['med_totalStudents',                       '7500', 'Medicine: Total Students'],
            ['den_totalStudents',                       '2200', 'Dentistry: Total Students'],
            // ── Professor ───────────────────────────────────────────────
            ['med_fullTimeProfessor',                    '280', 'Medicine: Professor (FT)'],
            ['med_partTimeClinicalProfessor',             '45', 'Medicine: Professor (PT)'],
            ['den_fullTimeProfessor',                     '48', 'Dentistry: Professor (FT)'],
            ['den_partTimeClinicalProfessor',              '8', 'Dentistry: Professor (PT)'],
            // ── Associate Professor ──────────────────────────────────────
            ['med_fullTimeAssociateProfessor',           '350', 'Medicine: Associate Professor (FT)'],
            ['med_partTimeClinicalAssociateProfessor',    '60', 'Medicine: Associate Professor (PT)'],
            ['den_fullTimeAssociateProfessor',            '62', 'Dentistry: Associate Professor (FT)'],
            ['den_partTimeClinicalAssociateProfessor',    '10', 'Dentistry: Associate Professor (PT)'],
            // ── Assistant Professor ──────────────────────────────────────
            ['med_fullTimeAssistantProfessor',           '520', 'Medicine: Assistant Professor (FT)'],
            ['med_partTimeClinicalAssistantProfessor',    '85', 'Medicine: Assistant Professor (PT)'],
            ['den_fullTimeAssistantProfessor',            '96', 'Dentistry: Assistant Professor (FT)'],
            ['den_partTimeClinicalAssistantProfessor',    '15', 'Dentistry: Assistant Professor (PT)'],
            // ── Lecturer (PhD) ───────────────────────────────────────────
            ['med_fullTimeLecturerPhd',                  '180', 'Medicine: Lecturer PhD (FT)'],
            ['med_partTimeClinicalLecturerPhd',            '30', 'Medicine: Lecturer PhD (PT)'],
            ['den_fullTimeLecturerPhd',                   '42', 'Dentistry: Lecturer PhD (FT)'],
            ['den_partTimeClinicalLecturerPhd',             '7', 'Dentistry: Lecturer PhD (PT)'],
            // ── Assistant Lecturer (PhD) ─────────────────────────────────
            ['med_fullTimeAssistantLecturerPhd',          '95', 'Medicine: Asst Lecturer PhD (FT)'],
            ['med_partTimeClinicalAssistantLecturerPhd',  '20', 'Medicine: Asst Lecturer PhD (PT)'],
            ['den_fullTimeAssistantLecturerPhd',          '28', 'Dentistry: Asst Lecturer PhD (FT)'],
            ['den_partTimeClinicalAssistantLecturerPhd',   '5', 'Dentistry: Asst Lecturer PhD (PT)'],
            // ── Lecturer (MSc) ───────────────────────────────────────────
            ['med_fullTimeLecturerMsc',                  '210', 'Medicine: Lecturer MSc (FT)'],
            ['den_fullTimeLecturerMsc',                   '55', 'Dentistry: Lecturer MSc (FT)'],
            // ── Assistant Lecturer (MSc) ─────────────────────────────────
            ['med_fullTimeAssistantLecturerMsc',         '145', 'Medicine: Asst Lecturer MSc (FT)'],
            ['den_fullTimeAssistantLecturerMsc',          '38', 'Dentistry: Asst Lecturer MSc (FT)'],
            // ── Practitioner (BSc) ───────────────────────────────────────
            ['med_fullTimePractitionerPsc',              '380', 'Medicine: Practitioner BSc (FT)'],
            ['den_fullTimePractitionerPsc',               '85', 'Dentistry: Practitioner BSc (FT)'],
            // ── Practitioner (MSc) ───────────────────────────────────────
            ['med_fullTimePractitionerMsc',              '160', 'Medicine: Practitioner MSc (FT)'],
            ['den_fullTimePractitionerMsc',               '32', 'Dentistry: Practitioner MSc (FT)'],
        ];
        for (const [id, val, lbl] of medFields) {
            await setField(qi(id), val, lbl);
            if (_cancelled) return;
        }
        if (typeof w.MedDenSave === 'function') { _setStatus('Saving Medicine & Dentistry...'); await w.MedDenSave(); showDemoToast('Medicine & Dentistry'); await sleep(100); }
        if (_cancelled) return;

        // ── 7. Hospitals ─────────────────────────────────────────────────
        await sectionHeader('#sec-hosp', 'Hospitals');
        const hospitals = [
            { name:'Kasr Al-Ainy Hospital',                        spec:'Medicine',  beds:1500, dental:0   },
            { name:'New Kasr Al-Ainy Teaching Hospital',           spec:'Medicine',  beds:900,  dental:0   },
            { name:"Cairo University Children's Hospital",         spec:'Medicine',  beds:350,  dental:0   },
            { name:'Faculty of Oral and Dental Medicine Hospital', spec:'Dentistry', beds:0,    dental:280 },
        ];
        for (const h of hospitals) {
            if (_cancelled) return;
            // Re-find form elements each iteration — container re-renders after every add
            const nameEl  = qi('hosp_fac_name');
            const specEl  = qi('hosp_fac_specialization');
            const bedsEl  = qi('hosp_fac_beds');
            const dentalEl = qi('hosp_fac_dental');
            const fileEl  = qi('hosp_fac_agreement_files');
            const addBtn  = qi('hosp_fac_addBtn');

            await typeField(nameEl, h.name, `Hospital Name: ${h.name}`);
            if (_cancelled) return;

            await selectField(specEl, h.spec, `Specialization: ${h.spec}`);
            if (_cancelled) return;
            await sleep(100);  // wait for HospFacilityToggleCapacity() to show/hide inputs

            if (h.beds && (h.spec === 'Medicine' || h.spec === 'Both')) {
                await setField(bedsEl, String(h.beds), 'Bed Capacity');
                if (_cancelled) return;
            }
            if (h.dental && (h.spec === 'Dentistry' || h.spec === 'Both')) {
                await setField(dentalEl, String(h.dental), 'Dental Chair Capacity');
                if (_cancelled) return;
            }

            const pdfName = `Cairo_${h.name.replace(/[^a-zA-Z0-9]/g,'_')}_Agreement.pdf`;
            await attachFileToInput(fileEl, makePDF(pdfName), 'Agreement PDF');
            if (_cancelled) return;

            // Click Add and wait for AJAX re-render
            if (addBtn) {
                _setStatus(`Adding Hospital: ${h.name}`);
                await scrollToField(addBtn);
                await highlight(addBtn);
                addBtn.click();
                await sleep(400);
                unhighlight(addBtn);
            }
        }

        // ── 8. Infrastructure ────────────────────────────────────────────
        await sectionHeader('#sec-infra', 'Infrastructure');
        await setField(qi('infra_areaKm2'),        '7.2',  'Campus Area (km²)');   if (_cancelled) return;
        await setField(qi('infra_campusesCount'),   '6',    'Number of Campuses');  if (_cancelled) return;
        await setField(qi('infra_classroomsCount'), '1400', 'Classrooms');          if (_cancelled) return;
        await setField(qi('infra_librariesCount'),  '26',   'Libraries');           if (_cancelled) return;
        await setField(qi('infra_stadiumsCount'),   '5',    'Stadiums');            if (_cancelled) return;
        await saveSection('btnSaveInfrastructure', 'Infrastructure');                                                                   if (_cancelled) return;

        // ── 9. Laboratories ──────────────────────────────────────────────
        await sectionHeader('#sec-labs', 'Laboratories');
        const labs = [
            { category:'Scientific',  computers:2800, labs:420 },
            { category:'Humanities',  computers:950,  labs:52  },
            { category:'Medical',     computers:1200, labs:240 },
        ];
        for (const row of labs) {
            if (_cancelled) return;
            // Re-find each iteration — table re-renders after every Add
            await selectField(qi('lab_facultyId'), row.category, `College: ${row.category}`);
            if (_cancelled) return;
            await typeField(qi('lab_computers'), String(row.computers), `Computers: ${row.computers}`);
            if (_cancelled) return;
            await typeField(qi('lab_laboratories'), String(row.labs), `Laboratories: ${row.labs}`);
            if (_cancelled) return;

            const labAddBtn = qi('lab_addBtn');
            if (labAddBtn) {
                _setStatus(`Adding: ${row.category} Laboratories`);
                await scrollToField(labAddBtn);
                await highlight(labAddBtn);
                labAddBtn.click();
                await sleep(350);
                unhighlight(labAddBtn);
            }
        }

        // ── 10. Library ──────────────────────────────────────────────────
        await sectionHeader('#sec-library', 'Library');
        await setField(qi('lib_area'),               '15000',  'Library Area (m²)');    if (_cancelled) return;
        await setField(qi('lib_capacity'),           '4000',   'Seating Capacity');     if (_cancelled) return;
        await setField(qi('lib_numberOfBooks'),      '950000', 'Number of Books');      if (_cancelled) return;
        await setField(qi('lib_paperJournals'),      '14000',  'Paper Journals');       if (_cancelled) return;
        await setField(qi('lib_electronicBooks'),    '380000', 'Electronic Books');     if (_cancelled) return;
        await setField(qi('lib_electronicJournals'), '52000',  'Electronic Journals');  if (_cancelled) return;
        if (typeof w.LibrarySave === 'function') { _setStatus('Saving Library...'); await w.LibrarySave(); showDemoToast('Library'); await sleep(100); }
        if (_cancelled) return;

        // ── 11. Photos / Media ───────────────────────────────────────────
        await sectionHeader('#sec-pictures', 'Photos / Media');
        const photos = [
            { cardId:'library',      subject:'Library photos',      label:'Library Photos'      },
            { cardId:'hospital',     subject:'Hospital photos',     label:'Hospital Photos'     },
            { cardId:'faculties',    subject:'Colleges photos',     label:'Colleges Photos'     },
            { cardId:'laboratories', subject:'Laboratories photos', label:'Laboratories Photos' },
            { cardId:'facilities',   subject:'Facilities photos',   label:'Facilities Photos'   },
        ];
        for (const p of photos) {
            if (_cancelled) return;
            _setStatus(`Choosing file: ${p.label}`);

            // Scroll to and highlight the visible drop zone
            const dropZone  = qi(`drop_${p.cardId}`);
            const fileInput = qi(`input_${p.cardId}`);

            if (dropZone) {
                await scrollToField(dropZone);
                await highlight(dropZone);
            }

            // Attach file to hidden input → fires PictureOnFileChange → filename appears in card
            if (fileInput) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(makePDF(`Cairo_${p.subject.replace(/ /g,'_')}.pdf`));
                    fileInput.files = dt.files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                } catch(e) {}
            }
            await sleep(120);
            if (dropZone) unhighlight(dropZone);
            if (_cancelled) return;

            // Find and click the Upload button inside this card
            const card = q(`.pic-upload-card[data-card-id="${p.cardId}"]`);
            const uploadBtn = card?.querySelector('.btn-primary');
            if (uploadBtn) {
                _setStatus(`Uploading: ${p.label}`);
                await scrollToField(uploadBtn);
                await highlight(uploadBtn);
                uploadBtn.click();
                await sleep(350);
                unhighlight(uploadBtn);
            }
            showDemoToast(p.label);
            if (_cancelled) return;
        }

        // ── 12. University Recognition & Accreditation ───────────────────
        await sectionHeader('#sec-uni-rec-accr', 'University Recognition & Accreditation');

        // ── 12a. Accreditation Bodies ────────────────────────────────────
        const accrBodies = [
            { name:'National Authority for Quality Assurance and Accreditation of Education (NAQAAE)', type:'Local'         },
            { name:'Arab Network for Quality Assurance in Higher Education (ANQAHE)',                   type:'Regional'      },
            { name:'Association of Arab Universities (AArU)',                                           type:'Regional'      },
            { name:'QS World University Rankings — Quacquarelli Symonds',                              type:'International' },
        ];
        for (const body of accrBodies) {
            if (_cancelled) return;
            // Re-find each iteration — container re-renders after every Add
            await typeField(qi('accb_bodyName'), body.name, `Body Name: ${body.name}`);
            if (_cancelled) return;
            await selectField(qi('accb_type'), body.type, `Type: ${body.type}`);
            if (_cancelled) return;
            await attachFileToInput(qi('accb_pdf'), makePDF(`Cairo_Accreditation_${body.type}.pdf`), 'Accreditation PDF');
            if (_cancelled) return;

            const addBtn = qi('accb_addBtn');
            if (addBtn) {
                _setStatus(`Adding body: ${body.name}`);
                await scrollToField(addBtn);
                await highlight(addBtn);
                addBtn.click();
                await sleep(350);
                unhighlight(addBtn);
            }
        }

        // ── 12b. Local Recognition document ─────────────────────────────
        if (_cancelled) return;
        const recogInput  = qi('ura_docs_local_recognition');
        const recogLabel  = recogInput ? document.querySelector('label[for="ura_docs_local_recognition"]') : null;
        const recogHint   = qi('ura_recog_hint');
        const recogUpload = recogInput?.closest('.ura-card')?.querySelector('.ura-submit-btn');

        if (recogLabel) {
            _setStatus('Attaching: Local Recognition Certificate');
            await scrollToField(recogLabel);
            await highlight(recogLabel);
        }
        if (recogInput) {
            try {
                const dt = new DataTransfer();
                dt.items.add(makePDF('Cairo_NAQAAE_Recognition_Certificate.pdf'));
                recogInput.files = dt.files;
                recogInput.dispatchEvent(new Event('change', { bubbles: true }));
                if (recogHint) recogHint.textContent = 'Cairo_NAQAAE_Recognition_Certificate.pdf';
            } catch(e) {}
        }
        await sleep(120);
        if (recogLabel) unhighlight(recogLabel);
        if (_cancelled) return;

        if (recogUpload) {
            _setStatus('Uploading: Local Recognition Certificate');
            await scrollToField(recogUpload);
            await highlight(recogUpload);
            recogUpload.click();
            await sleep(350);
            unhighlight(recogUpload);
            showDemoToast('Local Recognition');
        }
        if (_cancelled) return;

        // ── 12c. Accreditation document ──────────────────────────────────
        const accredType  = qi('ura_docs_accreditation_type');
        const accredInput = qi('ura_docs_accreditation');
        const accredLabel = accredInput ? document.querySelector('label[for="ura_docs_accreditation"]') : null;
        const accredHint  = qi('ura_accred_hint');
        const accredUpload = accredInput?.closest('.ura-card')?.querySelector('.ura-submit-btn');

        if (accredType) {
            await selectField(accredType, 'Local', 'Accreditation Type');
            if (_cancelled) return;
        }
        if (accredLabel) {
            _setStatus('Attaching: Local Accreditation Certificate');
            await scrollToField(accredLabel);
            await highlight(accredLabel);
        }
        if (accredInput) {
            try {
                const dt = new DataTransfer();
                dt.items.add(makePDF('Cairo_Local_Accreditation_Certificate.pdf'));
                accredInput.files = dt.files;
                accredInput.dispatchEvent(new Event('change', { bubbles: true }));
                if (accredHint) accredHint.textContent = 'Cairo_Local_Accreditation_Certificate.pdf';
            } catch(e) {}
        }
        await sleep(120);
        if (accredLabel) unhighlight(accredLabel);
        if (_cancelled) return;

        if (accredUpload) {
            _setStatus('Uploading: Local Accreditation Certificate');
            await scrollToField(accredUpload);
            await highlight(accredUpload);
            accredUpload.click();
            await sleep(350);
            unhighlight(accredUpload);
            showDemoToast('Local Accreditation');
        }
        if (typeof w.LoadUniversityRecognitionAccreditationSection === 'function') {
            await w.LoadUniversityRecognitionAccreditationSection();
        }

        // ── 13. Finish & Submit ──────────────────────────────────────────
        await sectionHeader('#sec-submit-application', 'Finish & Submit');
        if (typeof w.LoadSubmitApplicationSection === 'function') { await w.LoadSubmitApplicationSection(); await sleep(150); }
        await typeField(qi('subapp_name'),      'Prof. Dr. Mohamed Othman Elkhosht',         'Applicant Name'); if (_cancelled) return;
        await typeField(qi('subapp_workplace'), 'Office of the President, Cairo University', 'Work Place');     if (_cancelled) return;
        const addNote = qi('subapp_additional_note');
        if (addNote) { await typeField(addNote, 'All information provided is accurate and complete as of the 2024–2025 academic year.', 'Additional Notes'); if (_cancelled) return; }
        const ack = qi('subapp_ack');
        if (ack) await clickField(ack, 'Acknowledgement');

        if (!_cancelled) { _setStatus('Done ✓'); showToast('Demo data filled successfully. Click Submit when ready.'); }
    };

    // ════════════════════════════════════════════════════════════════════════
    //  POSTGRADUATE  —  window.demoFillPostgraduateApplicationExplainable()
    // ════════════════════════════════════════════════════════════════════════
    w.demoFillPostgraduateApplicationExplainable = async function () {
        _cancelled = false;

        // ── 2. Programs offered ──────────────────────────────────────────
        await sectionHeader('#sec-programs', 'Postgraduate Programs Offered');
        await clickField(qi('chkMaster'),  'Master Programs');         if (_cancelled) return;
        await clickField(qi('chkPhD'),     'PhD Programs');            if (_cancelled) return;
        await clickField(qi('chkDiploma'), 'Higher Diploma Programs'); if (_cancelled) return;

        const pgPrograms = {
            master: [
                { name:'Master of Business Administration (MBA)', college:'Faculty of Commerce' },
                { name:'Computer Science',                         college:'Faculty of Computers and Artificial Intelligence' },
                { name:'International Law',                        college:'Faculty of Law' },
            ],
            phd: [
                { name:'PhD in Computer Science',        college:'Faculty of Computers and Artificial Intelligence' },
                { name:'PhD in Business Administration', college:'Faculty of Commerce' },
            ],
            diploma: [
                { name:'Hospital Pharmacy',        college:'Faculty of Pharmacy' },
                { name:'Higher Diploma in Education', college:'Faculty of Education' },
            ],
        };

        for (const [level, programs] of Object.entries(pgPrograms)) {
            for (const prog of programs) {
                if (_cancelled) return;

                // Click "+ Add [Level] Program" to open the form
                const addBtn = qi(`pgAddBtn_${level}`);
                if (addBtn) {
                    _setStatus(`Opening form: ${level}`);
                    await scrollToField(addBtn);
                    await highlight(addBtn);
                    addBtn.click();
                    await sleep(150);
                    unhighlight(addBtn);
                }

                // Type program name and college into the now-visible form
                await typeField(qi(`pgPName_${level}`),    prog.name,    `${level} Program Name`); if (_cancelled) return;
                await typeField(qi(`pgPCollege_${level}`), prog.college, `${level} College`);       if (_cancelled) return;

                // Click "Save Program" inside the panel
                const saveBtn = qi(`pgAddPanel_${level}`)?.querySelector('.btn-primary');
                if (saveBtn) {
                    _setStatus(`Saving: ${prog.name}`);
                    await scrollToField(saveBtn);
                    await highlight(saveBtn);
                    saveBtn.click();
                    await sleep(200);
                    unhighlight(saveBtn);
                }
            }
        }
        await saveSection('btnSavePrograms', 'Programs');                                                                               if (_cancelled) return;

        // ── 3. Number of students ────────────────────────────────────────
        await sectionHeader('#sec-students', 'Number of Students');
        await setField(qn('MasterStudents'),  '22400', 'Master Students');  if (_cancelled) return;
        await setField(qn('PhDStudents'),     '7800',  'PhD Students');     if (_cancelled) return;
        await setField(qn('DiplomaStudents'), '5200',  'Diploma Students'); if (_cancelled) return;
        await saveSection('btnSaveStudents', 'Number of Students');                                                                     if (_cancelled) return;

        // ── 4. Academic staff ────────────────────────────────────────────
        await sectionHeader('#sec-faculty', 'Academic Staff');
        await setField(qn('MasterProfessor'),   '1400', 'Master: Professor');             if (_cancelled) return;
        await setField(qn('MasterAssociate'),   '1100', 'Master: Associate Professor');   if (_cancelled) return;
        await setField(qn('MasterAssistant'),   '1250', 'Master: Assistant Professor');   if (_cancelled) return;
        await setField(qn('PhDProfessor'),       '950', 'PhD: Professor');                if (_cancelled) return;
        await setField(qn('PhDAssociate'),       '720', 'PhD: Associate Professor');      if (_cancelled) return;
        await setField(qn('PhDAssistant'),       '780', 'PhD: Assistant Professor');      if (_cancelled) return;
        await setField(qn('DiplomaProfessor'),   '480', 'Diploma: Professor');            if (_cancelled) return;
        await setField(qn('DiplomaAssociate'),   '360', 'Diploma: Associate Professor');  if (_cancelled) return;
        await setField(qn('DiplomaAssistant'),   '420', 'Diploma: Assistant Professor');  if (_cancelled) return;
        await saveSection('btnSaveFaculty', 'Academic Staff');                                                                          if (_cancelled) return;

        if (!_cancelled) { _setStatus('Done ✓'); showToast('Demo data filled successfully. Click Submit when ready.'); }
    };

    // ════════════════════════════════════════════════════════════════════════
    //  ONLINE  —  window.demoFillOnlineApplicationExplainable()
    // ════════════════════════════════════════════════════════════════════════
    w.demoFillOnlineApplicationExplainable = async function () {
        _cancelled = false;

        // ── 2. Online Programs ───────────────────────────────────────────
        await sectionHeader('#sec-programs', 'Online Programs');
        _setStatus('Adding online programs...');
        if (typeof w.devFillOnlinePrograms === 'function') {
            w.devFillOnlinePrograms([
                { ProgramName:'Business Administration',           DegreeLevel:'Bachelor', Source:'Bachelor',     CollegeOrFaculty:'Faculty of Commerce',                            DeliveryMode:'Blended', OnlineStudents:2100, category:'Bachelor',    isManual:true },
                { ProgramName:'Computer Science',                  DegreeLevel:'Bachelor', Source:'Bachelor',     CollegeOrFaculty:'Faculty of Computers and Artificial Intelligence', DeliveryMode:'Blended', OnlineStudents:1200, category:'Bachelor',    isManual:true },
                { ProgramName:'Law',                               DegreeLevel:'Bachelor', Source:'Bachelor',     CollegeOrFaculty:'Faculty of Law',                                 DeliveryMode:'Blended', OnlineStudents:850,  category:'Bachelor',    isManual:true },
                { ProgramName:'Master of Business Administration', DegreeLevel:'Master',   Source:'Postgraduate', CollegeOrFaculty:'Faculty of Commerce',                            DeliveryMode:'Blended', OnlineStudents:520,  category:'Postgraduate', isManual:true },
            ]);
        }
        await sleep(SECTION_DELAY);
        showDemoToast('Online Programs'); if (_cancelled) return;

        // ── 3. Numbers ───────────────────────────────────────────────────
        await sectionHeader('#sec-numbers', 'Recognition Numbers');
        await setField(qi('hTotalStudents'), '7200', 'Total Online Students'); if (_cancelled) return;
        await setField(qi('hBachProf'),       '420', 'Bachelor: Professors');  if (_cancelled) return;
        await setField(qi('hBachAssoc'),      '360', 'Bachelor: Associates');  if (_cancelled) return;
        await setField(qi('hPgProf'),         '210', 'Postgrad: Professors');  if (_cancelled) return;
        await setField(qi('hPgAssoc'),        '165', 'Postgrad: Associates');  if (_cancelled) return;
        showDemoToast('Recognition Numbers'); if (_cancelled) return;

        // ── 4. Communication ─────────────────────────────────────────────
        await sectionHeader('#sec-communication', 'Communication');
        await clickField(q('input[name="CommunicationType"][value="Both"]'), 'Communication Type: Both'); if (_cancelled) return;
        for (const m of ['Video Meetings', 'Email', 'Discussion Forums', 'Chat / Messaging', 'LMS Internal Messaging']) {
            const cb = q(`.comm-chk[value="${m}"]`);
            if (cb) { await clickField(cb, `Method: ${m}`); if (_cancelled) return; }
        }
        if (typeof w.updateCsv === 'function') w.updateCsv('comm-chk', 'commCsv');
        showDemoToast('Communication'); if (_cancelled) return;

        // ── 5. Examination ───────────────────────────────────────────────
        await sectionHeader('#sec-exam', 'Examination System');
        await clickField(q('input[name="ExamType"][value="Hybrid Exams"]'), 'Exam Type: Hybrid Exams'); if (_cancelled) return;
        const examLocEl = qi('ExamLocations') || q('[name$="ExamLocations"]');
        if (examLocEl) { await typeField(examLocEl, 'Cairo University main campus (Giza); Regional exam centres in Cairo, Alexandria, Mansoura, and Assiut.', 'Exam Locations'); if (_cancelled) return; }
        const onlineFlds = qi('onlineExamFields');
        if (onlineFlds) onlineFlds.style.display = 'block';
        await clickField(q('input[name="OnlineExamsOfficiallyApproved"][value="true"]'), 'Online Exams Officially Approved'); if (_cancelled) return;
        for (const m of ['Live Remote Proctoring', 'Camera Monitoring', 'Browser Lockdown']) {
            const cb = q(`.proctor-chk[value="${m}"]`);
            if (cb) { await clickField(cb, `Proctoring: ${m}`); if (_cancelled) return; }
        }
        if (typeof w.updateCsv === 'function') w.updateCsv('proctor-chk', 'proctorCsv');
        showDemoToast('Examination System'); if (_cancelled) return;

        // ── 6. Learning Platform ─────────────────────────────────────────
        await sectionHeader('#sec-platform', 'Learning Platform');
        const pnEl = qi('PlatformName')    || q('[name$="PlatformName"]');
        const puEl = qi('PlatformUrl')     || q('[name$="PlatformUrl"]');
        const ruEl = qi('ResponsibleUnit') || q('[name$="ResponsibleUnit"]');
        const ptEl = q('select[id="PlatformType"]') || q('select[name$="PlatformType"]');
        if (pnEl) { await typeField(pnEl,  'Moodle (Cairo University E-Learning Portal)',         'Platform Name');     if (_cancelled) return; }
        if (puEl) { await typeField(puEl,  'https://elearning.cu.edu.eg',                         'Platform URL');      if (_cancelled) return; }
        if (ruEl) { await typeField(ruEl,  'Centre for Open Education (COE) — Cairo University',  'Responsible Unit');  if (_cancelled) return; }
        if (ptEl) { await selectField(ptEl,'Dedicated e-learning / IT unit',                      'Platform Type');     if (_cancelled) return; }
        await clickField(q('input[name="PlatformOfficiallyAdopted"][value="true"]'), 'Platform Officially Adopted'); if (_cancelled) return;
        for (const nm of ['TechnicalSupportAvailable','HasPrivacyPolicy','IsUniversityOwned']) {
            const cb = q(`[id$="${nm}"]`) || q(`[name$="${nm}"]`);
            if (cb && cb.type === 'checkbox' && !cb.checked) { await clickField(cb, nm); if (_cancelled) return; }
        }
        const unEl = qi('PlatformUsername') || q('[name$="PlatformUsername"]');
        if (unEl) { await typeField(unEl, 'reviewer@coe.cu.edu.eg', 'Test Account Username'); if (_cancelled) return; }
        const pwEl = qi('PlatformPassword') || q('[name$="PlatformPassword"]');
        if (pwEl) { await typeField(pwEl, 'Review@2024!', 'Test Account Password'); if (_cancelled) return; }
        const lmsEl = q('[name$="LmsAccessNotes"]') || q('textarea[id*="LmsAccess"]');
        if (lmsEl) { await typeField(lmsEl, 'Contact COE helpdesk at coe@cu.edu.eg for reviewer access and orientation materials.', 'LMS Access Notes'); if (_cancelled) return; }
        showDemoToast('Learning Platform'); if (_cancelled) return;

        // ── 7. Supporting Documents ──────────────────────────────────────
        await sectionHeader('#sec-documents', 'Supporting Documents');
        const secDocs = q('#sec-documents');
        const fileInputs = secDocs ? secDocs.querySelectorAll('input[type="file"]') : [];
        const examDocInput = fileInputs[0] || qi('ExamPolicyFile');
        const platDocInput = fileInputs[1] || qi('PlatformGuideFile');
        if (examDocInput) { await attachFileToInput(examDocInput, makePDF('Cairo_Online_Examination_Policy.pdf'), 'Exam Policy Document'); if (_cancelled) return; }
        if (platDocInput) { await attachFileToInput(platDocInput, makePDF('Cairo_LMS_Platform_User_Guide.pdf'), 'Platform Guide Document'); if (_cancelled) return; }
        const docsSaveBtn = secDocs ? secDocs.querySelector('.btn-primary') : null;
        if (docsSaveBtn) {
            _setStatus('Saving: Supporting Documents');
            await scrollToField(docsSaveBtn); await highlight(docsSaveBtn);
            docsSaveBtn.click(); await sleep(200); unhighlight(docsSaveBtn);
        }
        showDemoToast('Supporting Documents'); if (_cancelled) return;

        if (!_cancelled) { _setStatus('Done ✓'); }
    };

    // ── Stop / Pause / Continue ───────────────────────────────────────────
    w.stopDemoFill = function () {
        _cancelled = true;
        _paused    = false;
        if (_resumeResolve) { _resumeResolve(); _resumeResolve = null; }
        document.querySelectorAll('.demo-active-field').forEach(el => el.classList.remove('demo-active-field'));
        _setStatus('Stopped.');
    };

    w.pauseDemoFill = function () {
        _paused = true;
        _setStatus('Paused — click Continue to resume.');
    };

    w.continueDemoFill = function () {
        _paused = false;
        if (_resumeResolve) { _resumeResolve(); _resumeResolve = null; }
        _setStatus('Resuming...');
    };

    // ── Widget ────────────────────────────────────────────────────────────
    function createWidget(fillFn, title) {
        // ─── Embedded widget ───────────────────────────────────────────
        const wrap = document.createElement('div');
        Object.assign(wrap.style, {
            marginTop:'18px', background:'#fff5f5', border:'2px solid #b51b3b',
            borderRadius:'12px', padding:'14px 18px', display:'flex',
            flexDirection:'column', gap:'10px', fontFamily:'system-ui,sans-serif',
            width:'100%', boxSizing:'border-box',
        });

        const hd = document.createElement('div');
        hd.textContent = `🎬 ${title}`;
        Object.assign(hd.style, { color:'#b51b3b', fontWeight:'700', fontSize:'13px' });

        const statusEl = document.createElement('div');
        statusEl.textContent = 'Ready — click the button below to start.';
        Object.assign(statusEl.style, { color:'#555', fontSize:'12px', fontStyle:'italic', minHeight:'16px' });

        const row = document.createElement('div');
        Object.assign(row.style, { display:'flex', gap:'8px', flexWrap:'wrap' });

        // Start button — visible only when idle
        const startBtn = document.createElement('button');
        startBtn.textContent = '▶ Demo Fill';
        Object.assign(startBtn.style, {
            background:'#b51b3b', color:'#fff', border:'none', borderRadius:'8px',
            padding:'8px 14px', cursor:'pointer', fontWeight:'700', fontSize:'13px', flex:'1',
        });

        // Fill All button — instant mode, no animations
        const fillAllBtn = document.createElement('button');
        fillAllBtn.textContent = '⚡ Fill All';
        Object.assign(fillAllBtn.style, {
            background:'#1e293b', color:'#fff', border:'none', borderRadius:'8px',
            padding:'8px 14px', cursor:'pointer', fontWeight:'700', fontSize:'13px', flex:'1',
        });
        fillAllBtn.title = 'Fill all sections instantly with no animation';

        // Pause / Continue toggle — visible when running or paused
        const pauseBtn = document.createElement('button');
        pauseBtn.textContent = '⏸ Pause';
        Object.assign(pauseBtn.style, {
            background:'#f59e0b', color:'#fff', border:'none', borderRadius:'8px',
            padding:'8px 14px', cursor:'pointer', fontWeight:'700', fontSize:'13px',
            display:'none', flex:'1',
        });

        // Cancel button — visible when running or paused
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '✕ Cancel';
        Object.assign(cancelBtn.style, {
            background:'#fff', color:'#b51b3b', border:'2px solid #b51b3b',
            borderRadius:'8px', padding:'8px 14px', cursor:'pointer',
            fontWeight:'700', fontSize:'13px', display:'none',
        });

        // ─── Floating control bar ──────────────────────────────────────
        const floatBar = document.createElement('div');
        Object.assign(floatBar.style, {
            position:'fixed', bottom:'24px', right:'24px', zIndex:'99999',
            background:'#fff', border:'2px solid #b51b3b', borderRadius:'14px',
            padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px',
            boxShadow:'0 4px 24px rgba(181,27,59,0.18)', fontFamily:'system-ui,sans-serif',
            maxWidth:'340px', minWidth:'180px',
        });

        const floatDot = document.createElement('span');
        floatDot.textContent = '●';
        Object.assign(floatDot.style, { color:'#b51b3b', fontSize:'10px', flexShrink:'0' });

        const floatStatus = document.createElement('span');
        floatStatus.textContent = 'Demo Fill Ready';
        Object.assign(floatStatus.style, {
            color:'#555', fontSize:'12px', fontStyle:'italic', flex:'1',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        });

        // Floating pause/continue button
        const floatPauseBtn = document.createElement('button');
        floatPauseBtn.textContent = '⏸';
        Object.assign(floatPauseBtn.style, {
            background:'#f59e0b', color:'#fff', border:'none', borderRadius:'7px',
            padding:'5px 11px', fontWeight:'700', fontSize:'13px',
            cursor:'pointer', flexShrink:'0', display:'none',
        });

        // Floating cancel button
        const floatCancelBtn = document.createElement('button');
        floatCancelBtn.textContent = '✕';
        Object.assign(floatCancelBtn.style, {
            background:'#b51b3b', color:'#fff', border:'none', borderRadius:'7px',
            padding:'5px 10px', fontWeight:'700', fontSize:'13px',
            cursor:'pointer', flexShrink:'0', display:'none',
        });

        // Floating speed chip — click to cycle Fast → Normal → Slow
        const floatSpeed = document.createElement('button');
        Object.assign(floatSpeed.style, {
            background:'#1e293b', color:'#f8fafc', border:'none', borderRadius:'6px',
            padding:'3px 8px', fontWeight:'700', fontSize:'11px',
            cursor:'pointer', flexShrink:'0', whiteSpace:'nowrap',
        });

        floatBar.append(floatDot, floatStatus, floatSpeed, floatPauseBtn, floatCancelBtn);
        document.body.appendChild(floatBar);

        // ─── Animation styles ──────────────────────────────────────────
        if (!document.getElementById('demoPulseStyle')) {
            const s = document.createElement('style');
            s.id = 'demoPulseStyle';
            s.textContent = '@keyframes demoPulse{0%,100%{opacity:1}50%{opacity:0.3}}';
            document.head.appendChild(s);
        }

        // ─── Speed buttons (embedded) ──────────────────────────────────
        const speedRow = document.createElement('div');
        Object.assign(speedRow.style, { display:'flex', gap:'6px', alignItems:'center' });

        const speedLabel = document.createElement('span');
        speedLabel.textContent = 'Speed:';
        Object.assign(speedLabel.style, { fontSize:'11px', color:'#888', fontWeight:'600' });
        speedRow.appendChild(speedLabel);

        const speedBtns = SPEED_PRESETS.map((p, i) => {
            const b = document.createElement('button');
            b.textContent = p.label;
            Object.assign(b.style, {
                border:'1px solid #d1d5db', borderRadius:'6px', padding:'3px 10px',
                fontSize:'11px', fontWeight:'700', cursor:'pointer',
                background: i === 0 ? '#1e293b' : '#f1f5f9',
                color:      i === 0 ? '#f8fafc' : '#374151',
            });
            speedRow.appendChild(b);
            return b;
        });

        function applySpeed(idx) {
            _speedIdx        = idx;
            _speedMultiplier = SPEED_PRESETS[idx].mult;
            speedBtns.forEach((b, i) => {
                b.style.background = i === idx ? '#1e293b' : '#f1f5f9';
                b.style.color      = i === idx ? '#f8fafc' : '#374151';
            });
            floatSpeed.textContent = SPEED_PRESETS[idx].label;
        }

        speedBtns.forEach((b, i) => b.addEventListener('click', () => applySpeed(i)));
        floatSpeed.addEventListener('click', () => applySpeed((_speedIdx + 1) % SPEED_PRESETS.length));
        applySpeed(0);   // initialise to Fast

        // ─── Shared state helpers ──────────────────────────────────────
        _setStatus = msg => {
            statusEl.textContent    = msg;
            floatStatus.textContent = msg;
        };

        function applyState(state) {
            const isRunning = state === 'running';
            const isPaused  = state === 'paused';
            const isIdle    = state === 'idle';

            // Embedded
            startBtn.style.display   = isIdle  ? '' : 'none';
            fillAllBtn.style.display = isIdle  ? '' : 'none';
            pauseBtn.style.display   = !isIdle ? '' : 'none';
            cancelBtn.style.display  = !isIdle ? '' : 'none';
            pauseBtn.textContent    = isRunning ? '⏸ Pause' : '▶ Continue';
            pauseBtn.style.background = isRunning ? '#f59e0b' : '#22c55e';

            // Floating
            floatPauseBtn.style.display  = !isIdle ? '' : 'none';
            floatCancelBtn.style.display = !isIdle ? '' : 'none';
            floatPauseBtn.textContent    = isRunning ? '⏸' : '▶';
            floatPauseBtn.style.background = isRunning ? '#f59e0b' : '#22c55e';

            // Dot
            floatDot.style.color     = isRunning ? '#22c55e' : isPaused ? '#f59e0b' : '#b51b3b';
            floatDot.style.animation = isRunning ? 'demoPulse 1s ease-in-out infinite' : 'none';
        }

        // ─── Auto-hide after 30s of idle ───────────────────────────────
        let _hideTimer = null;

        function hideWidget() {
            [wrap, floatBar].forEach(el => {
                el.style.transition = 'opacity 0.6s ease';
                el.style.opacity = '0';
                setTimeout(() => el.remove(), 650);
            });
        }

        function startHideTimer() {
            clearTimeout(_hideTimer);
            _hideTimer = setTimeout(hideWidget, 30000);
        }

        function cancelHideTimer() {
            clearTimeout(_hideTimer);
            _hideTimer = null;
        }

        startHideTimer();

        // ─── Shared run logic ──────────────────────────────────────────
        async function runFill(speedMult) {
            cancelHideTimer();
            _cancelled       = false;
            _paused          = false;
            _speedMultiplier = speedMult;

            const _savedAppToast      = window.showAppToast;
            const _savedScrollToNext  = window.scrollToNextSection;
            const _savedSwalFire      = window.Swal ? window.Swal.fire.bind(window.Swal) : null;
            window.showAppToast       = null;
            if (speedMult === 0) window.scrollToNextSection = () => {};
            if (window.Swal) window.Swal.fire = () => Promise.resolve({ isConfirmed: false, isDismissed: true });

            const _bannerObs = new MutationObserver(mutations => {
                document.querySelectorAll('.banner').forEach(b => {
                    if (b.style.display !== 'none') b.style.display = 'none';
                });
                mutations.forEach(m => m.addedNodes.forEach(node => {
                    if (node.nodeType !== 1 || node.classList.contains('demo-toast')) return;
                    if (/toast|alert|notification|swal|sweet/i.test(node.className || ''))
                        node.style.display = 'none';
                }));
            });
            _bannerObs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });

            applyState('running');
            _setStatus(speedMult === 0 ? 'Filling all sections...' : 'Starting...');
            try { await fillFn(); }
            finally {
                applyState('idle');
                if (_cancelled) _setStatus('Stopped.');
                else _setStatus('Done!');
                startHideTimer();
                window.showAppToast      = _savedAppToast;
                window.scrollToNextSection = _savedScrollToNext;
                if (window.Swal && _savedSwalFire) window.Swal.fire = _savedSwalFire;
                _bannerObs.disconnect();
            }
        }

        // ─── Button wiring ─────────────────────────────────────────────
        startBtn.addEventListener('click', () => runFill(_speedMultiplier));

        function togglePause() {
            if (_paused) {
                applyState('running');
                w.continueDemoFill();
            } else {
                applyState('paused');
                w.pauseDemoFill();
            }
        }
        pauseBtn.addEventListener('click', togglePause);
        floatPauseBtn.addEventListener('click', togglePause);

        function doCancel() { w.stopDemoFill(); applyState('idle'); startHideTimer(); }
        cancelBtn.addEventListener('click', doCancel);
        floatCancelBtn.addEventListener('click', doCancel);

        // Quick Seed button — calls DevSeedCairoUniversity directly (same as old DevTestTool)
        const seedBtn = document.createElement('button');
        seedBtn.textContent = '💾 Quick Seed (DB)';
        Object.assign(seedBtn.style, {
            background:'#166534', color:'#fff', border:'none', borderRadius:'8px',
            padding:'8px 14px', cursor:'pointer', fontWeight:'700', fontSize:'13px', width:'100%',
        });
        seedBtn.title = 'Seeds all Cairo University data directly to DB in one request — fastest option';
        seedBtn.addEventListener('click', async () => {
            seedBtn.disabled = true;
            seedBtn.textContent = '⏳ Seeding...';
            _setStatus('Quick-seeding Cairo University data...');
            try {
                const res = await fetch('/Home/DevSeedCairoUniversity', { method: 'POST' });
                const data = await res.json().catch(() => ({}));
                seedBtn.textContent = `✅ ${data.message || 'Seeded!'}`;
                seedBtn.style.background = '#14532d';
                _setStatus('Done ✓ (Quick Seed)');
                showToast('Cairo University seeded successfully. Refresh the page to see data.');
            } catch (e) {
                seedBtn.textContent = '❌ Seed failed — check console';
                seedBtn.style.background = '#991b1b';
                seedBtn.disabled = false;
                console.warn('[demo] Quick seed failed:', e);
                _setStatus('Seed failed.');
            }
        });

        fillAllBtn.addEventListener('click', () => runFill(0));

        row.append(startBtn, fillAllBtn, pauseBtn, cancelBtn);
        wrap.append(hd, statusEl, speedRow, row, seedBtn);
        return wrap;
    }

    // ── Auto-detect form and mount widget ─────────────────────────────────
    function init() {
        const isPG     = !!qi('pgProgramsJson');
        const isOnline = !!qi('commCsv');
        const isBach   = !isPG && !isOnline && !!qi('btnSaveAcademic');

        if (!isBach && !isPG && !isOnline) return;

        const fillFn = isBach   ? w.demoFillBachelorApplicationExplainable
                     : isPG    ? w.demoFillPostgraduateApplicationExplainable
                               : w.demoFillOnlineApplicationExplainable;

        const title  = isBach   ? 'Explainable Demo Fill — Bachelor Application'
                     : isPG    ? 'Explainable Demo Fill — Postgraduate Application'
                               : 'Explainable Demo Fill — Online Application';

        const mountSel = isBach ? '#sec-instructions .welcome-card'
                                : 'section.welcome .welcome-card';

        const widget = createWidget(fillFn, title);
        const mount  = q(mountSel);
        if (mount) mount.appendChild(widget);
        else document.body.appendChild(widget);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
