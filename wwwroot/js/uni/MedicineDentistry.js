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
        });
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
        payload.append("med_students", v("med_students"));
        payload.append("med_teachingStaff", v("med_teachingStaff"));
        payload.append("med_professor", v("med_professor"));
        payload.append("med_associateProfessor", v("med_associateProfessor"));
        payload.append("med_assistantProfessor", v("med_assistantProfessor"));
        payload.append("med_lecturer", v("med_lecturer"));
        payload.append("med_teacher", v("med_teacher"));
        payload.append("med_assistantTeacher", v("med_assistantTeacher"));
        payload.append("med_fullTimeLecturer", v("med_fullTimeLecturer"));

        payload.append("den_students", v("den_students"));
        payload.append("den_teachingStaff", v("den_teachingStaff"));
        payload.append("den_professor", v("den_professor"));
        payload.append("den_associateProfessor", v("den_associateProfessor"));
        payload.append("den_assistantProfessor", v("den_assistantProfessor"));
        payload.append("den_lecturer", v("den_lecturer"));
        payload.append("den_teacher", v("den_teacher"));
        payload.append("den_assistantTeacher", v("den_assistantTeacher"));
        payload.append("den_fullTimeLecturer", v("den_fullTimeLecturer"));

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