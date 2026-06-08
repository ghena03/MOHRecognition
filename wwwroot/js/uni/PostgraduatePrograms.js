function showToast(type, message) {
    let host = document.getElementById("uniToastHost");
    if (!host) {
        host = document.createElement("div");
        host.id = "uniToastHost";
        host.className = "uni-toast-host";
        document.body.appendChild(host);
    }

    const toast = document.createElement("div");
    toast.className = "uni-toast" + (type === "error" ? " is-error" : " is-success");
    toast.textContent = message;
    host.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 220);
    }, 2200);
}

function getFieldContainer(el) {
    return el?.closest(".field, .applicant-field, .faculty-input-box, .student-modern-row") || null;
}

function removeFieldError(el) {
    if (!el) return;
    el.classList.remove("input-invalid");
    const container = getFieldContainer(el);
    if (!container) return;
    const msg = container.querySelector(".field-required-error");
    if (msg) msg.remove();
}

function setFieldError(el, message) {
    if (!el) return;
    el.classList.add("input-invalid");
    const container = getFieldContainer(el);
    if (!container) return;

    let msg = container.querySelector(".field-required-error");
    if (!msg) {
        msg = document.createElement("div");
        msg.className = "field-required-error";
        container.appendChild(msg);
    }
    msg.textContent = message;
}

function clearSectionValidation(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.querySelectorAll(".input-invalid").forEach(el => el.classList.remove("input-invalid"));
    section.querySelectorAll(".field-required-error, .group-required-error").forEach(el => el.remove());
}

function appendGroupError(targetEl, message) {
    if (!targetEl) return;
    let msg = targetEl.parentElement?.querySelector(".group-required-error");
    if (!msg) {
        msg = document.createElement("div");
        msg.className = "group-required-error";
        targetEl.insertAdjacentElement("afterend", msg);
    }
    msg.textContent = message;
}

function focusFirstInvalid(firstInvalid) {
    if (!firstInvalid) return;
    firstInvalid.focus({ preventScroll: true });
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getLevelKey(entry) {
    const value = (entry || "").trim().toLowerCase();
    if (value === "master") return "master";
    if (value === "phd") return "phd";
    if (value === "higher diploma") return "diploma";
    return "";
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("mainPostgraduateForm") || document.querySelector("form");

    const master = document.getElementById("chkMaster");
    const phd = document.getElementById("chkPhD");
    const diploma = document.getElementById("chkDiploma");

    const publicRequiredFields = [
        "InstitutionName",
        "OversightRightsEntity",
        "FoundationDate",
        "DateOfEstablishment",
        "ModeOfStudy",
        "LanguageOfInstruction",
        "StartOfTeaching",
        "MailingFullAddress",
        "DirectPhoneNumber",
        "EmailAddress",
        "InstitutionalWebAddress",
        "Country",
        "City"
    ];

    function markRequired(el, firstInvalidRef) {
        const value = (el?.value || "").toString().trim();
        if (value.length > 0) {
            removeFieldError(el);
            return true;
        }

        setFieldError(el, "This field is required.");
        if (!firstInvalidRef.value) firstInvalidRef.value = el;
        return false;
    }

    function markNumberRequired(el, firstInvalidRef) {
        const raw = (el?.value || "").toString().trim();
        if (raw.length > 0) {
            removeFieldError(el);
            return true;
        }

        setFieldError(el, "This field is required.");
        if (!firstInvalidRef.value) firstInvalidRef.value = el;
        return false;
    }

    function validatePublicInfoSection() {
        clearSectionValidation("sec-general");

        let ok = true;
        const firstInvalidRef = { value: null };

        publicRequiredFields.forEach(name => {
            const el = document.querySelector(`[name="${name}"]`);
            if (!markRequired(el, firstInvalidRef)) ok = false;
        });

        const language = document.getElementById("LanguageOfInstruction");
        const languageOther = document.getElementById("LanguageOfInstructionOther");
        if (language && language.value === "Others" && languageOther) {
            if (!markRequired(languageOther, firstInvalidRef)) ok = false;
        }

        return { ok, firstInvalid: firstInvalidRef.value };
    }

    function getProgramsByLevel() {
        const levels = { master: [], phd: [], diploma: [] };
        const data = window.pgLevelData;

        if (data) {
            levels.master = Array.isArray(data.master?.progs) ? data.master.progs : [];
            levels.phd = Array.isArray(data.phd?.progs) ? data.phd.progs : [];
            levels.diploma = Array.isArray(data.diploma?.progs) ? data.diploma.progs : [];
            return levels;
        }

        const raw = document.getElementById("pgProgramsJson")?.value || "[]";
        try {
            const parsed = JSON.parse(raw);
            parsed.forEach(item => {
                const key = getLevelKey(item?.DegreeLevel);
                if (!key) return;
                levels[key].push(item);
            });
        } catch {
            return levels;
        }

        return levels;
    }

    function validateProgramsSection() {
        clearSectionValidation("sec-programs");

        let ok = true;
        let firstInvalid = null;

        const anyLevel = !!(master?.checked || phd?.checked || diploma?.checked);
        const levelTarget = document.querySelector("#sec-programs .degree-options");
        if (!anyLevel) {
            appendGroupError(levelTarget, "This field is required.");
            ok = false;
            firstInvalid = master || phd || diploma;
        }

        const levels = getProgramsByLevel();
        const levelMap = [
            { key: "master", checked: master?.checked, emptyTarget: document.getElementById("masterProgSection") },
            { key: "phd", checked: phd?.checked, emptyTarget: document.getElementById("phdProgSection") },
            { key: "diploma", checked: diploma?.checked, emptyTarget: document.getElementById("diplomaProgSection") }
        ];

        levelMap.forEach(level => {
            if (!level.checked) return;
            if (levels[level.key].length > 0) return;

            appendGroupError(level.emptyTarget, "This field is required.");
            if (!firstInvalid) firstInvalid = level.emptyTarget;
            ok = false;
        });

        return { ok, firstInvalid };
    }

    function validateStudentsSection() {
        clearSectionValidation("sec-students");

        let ok = true;
        const firstInvalidRef = { value: null };

        if (master?.checked) {
            if (!markNumberRequired(document.querySelector('[name="MasterStudents"]'), firstInvalidRef)) ok = false;
        }

        if (phd?.checked) {
            if (!markNumberRequired(document.querySelector('[name="PhDStudents"]'), firstInvalidRef)) ok = false;
        }

        if (diploma?.checked) {
            if (!markNumberRequired(document.querySelector('[name="DiplomaStudents"]'), firstInvalidRef)) ok = false;
        }

        return { ok, firstInvalid: firstInvalidRef.value };
    }

    function validateFacultySection() {
        clearSectionValidation("sec-faculty");

        let ok = true;
        const firstInvalidRef = { value: null };

        if (master?.checked) {
            if (!markNumberRequired(document.querySelector('[name="MasterProfessor"]'), firstInvalidRef)) ok = false;
            if (!markNumberRequired(document.querySelector('[name="MasterAssociate"]'), firstInvalidRef)) ok = false;
            if (!markNumberRequired(document.querySelector('[name="MasterAssistant"]'), firstInvalidRef)) ok = false;
        }

        if (phd?.checked) {
            if (!markNumberRequired(document.querySelector('[name="PhDProfessor"]'), firstInvalidRef)) ok = false;
            if (!markNumberRequired(document.querySelector('[name="PhDAssociate"]'), firstInvalidRef)) ok = false;
            if (!markNumberRequired(document.querySelector('[name="PhDAssistant"]'), firstInvalidRef)) ok = false;
        }

        if (diploma?.checked) {
            if (!markNumberRequired(document.querySelector('[name="DiplomaProfessor"]'), firstInvalidRef)) ok = false;
            if (!markNumberRequired(document.querySelector('[name="DiplomaAssociate"]'), firstInvalidRef)) ok = false;
            if (!markNumberRequired(document.querySelector('[name="DiplomaAssistant"]'), firstInvalidRef)) ok = false;
        }

        return { ok, firstInvalid: firstInvalidRef.value };
    }

    function validateApplicantSection() {
        clearSectionValidation("sec-user");

        let ok = true;
        const firstInvalidRef = { value: null };

        if (!markRequired(document.querySelector('[name="Name"]'), firstInvalidRef)) ok = false;
        if (!markRequired(document.querySelector('[name="WorkPlace"]'), firstInvalidRef)) ok = false;

        return { ok, firstInvalid: firstInvalidRef.value };
    }

    function validateEntireForm() {
        const checks = [
            validatePublicInfoSection(),
            validateProgramsSection(),
            validateStudentsSection(),
            validateFacultySection(),
            validateApplicantSection()
        ];

        const firstInvalid = checks.map(c => c.firstInvalid).find(Boolean) || null;
        const ok = checks.every(c => c.ok);
        return { ok, firstInvalid };
    }

    function toggle(el, progSection, students, faculty) {
        if (!el) return;
        el.addEventListener("change", function () {
            const show = this.checked;

            if (progSection)
                progSection.style.display = show ? "block" : "none";

            if (students)
                students.style.display = show ? "grid" : "none";

            if (faculty)
                faculty.style.display = show ? "block" : "none";
        });
    }

    toggle(
        master,
        document.getElementById("masterProgSection"),
        document.getElementById("masterStudents"),
        document.getElementById("masterFaculty")
    );

    toggle(
        phd,
        document.getElementById("phdProgSection"),
        document.getElementById("phdStudents"),
        document.getElementById("phdFaculty")
    );

    toggle(
        diploma,
        document.getElementById("diplomaProgSection"),
        document.getElementById("diplomaStudents"),
        document.getElementById("diplomaFaculty")
    );

    document.getElementById("btnSavePublic")?.addEventListener("click", function () {
        const result = validatePublicInfoSection();
        if (!result.ok) {
            showToast("error", "Please complete all required fields.");
            focusFirstInvalid(result.firstInvalid);
            return;
        }

        showToast("success", "Public info saved");
        scrollToNext("sec-programs");
    });

    document.getElementById("btnSavePrograms")?.addEventListener("click", function () {
        const result = validateProgramsSection();
        if (!result.ok) {
            showToast("error", "Please complete all required fields.");
            focusFirstInvalid(result.firstInvalid);
            return;
        }

        showToast("success", "Programs saved");
        scrollToNext("sec-students");
    });

    document.getElementById("btnSaveStudents")?.addEventListener("click", function () {
        const result = validateStudentsSection();
        if (!result.ok) {
            showToast("error", "Please complete all required fields.");
            focusFirstInvalid(result.firstInvalid);
            return;
        }

        showToast("success", "Students saved");
        scrollToNext("sec-faculty");
    });

    document.getElementById("btnSaveFaculty")?.addEventListener("click", function () {
        const result = validateFacultySection();
        if (!result.ok) {
            showToast("error", "Please complete all required fields.");
            focusFirstInvalid(result.firstInvalid);
            return;
        }

        showToast("success", "Faculty saved");
        scrollToNext("sec-user");
    });

    const radioOnlineYes = document.querySelector('input[name="ApplyOnline"][value="yes"]');
    const radioOnlineNo = document.querySelector('input[name="ApplyOnline"][value="no"]');
    const btnSubmit = document.getElementById("btnSubmitPostgrad");
    const btnOnline = document.getElementById("btnContinueOnline");

    function updateOnlineButtons() {
        const selected = document.querySelector('input[name="ApplyOnline"]:checked')?.value || "no";
        if (selected === "yes") {
            if (btnSubmit) btnSubmit.style.display = "none";
            if (btnOnline) btnOnline.style.display = "inline-flex";
        } else {
            if (btnSubmit) btnSubmit.style.display = "inline-flex";
            if (btnOnline) btnOnline.style.display = "none";
        }
    }

    if (radioOnlineYes) radioOnlineYes.onchange = updateOnlineButtons;
    if (radioOnlineNo) radioOnlineNo.onchange = updateOnlineButtons;
    updateOnlineButtons();

    form?.addEventListener("submit", function (e) {
        const result = validateEntireForm();
        if (result.ok) return;

        e.preventDefault();
        showToast("error", "Please complete all required fields.");
        focusFirstInvalid(result.firstInvalid);
    });
});

const sideLinks = document.querySelectorAll(".side-item");

sideLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const target = document.querySelector(targetId);

        if (!target) return;

        const offset = 100;

        window.scrollTo({
            top: target.offsetTop - offset,
            behavior: "smooth"
        });

        sideLinks.forEach(l => l.classList.remove("active"));
        this.classList.add("active");
    });
});

window.addEventListener("scroll", () => {
    let current = "";

    document.querySelectorAll("section").forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) current = section.getAttribute("id");
    });

    sideLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});
