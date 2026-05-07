(function () {
    const container = document.getElementById("programs-container");
    if (!container) return;

    // URLs will come from HTML data attributes (no Razor inside JS)
    const getAddUrl = () => container.getAttribute("data-add-url");
    const getUpdateUrl = () => container.getAttribute("data-update-url");
    const getDeleteUrl = () => container.getAttribute("data-del-url");

    function $(id) { return document.getElementById(id); }
    function v(id) { return ($(id)?.value ?? "").trim(); }

    function ensureBanner() {
        let b = container.querySelector("#programsBanner");
        if (!b) {
            b = document.createElement("div");
            b.id = "programsBanner";
            b.className = "banner warn";
            b.style.marginTop = "12px";
            b.style.display = "none";
            b.innerHTML = `<span class="dot"></span><span class="txt"></span><button type="button" class="x">×</button>`;

            const host = container.querySelector(".prg-body") || container;
            host.insertBefore(b, host.firstChild);

            b.querySelector(".x").addEventListener("click", () => (b.style.display = "none"));
        }
        return b;
    }

    function showSuccess(msg) {
        if (window.showAppToast) window.showAppToast(msg, "success");
    }

    function showError(msg) {
        if (window.showAppToast) {
            window.showAppToast(msg, "error");
            return;
        }
        const b = ensureBanner();
        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = msg;
    }

    function clearError() {
        const b = container.querySelector("#programsBanner");
        if (b) b.style.display = "none";
    }

    function markInvalid(id, isInvalid) {
        const el = $(id);
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function clearAllInvalid() {
        const ids = [
            "prg_program", "prg_faculty", "prg_degree", "prg_years",
            "prg_system", "prg_acc", "prg_gradlast"
        ];
        ids.forEach(id => markInvalid(id, false));
    }

    function focusField(id) {
        const el = $(id);
        if (el) el.focus();
    }

    async function post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString()
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Request failed");
        }

        return await res.text(); // partial HTML
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function keepScroll(fn) {
        const y = window.scrollY || 0;
        const unlock = lockHeight(container);
        return fn().finally(() => {
            unlock();
            window.scrollTo(0, y);
        });
    }

    function switchToUpdate(id) {
        $("prg_editId").value = id;
        const addBtn = $("prg_addBtn");
        const upBtn = $("prg_updateBtn");
        if (addBtn) addBtn.style.display = "none";
        if (upBtn) upBtn.style.display = "inline-block";
    }

    function validateRequired() {
        const fail = (msg, fieldId) => ({ msg, fieldId });

        if (!v("prg_program")) return fail("Program is required", "prg_program");
        if (!v("prg_faculty")) return fail("College is required", "prg_faculty");
        if (!v("prg_degree")) return fail("Degree Awarded is required", "prg_degree");
        if (!v("prg_system")) return fail("Educational System is required", "prg_system");

        const years = Number(v("prg_years"));
        if (!years || years <= 0) return fail("Number of Years is required", "prg_years");

        if (!v("prg_acc")) return fail("Accreditation Date is required", "prg_acc");
        if (!v("prg_gradlast")) return fail("Graduation date of last regiment is required", "prg_gradlast");

        return null;
    }

    async function refreshDependents() {
        if (typeof refreshStudentsNumbersNoJump === "function") {
            await refreshStudentsNumbersNoJump();
        }
    }

    document.addEventListener("click", function (e) {
        const addBtn = e.target.closest("[data-prg-add]");
        const upBtn = e.target.closest("[data-prg-update]");
        const delBtn = e.target.closest("[data-prg-del]");
        const editBtn = e.target.closest("[data-prg-edit]");
        if (!addBtn && !upBtn && !delBtn && !editBtn) return;

        clearError();

        // EDIT -> fill form
        if (editBtn) {
            const id = editBtn.getAttribute("data-id") || "";
            $("prg_program").value = editBtn.getAttribute("data-program") || "";
            $("prg_faculty").value = editBtn.getAttribute("data-facultyid") || "";
            $("prg_degree").value = editBtn.getAttribute("data-degree") || "";
            $("prg_years").value = editBtn.getAttribute("data-years") || "";
            $("prg_system").value = editBtn.getAttribute("data-system") || "";
            $("prg_acc").value = editBtn.getAttribute("data-acc") || "";
            $("prg_gradlast").value = editBtn.getAttribute("data-gradlast") || "";
            switchToUpdate(id);
            return;
        }

        // DELETE
        if (delBtn) {
            const id = delBtn.getAttribute("data-id");
            if (!id) return;

            keepScroll(async () => {
                const url = getDeleteUrl();
                if (!url) throw new Error("Programs delete URL is missing.");

                const html = await post(url, { id });
                container.innerHTML = html;
                showSuccess("Program deleted successfully.");
                await refreshDependents();
            }).catch(err => showError(err.message || "Delete failed."));
            return;
        }

        // ADD / UPDATE validation
        clearAllInvalid();
        const err = validateRequired();
        if (err) {
            showError(err.msg);
            markInvalid(err.fieldId, true);
            focusField(err.fieldId);
            return;
        }

        const payload = {
            program: v("prg_program"),
            facultyId: v("prg_faculty"),
            degreeAwarded: v("prg_degree"),
            numberOfYears: v("prg_years"),
            educationalSystem: v("prg_system"),
            accreditationDate: v("prg_acc"),
            graduationDateOfLastRegiment: v("prg_gradlast"),
        };

        if (addBtn) {
            keepScroll(async () => {
                const url = getAddUrl();
                if (!url) throw new Error("Programs add URL is missing.");

                const html = await post(url, payload);
                container.innerHTML = html;
                showSuccess("Program added successfully.");
                await refreshDependents();
            }).catch(err => showError(err.message || "Add failed."));
            return;
        }

        if (upBtn) {
            const id = v("prg_editId");
            if (!id) {
                showError("Select a row to edit first");
                return;
            }

            keepScroll(async () => {
                const url = getUpdateUrl();
                if (!url) throw new Error("Programs update URL is missing.");

                const html = await post(url, { id, ...payload });
                container.innerHTML = html;
                showSuccess("Program updated successfully.");
                await refreshDependents();
            }).catch(err => showError(err.message || "Update failed."));
            return;
        }
    });

    // On load: hide update if no edit id
    window.addEventListener("load", () => {
        const id = v("prg_editId");
        const up = $("prg_updateBtn");
        const add = $("prg_addBtn");
        if (!id) {
            if (up) up.style.display = "none";
            if (add) add.style.display = "inline-block";
        }
    });

})();