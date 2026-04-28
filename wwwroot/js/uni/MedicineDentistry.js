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
        return Number.isFinite(n) && n > 0 ? n : 0;
    }

    function setReadOnlyValue(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value.toString();
    }

    function recalcSummary() {
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

        setReadOnlyValue("med_phdHolders", medPhd);
        setReadOnlyValue("den_phdHolders", denPhd);
        setReadOnlyValue("med_mscHolders", medMsc);
        setReadOnlyValue("den_mscHolders", denMsc);
        setReadOnlyValue("med_pscHolders", medPsc);
        setReadOnlyValue("den_pscHolders", denPsc);
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

        const payload = new URLSearchParams();
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
            window.scrollTo(0, y);
            enforceNumbersOnly();
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