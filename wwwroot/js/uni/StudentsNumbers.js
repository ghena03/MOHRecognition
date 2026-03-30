(function () {
    const containerId = "studentsNumbersContainer";

    function $(id) { return document.getElementById(id); }

    function getContainer() {
        return document.getElementById(containerId);
    }

    // URLs come from HTML data-attributes (no Razor inside JS)
    function getUrl(name) {
        const c = getContainer();
        return c ? c.getAttribute(name) : null;
    }

    function ensureBanner(sectionEl) {
        let b = sectionEl.querySelector("#studentsBanner");
        if (!b) {
            b = document.createElement("div");
            b.id = "studentsBanner";
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
        const sec = document.getElementById("sec-students") || getContainer();
        if (!sec) return;
        const b = ensureBanner(sec);
        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = msg;
    }

    function clearError() {
        const sec = document.getElementById("sec-students") || getContainer();
        if (!sec) return;
        const b = sec.querySelector("#studentsBanner");
        if (b) b.style.display = "none";
    }

    function markInvalid(el, isInvalid) {
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function calcTotal() {
        const v = (id) => parseInt($(id)?.value || "0", 10);
        const total = v("sn_y1") + v("sn_y2") + v("sn_y3") + v("sn_y4") + v("sn_y5") + v("sn_y6");
        const t = $("sn_total");
        if (t) t.value = total;
    }

    function bindInputsForTotal() {
        ["sn_y1", "sn_y2", "sn_y3", "sn_y4", "sn_y5", "sn_y6"].forEach(id => {
            const el = $(id);
            if (el) el.oninput = calcTotal;
        });
        calcTotal();
    }

    function setMode(mode) {
        const editing = mode === "edit";
        const addBtn = $("sn_addBtn");
        const upBtn = $("sn_updateBtn");
        const cancelBtn = $("sn_cancelBtn");
        const program = $("sn_programId");

        if (addBtn) addBtn.style.display = editing ? "none" : "inline-block";
        if (upBtn) upBtn.style.display = editing ? "inline-block" : "none";
        if (cancelBtn) cancelBtn.style.display = editing ? "inline-block" : "none";

        if (program) program.disabled = editing;
    }

    function clearForm() {
        if ($("sn_editId")) $("sn_editId").value = "";
        if ($("sn_programId")) $("sn_programId").value = "";
        ["sn_y1", "sn_y2", "sn_y3", "sn_y4", "sn_y5", "sn_y6"].forEach(id => { if ($(id)) $(id).value = ""; });
        calcTotal();
        setMode("add");
    }

    function clearInvalid() {
        ["sn_programId", "sn_y1", "sn_y2", "sn_y3", "sn_y4", "sn_y5", "sn_y6"].forEach(id => markInvalid($(id), false));
    }

    function validateAdd(programId, y1, y2, y3, y4, y5, y6) {
        if (!programId) return { msg: "Program is required", field: "sn_programId" };
        if (y1 === "") return { msg: "Year 1 is required", field: "sn_y1" };
        if (y2 === "") return { msg: "Year 2 is required", field: "sn_y2" };
        if (y3 === "") return { msg: "Year 3 is required", field: "sn_y3" };
        if (y4 === "") return { msg: "Year 4 is required", field: "sn_y4" };
        if (y5 === "") return { msg: "Year 5 is required", field: "sn_y5" };
        if (y6 === "") return { msg: "Year 6 is required", field: "sn_y6" };
        return null;
    }

    function validateYears(y1, y2, y3, y4, y5, y6) {
        if (y1 === "") return { msg: "Year 1 is required", field: "sn_y1" };
        if (y2 === "") return { msg: "Year 2 is required", field: "sn_y2" };
        if (y3 === "") return { msg: "Year 3 is required", field: "sn_y3" };
        if (y4 === "") return { msg: "Year 4 is required", field: "sn_y4" };
        if (y5 === "") return { msg: "Year 5 is required", field: "sn_y5" };
        if (y6 === "") return { msg: "Year 6 is required", field: "sn_y6" };
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
        return txt;
    }

    async function loadStudentsPartialNoJump() {
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

            bindInputsForTotal();
            setMode("add");
        } finally {
            unlock();
        }
    }

    // expose init for other sections (Programs) to refresh students
    window.initStudentsNumbers = function () {
        bindInputsForTotal();
        setMode("add");
    };

    // expose refresh helper for other sections
    window.refreshStudentsNumbersNoJump = async function () {
        await loadStudentsPartialNoJump();
    };

    // click handler (works after partial HTML replace)
    document.addEventListener("click", async function (e) {
        const container = getContainer();
        if (!container) return;

        const addBtn = e.target.closest("#sn_addBtn");
        const upBtn = e.target.closest("#sn_updateBtn");
        const cancelBtn = e.target.closest("#sn_cancelBtn");
        const delBtn = e.target.closest(".sn-del");
        const editBtn = e.target.closest(".sn-edit");

        if (!addBtn && !upBtn && !cancelBtn && !delBtn && !editBtn) return;

        clearError();
        clearInvalid();

        const y = window.scrollY || 0;
        const unlock = lockHeight(container);

        try {
            // EDIT
            if (editBtn) {
                $("sn_editId").value = editBtn.getAttribute("data-id") || "";
                $("sn_programId").value = editBtn.getAttribute("data-programid") || "";
                $("sn_y1").value = editBtn.getAttribute("data-y1") || "";
                $("sn_y2").value = editBtn.getAttribute("data-y2") || "";
                $("sn_y3").value = editBtn.getAttribute("data-y3") || "";
                $("sn_y4").value = editBtn.getAttribute("data-y4") || "";
                $("sn_y5").value = editBtn.getAttribute("data-y5") || "";
                $("sn_y6").value = editBtn.getAttribute("data-y6") || "";
                calcTotal();
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

            const programId = $("sn_programId")?.value || "";
            const y1 = $("sn_y1")?.value ?? "";
            const y2 = $("sn_y2")?.value ?? "";
            const y3 = $("sn_y3")?.value ?? "";
            const y4 = $("sn_y4")?.value ?? "";
            const y5 = $("sn_y5")?.value ?? "";
            const y6 = $("sn_y6")?.value ?? "";

            // ADD
            if (addBtn) {
                const vErr = validateAdd(programId, y1, y2, y3, y4, y5, y6);
                if (vErr) {
                    showError(vErr.msg);
                    const el = $(vErr.field);
                    markInvalid(el, true);
                    el?.focus();
                    unlock();
                    return;
                }

                const addUrl = getUrl("data-add-url");
                if (!addUrl) throw new Error("Students add URL is missing.");

                const html = await post(addUrl, { programId, year1: y1, year2: y2, year3: y3, year4: y4, year5: y5, year6: y6 });
                container.innerHTML = html;
                window.scrollTo(0, y);

                window.initStudentsNumbers();
                clearForm();
                unlock();
                return;
            }

            // UPDATE YEARS
            if (upBtn) {
                const id = $("sn_editId")?.value || "";
                if (!id) {
                    showError("Select a row to edit first");
                    unlock();
                    return;
                }

                const vErr = validateYears(y1, y2, y3, y4, y5, y6);
                if (vErr) {
                    showError(vErr.msg);
                    const el = $(vErr.field);
                    markInvalid(el, true);
                    el?.focus();
                    unlock();
                    return;
                }

                const updateUrl = getUrl("data-update-url");
                if (!updateUrl) throw new Error("Students update URL is missing.");

                const html = await post(updateUrl, { id, year1: y1, year2: y2, year3: y3, year4: y4, year5: y5, year6: y6 });
                container.innerHTML = html;
                window.scrollTo(0, y);

                window.initStudentsNumbers();
                clearForm();
                unlock();
                return;
            }

            // DELETE
            if (delBtn) {
                const id = delBtn.getAttribute("data-id") || "";

                const delUrl = getUrl("data-del-url");
                if (!delUrl) throw new Error("Students delete URL is missing.");

                const html = await post(delUrl, { id });
                container.innerHTML = html;
                window.scrollTo(0, y);

                window.initStudentsNumbers();
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

    document.addEventListener("DOMContentLoaded", loadStudentsPartialNoJump);
})();
