// wwwroot/js/Faculties.js
(function () {

    const containerId = "faculties-container";
    const sectionId = "sec-faculties";

    function container() { return document.getElementById(containerId); }
    function sec() { return document.getElementById(sectionId); }

    function showBanner(type, msg) {
        const s = sec();
        if (!s) return;
        const b = s.querySelector("#facBanner");
        if (!b) return;

        b.style.display = "flex";
        b.classList.remove("ok", "warn");
        b.classList.add(type === "ok" ? "ok" : "warn");
        b.querySelector(".txt").textContent = msg;
    }

    function hideBanner() {
        const s = sec();
        if (!s) return;
        const b = s.querySelector("#facBanner");
        if (b) b.style.display = "none";
    }

    async function post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams(data).toString()
        });

        if (!res.ok) {
            const t = await res.text().catch(() => "");
            throw new Error(t || "Request failed.");
        }
        return await res.text();
    }

    async function refreshPartial(targetId, url) {
        const target = document.getElementById(targetId);
        if (!target) return;

        const y = window.scrollY || 0;
        const h = target.offsetHeight;
        target.style.minHeight = h + "px";

        try {
            const res = await fetch(url);
            const html = await res.text();
            target.innerHTML = html;
        } finally {
            target.style.minHeight = "";
            window.scrollTo(0, y);
        }
    }

    async function refreshDependentSections() {
        // Programs uses faculties
        await refreshPartial("programs-container", "/Home/ProgramsPartial");

        // Students Numbers depends on programs
        await refreshPartial("studentsNumbersContainer", "/Home/StudentsNumbersPartial");

        // Laboratories uses faculties
        await refreshPartial("laboratoriesContainer", "/Home/LaboratoriesPartial");
    }
    function setEditMode(id, name) {
        const editId = document.getElementById("fac_editId");
        const input = document.getElementById("fac_name");
        const btn = document.getElementById("fac_btnAdd");
        if (!editId || !input || !btn) return;

        editId.value = id;
        input.value = name || "";
        btn.textContent = "Save";
        input.focus();
    }

    function clearEditMode() {
        const editId = document.getElementById("fac_editId");
        const input = document.getElementById("fac_name");
        const btn = document.getElementById("fac_btnAdd");

        if (editId) editId.value = "";
        if (input) input.value = "";
        if (btn) btn.textContent = "Add";
    }

    document.addEventListener("click", async (e) => {
        const c = container();
        if (!c) return;

        // Only handle clicks inside faculties container
        if (!e.target.closest(`#${containerId}`)) return;

        const addBtn = e.target.closest("[data-fac-add]");
        const delBtn = e.target.closest("[data-fac-del]");
        const editBtn = e.target.closest("[data-fac-edit]");

        try {
            // EDIT (pen)
            if (editBtn) {
                hideBanner();
                setEditMode(editBtn.getAttribute("data-id"), editBtn.getAttribute("data-name"));
                return;
            }

            // DELETE (X) - no confirm (as you wanted)
            if (delBtn) {
                const id = delBtn.getAttribute("data-id");
                if (!id) return;

                hideBanner();
                const html = await post("/Home/FacultiesDelete", { id });
                c.innerHTML = html;

                clearEditMode();
                await refreshDependentSections();
                showBanner("ok", "Deleted successfully.");
                return;
            }

            // ADD / SAVE
            if (addBtn) {
                const input = document.getElementById("fac_name");
                const editId = document.getElementById("fac_editId");

                const facultyName = (input?.value || "").trim();
                const id = (editId?.value || "").trim();

                if (!facultyName) {
                    showBanner("warn", "Please enter faculty name.");
                    return;
                }

                hideBanner();

                const html = id
                    ? await post("/Home/FacultiesUpdate", { id, facultyName })
                    : await post("/Home/FacultiesAdd", { facultyName });

                c.innerHTML = html;

                clearEditMode();
                await refreshDependentSections();
                showBanner("ok", id ? "Updated successfully." : "Added successfully.");
                return;
            }
        } catch (err) {
            showBanner("warn", err.message || "Something went wrong.");
        }
    });

})();