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
            asInt("med_fullTimeAssistantLecturerPsc") +
            asInt("med_fullTimePractitionerPsc");
        const denPsc =
            asInt("den_fullTimeAssistantLecturerPsc") +
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

        setVal("med_phdHolders",    medPhd);
        setVal("den_phdHolders",    denPhd);
        setVal("med_mscHolders",    medMsc);
        setVal("den_mscHolders",    denMsc);
        setVal("med_pscHolders",    medPsc);
        setVal("den_pscHolders",    denPsc);
        setVal("med_totalPartTime", medTotalPt);
        setVal("den_totalPartTime", denTotalPt);

        // ── Ratio (only updates elements if on the doctors page) ──
        const medFtPhd    = medPhd + asInt("med_fullTimeAssistantLecturerPsc");
        const medActualPt = asInt("med_partTimeClinicalProfessor") +
                            asInt("med_partTimeClinicalAssociateProfessor") +
                            asInt("med_partTimeClinicalAssistantProfessor") +
                            asInt("med_partTimeClinicalLecturerPhd") +
                            asInt("med_partTimeClinicalAssistantLecturerPhd");
        const medAllowedPt = medFtPhd * 0.5;
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

        const denFtPhd    = denPhd + asInt("den_fullTimeAssistantLecturerPsc");
        const denActualPt = asInt("den_partTimeClinicalProfessor") +
                            asInt("den_partTimeClinicalAssociateProfessor") +
                            asInt("den_partTimeClinicalAssistantProfessor") +
                            asInt("den_partTimeClinicalLecturerPhd") +
                            asInt("den_partTimeClinicalAssistantLecturerPhd");
        const denAllowedPt = denFtPhd * 0.5;
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

        const y = window.scrollY || 0;
        const unlock = lockHeight(c);

        function v(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : "";
        }

        const requiredIds = [
            "med_fullTimeProfessor", "med_fullTimeAssociateProfessor", "med_fullTimeAssistantProfessor",
            "med_fullTimeLecturerPhd", "med_fullTimeLecturerMsc", "med_fullTimeAssistantLecturerMsc",
            "med_fullTimeAssistantLecturerPsc", "med_fullTimePractitionerPsc", "med_fullTimePractitionerMsc",
            "den_fullTimeProfessor", "den_fullTimeAssociateProfessor", "den_fullTimeAssistantProfessor",
            "den_fullTimeLecturerPhd", "den_fullTimeLecturerMsc", "den_fullTimeAssistantLecturerMsc",
            "den_fullTimeAssistantLecturerPsc", "den_fullTimePractitionerPsc", "den_fullTimePractitionerMsc"
        ];
        for (const id of requiredIds) {
            if (v(id) === "") {
                showError("All full-time fields are required. Please fill in every row for both Medicine and Dentistry.");
                document.getElementById(id)?.focus();
                unlock();
                return;
            }
        }

        const payload = new URLSearchParams();

        // Full-Time fields
        payload.append("med_fullTimeProfessor", v("med_fullTimeProfessor"));
        payload.append("med_fullTimeAssociateProfessor", v("med_fullTimeAssociateProfessor"));
        payload.append("med_fullTimeAssistantProfessor", v("med_fullTimeAssistantProfessor"));
        payload.append("med_fullTimeLecturerPhd", v("med_fullTimeLecturerPhd"));
        payload.append("med_fullTimeLecturerMsc", v("med_fullTimeLecturerMsc"));
        payload.append("med_fullTimeAssistantLecturerMsc", v("med_fullTimeAssistantLecturerMsc"));
        payload.append("med_fullTimeAssistantLecturerPsc", v("med_fullTimeAssistantLecturerPsc"));
        payload.append("med_fullTimePractitionerPsc", v("med_fullTimePractitionerPsc"));
        payload.append("med_fullTimePractitionerMsc", v("med_fullTimePractitionerMsc"));

        payload.append("den_fullTimeProfessor", v("den_fullTimeProfessor"));
        payload.append("den_fullTimeAssociateProfessor", v("den_fullTimeAssociateProfessor"));
        payload.append("den_fullTimeAssistantProfessor", v("den_fullTimeAssistantProfessor"));
        payload.append("den_fullTimeLecturerPhd", v("den_fullTimeLecturerPhd"));
        payload.append("den_fullTimeLecturerMsc", v("den_fullTimeLecturerMsc"));
        payload.append("den_fullTimeAssistantLecturerMsc", v("den_fullTimeAssistantLecturerMsc"));
        payload.append("den_fullTimeAssistantLecturerPsc", v("den_fullTimeAssistantLecturerPsc"));
        payload.append("den_fullTimePractitionerPsc", v("den_fullTimePractitionerPsc"));
        payload.append("den_fullTimePractitionerMsc", v("den_fullTimePractitionerMsc"));

        // Part-Time Clinical fields
        payload.append("med_partTimeClinicalProfessor", v("med_partTimeClinicalProfessor"));
        payload.append("med_partTimeClinicalAssociateProfessor", v("med_partTimeClinicalAssociateProfessor"));
        payload.append("med_partTimeClinicalAssistantProfessor", v("med_partTimeClinicalAssistantProfessor"));
        payload.append("med_partTimeClinicalLecturerPhd", v("med_partTimeClinicalLecturerPhd"));
        payload.append("med_partTimeClinicalAssistantLecturerPhd", v("med_partTimeClinicalAssistantLecturerPhd"));
        payload.append("med_partTimeClinicalLecturerMsc", v("med_partTimeClinicalLecturerMsc"));
        payload.append("med_partTimeClinicalAssistantLecturerMsc", v("med_partTimeClinicalAssistantLecturerMsc"));
        payload.append("med_partTimeClinicalPractitionerPsc", v("med_partTimeClinicalPractitionerPsc"));
        payload.append("med_partTimeClinicalPractitionerMsc", v("med_partTimeClinicalPractitionerMsc"));

        payload.append("den_partTimeClinicalProfessor", v("den_partTimeClinicalProfessor"));
        payload.append("den_partTimeClinicalAssociateProfessor", v("den_partTimeClinicalAssociateProfessor"));
        payload.append("den_partTimeClinicalAssistantProfessor", v("den_partTimeClinicalAssistantProfessor"));
        payload.append("den_partTimeClinicalLecturerPhd", v("den_partTimeClinicalLecturerPhd"));
        payload.append("den_partTimeClinicalAssistantLecturerPhd", v("den_partTimeClinicalAssistantLecturerPhd"));
        payload.append("den_partTimeClinicalLecturerMsc", v("den_partTimeClinicalLecturerMsc"));
        payload.append("den_partTimeClinicalAssistantLecturerMsc", v("den_partTimeClinicalAssistantLecturerMsc"));
        payload.append("den_partTimeClinicalPractitionerPsc", v("den_partTimeClinicalPractitionerPsc"));
        payload.append("den_partTimeClinicalPractitionerMsc", v("den_partTimeClinicalPractitionerMsc"));

        // Students
        payload.append("med_totalStudents", v("med_totalStudents"));
        payload.append("den_totalStudents", v("den_totalStudents"));

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

            const afterSave = getUrl("data-after-save");
            if (afterSave) {
                const target = document.querySelector(afterSave);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.location.hash = afterSave;
                }
            } else {
                window.scrollTo(0, y);
            }
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
