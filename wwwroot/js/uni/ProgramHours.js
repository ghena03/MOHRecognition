(function () {
    // IMPORTANT: keep your container id as it exists in your cshtml
    // If your div id is different, you MUST change this one line.
    const containerId = "hoursContainer";

    function $(id) { return document.getElementById(id); }
    function getContainer() { return document.getElementById(containerId); }

    function getUrl(attr) {
        const c = getContainer();
        return c ? c.getAttribute(attr) : null;
    }

    function ensureBanner(sectionEl) {
        let b = sectionEl.querySelector("#hoursBanner");
        if (!b) {
            b = document.createElement("div");
            b.id = "hoursBanner";
            b.className = "banner warn";
            b.style.marginTop = "12px";
            b.style.display = "none";
            b.innerHTML = `<span class="dot"></span><span class="txt"></span><button type="button" class="x">×</button>`;

            const host = sectionEl.querySelector(".card-bd") || sectionEl;
            host.insertBefore(b, host.firstChild);

            b.querySelector(".x").addEventListener("click", () => (b.style.display = "none"));
        }
        return b;
    }

    function showError(msg) {
        if (window.showAppToast) {
            window.showAppToast(msg, "error");
            return;
        }
        const sec = document.getElementById("sec-hours") || getContainer();
        if (!sec) return;
        const b = ensureBanner(sec);
        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = msg;
    }

    function clearError() {
        const sec = document.getElementById("sec-hours") || getContainer();
        if (!sec) return;
        const b = sec.querySelector("#hoursBanner");
        if (b) b.style.display = "none";
    }

    function markInvalid(el, bad) {
        if (!el) return;
        if (bad) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function v(id) { return ($(id)?.value ?? "").trim(); }

    function clearInvalid() {
        ["hrs_programId", "hrs_theory", "hrs_practical"].forEach(id => markInvalid($(id), false));
    }

    function setMode(mode) {
        const editing = mode === "edit";
        const addBtn = $("hrs_addBtn");
        const upBtn = $("hrs_updateBtn");
        const cancelBtn = $("hrs_cancelBtn");
        const program = $("hrs_programId");

        if (addBtn) addBtn.style.display = editing ? "none" : "inline-block";
        if (upBtn) upBtn.style.display = editing ? "inline-block" : "none";
        if (cancelBtn) cancelBtn.style.display = editing ? "inline-block" : "none";

        if (program) program.disabled = editing;
    }

    function clearForm() {
        if ($("hrs_editId")) $("hrs_editId").value = "";
        if ($("hrs_programId")) $("hrs_programId").value = "";
        if ($("hrs_theory")) $("hrs_theory").value = "";
        if ($("hrs_practical")) $("hrs_practical").value = "";
        setMode("add");
    }

    function validateAdd(programId, theory, practical) {
        if (!programId) return { msg: "Program is required", field: "hrs_programId" };
        if (theory === "") return { msg: "Theoretical Hours is required", field: "hrs_theory" };
        if (practical === "") return { msg: "Practical Hours is required", field: "hrs_practical" };
        return null;
    }

    function validateHours(theory, practical) {
        if (theory === "") return { msg: "Theoretical Hours is required", field: "hrs_theory" };
        if (practical === "") return { msg: "Practical Hours is required", field: "hrs_practical" };
        return null;
    }

    async function post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString()
        });
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || "Request failed");
        return txt; // partial HTML
    }

    async function loadHoursPartialNoJump() {
        const container = getContainer();
        if (!container) return;

        const partialUrl = getUrl("data-partial-url");
        if (!partialUrl) return;

        const y = window.scrollY || 0;
        const unlock = lockHeight(container);
        try {
            const res = await fetch(partialUrl);
            container.innerHTML = await res.text();
            window.scrollTo(0, y);
            setMode("add");
        } finally {
            unlock();
        }
    }

    // ✅ expose refresh helper for Programs.js
    window.refreshHoursNoJump = async function () {
        await loadHoursPartialNoJump();
    };

    // click handler (works after partial refresh)
    document.addEventListener("click", async function (e) {
        const container = getContainer();
        if (!container) return;

        const addBtn = e.target.closest("#hrs_addBtn");
        const upBtn = e.target.closest("#hrs_updateBtn");
        const cancelBtn = e.target.closest("#hrs_cancelBtn");
        const delBtn = e.target.closest(".hrs-del");
        const editBtn = e.target.closest(".hrs-edit");

        if (!addBtn && !upBtn && !cancelBtn && !delBtn && !editBtn) return;

        clearError();
        clearInvalid();

        const y = window.scrollY || 0;
        const unlock = lockHeight(container);

        try {
            // EDIT
            if (editBtn) {
                $("hrs_editId").value = editBtn.getAttribute("data-id") || "";
                $("hrs_programId").value = editBtn.getAttribute("data-programid") || "";
                $("hrs_theory").value = editBtn.getAttribute("data-theory") || "";
                $("hrs_practical").value = editBtn.getAttribute("data-practical") || "";
                setMode("edit");
                unlock();
                return;
            }

            // CANCEL
            if (cancelBtn) {
                clearForm();
                window.scrollTo(0, y);
                unlock();
                return;
            }

            const programId = $("hrs_programId")?.value || "";
            const theory = $("hrs_theory")?.value ?? "";
            const practical = $("hrs_practical")?.value ?? "";

            // ADD
            if (addBtn) {
                const err = validateAdd(programId, theory, practical);
                if (err) {
                    showError(err.msg);
                    const el = $(err.field);
                    markInvalid(el, true);
                    el?.focus();
                    unlock();
                    return;
                }

                const addUrl = getUrl("data-add-url");
                if (!addUrl) throw new Error("Hours add URL is missing.");

                const html = await post(addUrl, { programId, theoreticalHours: theory, practicalHours: practical });
                container.innerHTML = html;
                window.scrollTo(0, y);

                clearForm();
                unlock();
                return;
            }

            // UPDATE
            if (upBtn) {
                const id = $("hrs_editId")?.value || "";
                if (!id) {
                    showError("Select a row to edit first");
                    unlock();
                    return;
                }

                const err = validateHours(theory, practical);
                if (err) {
                    showError(err.msg);
                    const el = $(err.field);
                    markInvalid(el, true);
                    el?.focus();
                    unlock();
                    return;
                }

                const updateUrl = getUrl("data-update-url");
                if (!updateUrl) throw new Error("Hours update URL is missing.");

                const html = await post(updateUrl, { id, theoreticalHours: theory, practicalHours: practical });
                container.innerHTML = html;
                window.scrollTo(0, y);

                clearForm();
                unlock();
                return;
            }

            // DELETE
            if (delBtn) {
                const id = delBtn.getAttribute("data-id") || "";
                const delUrl = getUrl("data-del-url");
                if (!delUrl) throw new Error("Hours delete URL is missing.");

                const html = await post(delUrl, { id });
                container.innerHTML = html;
                window.scrollTo(0, y);

                clearForm();
                unlock();
                return;
            }

        } catch (err) {
            unlock();
            showError(err.message || "Error");
            console.error(err);
        }
    });

    document.addEventListener("DOMContentLoaded", loadHoursPartialNoJump);
})();