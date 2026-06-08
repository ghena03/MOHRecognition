// wwwroot/js/MedicineDentistry.js
(function () {
    const containerId = "medDenContainer";

    function getContainer() {
        return document.getElementById(containerId);
    }

    function getUrl(attr) {
        const c = getContainer();
        return c ? c.getAttribute(attr) : null;
    }

    function render(html) {
        const c = getContainer();
        if (c) c.innerHTML = html;
    }

    function banner() {
        return document.getElementById("medDenBanner");
    }

    function showError(msg) {
        if (window.showAppToast) {
            window.showAppToast(msg, "error");
            return;
        }
        const b = banner();
        if (!b) return;
        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = msg;
    }

    function hideError() {
        const b = banner();
        if (b) b.style.display = "none";
    }

    // ── College Selection ────────────────────────────────────────────────

    function applyCollegeSelection() {
        const chkMed = document.getElementById("chk_medicine");
        const chkDen = document.getElementById("chk_dentistry");
        const hasMed = chkMed ? chkMed.checked : true;
        const hasDen = chkDen ? chkDen.checked : true;

        const tableSection = document.getElementById("medden-table-section");
        if (tableSection) {
            tableSection.classList.toggle("hide-medicine",  !hasMed);
            tableSection.classList.toggle("hide-dentistry", !hasDen);
        }

        // Update summary empty visibility
        const summaryEmpty = document.getElementById("medden-summary-empty");
        if (summaryEmpty) summaryEmpty.style.display = (!hasMed && !hasDen) ? "block" : "none";

        recalcSummary();
    }

    function setupCollegeCheckboxes() {
        const chkMed = document.getElementById("chk_medicine");
        const chkDen = document.getElementById("chk_dentistry");

        if (!chkMed && !chkDen) return;

        if (chkMed) chkMed.addEventListener("change", function () {
            // Prevent unchecking the last selected option
            if (!chkMed.checked && chkDen && !chkDen.checked) {
                chkMed.checked = true;
                return;
            }
            applyCollegeSelection();
        });

        if (chkDen) chkDen.addEventListener("change", function () {
            if (!chkDen.checked && chkMed && !chkMed.checked) {
                chkDen.checked = true;
                return;
            }
            applyCollegeSelection();
        });

        applyCollegeSelection();
    }

    // ── Number enforcement ───────────────────────────────────────────────

    function enforceNumbersOnly() {
        const c = getContainer();
        if (!c) return;

        const inputs = c.querySelectorAll("input[type='number'], input.num");
        inputs.forEach(inp => {
            inp.addEventListener("paste", (e) => {
                const txt = (e.clipboardData || window.clipboardData).getData("text");
                if (!/^\d*$/.test(txt.trim())) e.preventDefault();
            });

            inp.addEventListener("keydown", (e) => {
                const okKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"];
                if (okKeys.includes(e.key)) return;
                if (e.ctrlKey || e.metaKey) return;
                if (!/^\d$/.test(e.key)) e.preventDefault();
            });

            inp.addEventListener("input", recalcSummary);
        });

        setupCollegeCheckboxes();
        recalcSummary();
    }

    function asInt(id) {
        const el = document.getElementById(id);
        if (!el) return 0;
        const n = parseInt((el.value || "").trim(), 10);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    }

    function setVal(id, v) {
        const el = document.getElementById(id);
        if (el) el.value = String(v);
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function fmt2(n) { return n.toFixed(2); }

    function computeAllowedPartTime(ftPhd) {
        if (ftPhd < 50)   return ftPhd * 0.25;
        if (ftPhd <= 100) return (50 * 0.25) + ((ftPhd - 50) * 0.35);
        return (50 * 0.25) + (50 * 0.35) + ((ftPhd - 100) * 0.50);
    }

    function applyRatioStatus(badgeId, ratio) {
        const el = document.getElementById(badgeId);
        if (!el) return;
        el.className = "status-badge";
        if (ratio === null) {
            el.textContent = "N/A";
        } else if (ratio <= 16.5) {
            el.classList.add("ok");
            el.textContent = "Acceptable";
        } else if (ratio <= 20.625) {
            el.classList.add("warn");
            el.textContent = "Warning";
        } else {
            el.classList.add("fail");
            el.textContent = "Exceeds Limit";
        }
    }

    function recalcSummary() {
        // ── Summary grid (PhD / MSc / PSc holders) ──
        const medPhd =
            asInt("med_fullTimeProfessor") +
            asInt("med_fullTimeAssociateProfessor") +
            asInt("med_fullTimeAssistantProfessor") +
            asInt("med_fullTimeLecturerPhd");
        const denPhd =
            asInt("den_fullTimeProfessor") +
            asInt("den_fullTimeAssociateProfessor") +
            asInt("den_fullTimeAssistantProfessor") +
            asInt("den_fullTimeLecturerPhd");

        const medMsc =
            asInt("med_fullTimeLecturerMsc") +
            asInt("med_fullTimeAssistantLecturerMsc") +
            asInt("med_fullTimePractitionerMsc");
        const denMsc =
            asInt("den_fullTimeLecturerMsc") +
            asInt("den_fullTimeAssistantLecturerMsc") +
            asInt("den_fullTimePractitionerMsc");

        const medPsc =
            asInt("med_fullTimePractitionerPsc");
        const denPsc =
            asInt("den_fullTimePractitionerPsc");

        const medTotalPt =
            asInt("med_partTimeClinicalProfessor") +
            asInt("med_partTimeClinicalAssociateProfessor") +
            asInt("med_partTimeClinicalAssistantProfessor") +
            asInt("med_partTimeClinicalLecturerPhd") +
            asInt("med_partTimeClinicalAssistantLecturerPhd") +
            asInt("med_partTimeClinicalLecturerMsc") +
            asInt("med_partTimeClinicalAssistantLecturerMsc") +
            asInt("med_partTimeClinicalPractitionerPsc") +
            asInt("med_partTimeClinicalPractitionerMsc");
        const denTotalPt =
            asInt("den_partTimeClinicalProfessor") +
            asInt("den_partTimeClinicalAssociateProfessor") +
            asInt("den_partTimeClinicalAssistantProfessor") +
            asInt("den_partTimeClinicalLecturerPhd") +
            asInt("den_partTimeClinicalAssistantLecturerPhd") +
            asInt("den_partTimeClinicalLecturerMsc") +
            asInt("den_partTimeClinicalAssistantLecturerMsc") +
            asInt("den_partTimeClinicalPractitionerPsc") +
            asInt("den_partTimeClinicalPractitionerMsc");

        const medMscLecturers =
            asInt("med_fullTimeLecturerMsc") +
            asInt("med_fullTimeAssistantLecturerMsc");
        const denMscLecturers =
            asInt("den_fullTimeLecturerMsc") +
            asInt("den_fullTimeAssistantLecturerMsc");
        const medPractitioners = asInt("med_fullTimePractitionerMsc"); // BSc = 0 for Medicine
        const denPractitioners =
            asInt("den_fullTimePractitionerPsc") +
            asInt("den_fullTimePractitionerMsc");

        setVal("med_phdHolders",       medPhd);
        setVal("den_phdHolders",       denPhd);
        setVal("med_mscHolders",       medMsc);  // legacy hidden
        setVal("den_mscHolders",       denMsc);  // legacy hidden
        setVal("med_mscLecturers",     medMscLecturers);
        setVal("den_mscLecturers",     denMscLecturers);
        setVal("med_practitionerTotal", medPractitioners);
        setVal("den_practitionerTotal", denPractitioners);
        setVal("med_pscHolders",       medPsc);  // legacy hidden
        setVal("den_pscHolders",       denPsc);  // legacy hidden
        setVal("med_totalPartTime",    medTotalPt);
        setVal("den_totalPartTime",    denTotalPt);

        // Update summary empty visibility
        const hasMedNow = document.getElementById("chk_medicine")?.checked ?? true;
        const hasDenNow = document.getElementById("chk_dentistry")?.checked ?? true;
        const summaryEmpty = document.getElementById("medden-summary-empty");
        if (summaryEmpty) summaryEmpty.style.display = (!hasMedNow && !hasDenNow) ? "flex" : "none";

        // ── Ratio (only updates elements if on the doctors page) ──
        const medFtPhd    = medPhd + asInt("med_fullTimeAssistantLecturerPhd");
        const medActualPt = asInt("med_partTimeClinicalProfessor") +
                            asInt("med_partTimeClinicalAssociateProfessor") +
                            asInt("med_partTimeClinicalAssistantProfessor") +
                            asInt("med_partTimeClinicalLecturerPhd") +
                            asInt("med_partTimeClinicalAssistantLecturerPhd");
        const medAllowedPt = computeAllowedPartTime(medFtPhd);
        const medCountedPt = Math.min(medActualPt, medAllowedPt);
        const medStaff     = medFtPhd + medCountedPt;
        const medStudents  = asInt("med_totalStudents");
        const medRatio     = medStaff > 0 ? medStudents / medStaff : null;

        setText("med_ftClinicalPhd", medFtPhd);
        setText("med_actualPt",      medActualPt);
        setText("med_allowedPt",     fmt2(medAllowedPt));
        setText("med_countedPt",     fmt2(medCountedPt));
        setText("med_countedStaff",  fmt2(medStaff));
        setText("med_ratio",         medRatio !== null ? "1 : " + fmt2(medRatio) : "—");
        applyRatioStatus("med_ratioStatus", medRatio);

        const denFtPhd    = denPhd + asInt("den_fullTimeAssistantLecturerPhd");
        const denActualPt = asInt("den_partTimeClinicalProfessor") +
                            asInt("den_partTimeClinicalAssociateProfessor") +
                            asInt("den_partTimeClinicalAssistantProfessor") +
                            asInt("den_partTimeClinicalLecturerPhd") +
                            asInt("den_partTimeClinicalAssistantLecturerPhd");
        const denAllowedPt = computeAllowedPartTime(denFtPhd);
        const denCountedPt = Math.min(denActualPt, denAllowedPt);
        const denStaff     = denFtPhd + denCountedPt;
        const denStudents  = asInt("den_totalStudents");
        const denRatio     = denStaff > 0 ? denStudents / denStaff : null;

        setText("den_ftClinicalPhd", denFtPhd);
        setText("den_actualPt",      denActualPt);
        setText("den_allowedPt",     fmt2(denAllowedPt));
        setText("den_countedPt",     fmt2(denCountedPt));
        setText("den_countedStaff",  fmt2(denStaff));
        setText("den_ratio",         denRatio !== null ? "1 : " + fmt2(denRatio) : "—");
        applyRatioStatus("den_ratioStatus", denRatio);
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    async function loadPartialNoJump() {
        const c = getContainer();
        if (!c) return;

        const url = getUrl("data-partial-url");
        if (!url) return;

        const y = window.scrollY || 0;
        const unlock = lockHeight(c);

        try {
            const res = await fetch(url);
            const html = await res.text();
            render(html);
            window.scrollTo(0, y);
            enforceNumbersOnly();
        } finally {
            unlock();
        }
    }

    window.refreshMedDenNoJump = async function () {
        await loadPartialNoJump();
    };

    window.MedDenSave = async function () {
        hideError();

        const c = getContainer();
        if (!c) return;

        const saveUrl = getUrl("data-save-url");
        if (!saveUrl) return;

        const unlock = lockHeight(c);

        const hasMed = document.getElementById("chk_medicine")?.checked  ?? true;
        const hasDen = document.getElementById("chk_dentistry")?.checked ?? true;

        function v(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : "";
        }

        // Build required IDs dynamically based on selected colleges
        const requiredIds = [
            ...(hasMed ? [
                "med_fullTimeProfessor", "med_fullTimeAssociateProfessor", "med_fullTimeAssistantProfessor",
                "med_fullTimeLecturerPhd", "med_fullTimeLecturerMsc", "med_fullTimeAssistantLecturerMsc",
                "med_fullTimeAssistantLecturerPhd", "med_fullTimePractitionerMsc"
                // med_fullTimePractitionerPsc excluded: BSc Practitioners not applicable for Medicine (locked at 0)
            ] : []),
            ...(hasDen ? [
                "den_fullTimeProfessor", "den_fullTimeAssociateProfessor", "den_fullTimeAssistantProfessor",
                "den_fullTimeLecturerPhd", "den_fullTimeLecturerMsc", "den_fullTimeAssistantLecturerMsc",
                "den_fullTimeAssistantLecturerPhd", "den_fullTimePractitionerMsc"
                // den_fullTimePractitionerPsc excluded: BSc Practitioner row removed from form
            ] : [])
        ];

        for (const id of requiredIds) {
            if (v(id) === "") {
                showError("All full-time fields are required for the selected colleges. Please fill in every row.");
                document.getElementById(id)?.focus();
                unlock();
                return;
            }
        }

        const payload = new URLSearchParams();

        // College selection flags
        payload.append("has_medicine",  hasMed ? "true" : "false");
        payload.append("has_dentistry", hasDen ? "true" : "false");

        // Full-Time fields — zero out fields for unselected colleges
        payload.append("med_fullTimeProfessor",           hasMed ? v("med_fullTimeProfessor")           : "0");
        payload.append("med_fullTimeAssociateProfessor",  hasMed ? v("med_fullTimeAssociateProfessor")  : "0");
        payload.append("med_fullTimeAssistantProfessor",  hasMed ? v("med_fullTimeAssistantProfessor")  : "0");
        payload.append("med_fullTimeLecturerPhd",         hasMed ? v("med_fullTimeLecturerPhd")         : "0");
        payload.append("med_fullTimeLecturerMsc",         hasMed ? v("med_fullTimeLecturerMsc")         : "0");
        payload.append("med_fullTimeAssistantLecturerMsc", hasMed ? v("med_fullTimeAssistantLecturerMsc") : "0");
        payload.append("med_fullTimeAssistantLecturerPhd", hasMed ? v("med_fullTimeAssistantLecturerPhd") : "0");
        payload.append("med_fullTimePractitionerPsc",     "0"); // always 0 — not applicable for Medicine
        payload.append("med_fullTimePractitionerMsc",     hasMed ? v("med_fullTimePractitionerMsc")     : "0");

        payload.append("den_fullTimeProfessor",           hasDen ? v("den_fullTimeProfessor")           : "0");
        payload.append("den_fullTimeAssociateProfessor",  hasDen ? v("den_fullTimeAssociateProfessor")  : "0");
        payload.append("den_fullTimeAssistantProfessor",  hasDen ? v("den_fullTimeAssistantProfessor")  : "0");
        payload.append("den_fullTimeLecturerPhd",         hasDen ? v("den_fullTimeLecturerPhd")         : "0");
        payload.append("den_fullTimeLecturerMsc",         hasDen ? v("den_fullTimeLecturerMsc")         : "0");
        payload.append("den_fullTimeAssistantLecturerMsc", hasDen ? v("den_fullTimeAssistantLecturerMsc") : "0");
        payload.append("den_fullTimeAssistantLecturerPhd", hasDen ? v("den_fullTimeAssistantLecturerPhd") : "0");
        payload.append("den_fullTimePractitionerPsc",     "0"); // BSc Practitioner row removed from form
        payload.append("den_fullTimePractitionerMsc",     hasDen ? v("den_fullTimePractitionerMsc")     : "0");

        // Part-Time Clinical fields
        payload.append("med_partTimeClinicalProfessor",           hasMed ? v("med_partTimeClinicalProfessor")           : "0");
        payload.append("med_partTimeClinicalAssociateProfessor",  hasMed ? v("med_partTimeClinicalAssociateProfessor")  : "0");
        payload.append("med_partTimeClinicalAssistantProfessor",  hasMed ? v("med_partTimeClinicalAssistantProfessor")  : "0");
        payload.append("med_partTimeClinicalLecturerPhd",         hasMed ? v("med_partTimeClinicalLecturerPhd")         : "0");
        payload.append("med_partTimeClinicalAssistantLecturerPhd", hasMed ? v("med_partTimeClinicalAssistantLecturerPhd") : "0");
        payload.append("med_partTimeClinicalLecturerMsc",         hasMed ? v("med_partTimeClinicalLecturerMsc")         : "0");
        payload.append("med_partTimeClinicalAssistantLecturerMsc", hasMed ? v("med_partTimeClinicalAssistantLecturerMsc") : "0");
        payload.append("med_partTimeClinicalPractitionerPsc",     hasMed ? v("med_partTimeClinicalPractitionerPsc")     : "0");
        payload.append("med_partTimeClinicalPractitionerMsc",     hasMed ? v("med_partTimeClinicalPractitionerMsc")     : "0");

        payload.append("den_partTimeClinicalProfessor",           hasDen ? v("den_partTimeClinicalProfessor")           : "0");
        payload.append("den_partTimeClinicalAssociateProfessor",  hasDen ? v("den_partTimeClinicalAssociateProfessor")  : "0");
        payload.append("den_partTimeClinicalAssistantProfessor",  hasDen ? v("den_partTimeClinicalAssistantProfessor")  : "0");
        payload.append("den_partTimeClinicalLecturerPhd",         hasDen ? v("den_partTimeClinicalLecturerPhd")         : "0");
        payload.append("den_partTimeClinicalAssistantLecturerPhd", hasDen ? v("den_partTimeClinicalAssistantLecturerPhd") : "0");
        payload.append("den_partTimeClinicalLecturerMsc",         hasDen ? v("den_partTimeClinicalLecturerMsc")         : "0");
        payload.append("den_partTimeClinicalAssistantLecturerMsc", hasDen ? v("den_partTimeClinicalAssistantLecturerMsc") : "0");
        payload.append("den_partTimeClinicalPractitionerPsc",     hasDen ? v("den_partTimeClinicalPractitionerPsc")     : "0");
        payload.append("den_partTimeClinicalPractitionerMsc",     hasDen ? v("den_partTimeClinicalPractitionerMsc")     : "0");

        // Students
        payload.append("med_totalStudents", hasMed ? v("med_totalStudents") : "0");
        payload.append("den_totalStudents", hasDen ? v("den_totalStudents") : "0");

        try {
            const res = await fetch(saveUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                body: payload.toString()
            });

            const html = await res.text();

            if (!res.ok) {
                showError(html || "Error");
                return;
            }

            render(html);
            enforceNumbersOnly();
            if (window.showAppToast) window.showAppToast("Saved successfully.", "success");
            window.scrollToNextSection("sec-med");
        } catch (e) {
            showError(e.message || "Error");
        } finally {
            unlock();
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;
        setTimeout(() => loadPartialNoJump(), 150);
    });
})();
