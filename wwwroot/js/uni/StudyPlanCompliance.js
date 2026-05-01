(function () {
    const containerId = "studyPlanComplianceContainer";

    function $(id) { return document.getElementById(id); }
    function getContainer() { return document.getElementById(containerId); }
    function getUrl(attr) { const c = getContainer(); return c ? c.getAttribute(attr) : null; }

    function ensureBanner(sectionEl) {
        let b = sectionEl.querySelector("#spcBanner");
        if (!b) {
            b = document.createElement("div");
            b.id = "spcBanner";
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
        const sec = document.getElementById("sec-studyplan") || getContainer();
        if (!sec) return;
        const b = ensureBanner(sec);
        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = msg;
    }

    function clearError() {
        const sec = document.getElementById("sec-studyplan") || getContainer();
        if (!sec) return;
        const b = sec.querySelector("#spcBanner");
        if (b) b.style.display = "none";
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function setMode(mode) {
        const editing = mode === "edit";
        $("spc_addBtn").style.display = editing ? "none" : "inline-block";
        $("spc_updateBtn").style.display = editing ? "inline-block" : "none";
        $("spc_cancelBtn").style.display = editing ? "inline-block" : "none";
        $("spc_programId").disabled = editing;
    }

    function clearForm() {
        ["spc_editId", "spc_programId", "spc_uniReq", "spc_facReq", "spc_specReq", "spc_theoreticalHours", "spc_practicalHours", "spc_theoryPct", "spc_practicalPct", "spc_domains", "spc_trainingMonths", "spc_gradProjectHours", "spc_ruleRef"]
            .forEach(id => { if ($(id)) $(id).value = id === "spc_ruleRef" ? "AQACHEI-4" : ""; });
        setMode("add");
    }

    function validate(data, needProgram) {
        if (needProgram && !data.programId) return "Program is required.";
        const required = ["universityRequirementsHours", "facultyRequirementsHours", "specializationRequirementsHours", "theoreticalHours", "practicalHours", "specializationTheoreticalPercent", "specializationPracticalPercent", "basicDomainsCount", "practicalTrainingMonths", "graduationProjectHours"];
        for (const k of required) {
            if (data[k] === "") return "All fields are required.";
            if (Number(data[k]) < 0) return "Values cannot be negative.";
        }
        const t = Number(data.specializationTheoreticalPercent);
        const p = Number(data.specializationPracticalPercent);
        if (t > 100 || p > 100) return "Percentages must be between 0 and 100.";
        if (t + p !== 100) return "Theoretical + Practical percentage must equal 100.";
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

    async function loadPartialNoJump() {
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
            clearForm();
        } finally {
            unlock();
        }
    }

    // expose refresh helper so Programs section can refresh this dropdown after add/update/delete
    window.refreshStudyPlanComplianceNoJump = async function () {
        await loadPartialNoJump();
    };

    document.addEventListener("click", async function (e) {
        const container = getContainer();
        if (!container) return;

        const addBtn = e.target.closest("#spc_addBtn");
        const upBtn = e.target.closest("#spc_updateBtn");
        const cancelBtn = e.target.closest("#spc_cancelBtn");
        const delBtn = e.target.closest(".spc-del");
        const editBtn = e.target.closest(".spc-edit");

        if (!addBtn && !upBtn && !cancelBtn && !delBtn && !editBtn) return;

        clearError();

        const y = window.scrollY || 0;
        const unlock = lockHeight(container);

        try {
            if (editBtn) {
                $("spc_editId").value = editBtn.getAttribute("data-id") || "";
                $("spc_programId").value = editBtn.getAttribute("data-programid") || "";
                $("spc_uniReq").value = editBtn.getAttribute("data-unireq") || "";
                $("spc_facReq").value = editBtn.getAttribute("data-facreq") || "";
                $("spc_specReq").value = editBtn.getAttribute("data-specreq") || "";
                $("spc_theoreticalHours").value = editBtn.getAttribute("data-theoreticalhours") || "";
                $("spc_practicalHours").value = editBtn.getAttribute("data-practicalhours") || "";
                $("spc_theoryPct").value = editBtn.getAttribute("data-theorypct") || "";
                $("spc_practicalPct").value = editBtn.getAttribute("data-practicalpct") || "";
                $("spc_domains").value = editBtn.getAttribute("data-domains") || "";
                $("spc_trainingMonths").value = editBtn.getAttribute("data-trainingmonths") || "";
                $("spc_gradProjectHours").value = editBtn.getAttribute("data-gradprojecthours") || "";
                $("spc_ruleRef").value = editBtn.getAttribute("data-ruleref") || "AQACHEI-4";
                setMode("edit");
                unlock();
                return;
            }

            if (cancelBtn) {
                clearForm();
                window.scrollTo(0, y);
                unlock();
                return;
            }

            const data = {
                programId: $("spc_programId")?.value || "",
                universityRequirementsHours: $("spc_uniReq")?.value ?? "",
                facultyRequirementsHours: $("spc_facReq")?.value ?? "",
                specializationRequirementsHours: $("spc_specReq")?.value ?? "",
                theoreticalHours: $("spc_theoreticalHours")?.value ?? "",
                practicalHours: $("spc_practicalHours")?.value ?? "",
                specializationTheoreticalPercent: $("spc_theoryPct")?.value ?? "",
                specializationPracticalPercent: $("spc_practicalPct")?.value ?? "",
                basicDomainsCount: $("spc_domains")?.value ?? "",
                practicalTrainingMonths: $("spc_trainingMonths")?.value ?? "",
                graduationProjectHours: $("spc_gradProjectHours")?.value ?? "",
                ruleReference: $("spc_ruleRef")?.value || "AQACHEI-4"
            };

            if (addBtn) {
                const err = validate(data, true);
                if (err) { showError(err); unlock(); return; }
                const html = await post(getUrl("data-add-url"), data);
                container.innerHTML = html;
                clearForm();
                window.scrollTo(0, y);
                unlock();
                return;
            }

            if (upBtn) {
                const id = $("spc_editId")?.value || "";
                if (!id) { showError("Select a row to edit first."); unlock(); return; }
                const err = validate(data, false);
                if (err) { showError(err); unlock(); return; }
                const html = await post(getUrl("data-update-url"), { id, ...data });
                container.innerHTML = html;
                clearForm();
                window.scrollTo(0, y);
                unlock();
                return;
            }

            if (delBtn) {
                const id = delBtn.getAttribute("data-id") || "";
                const html = await post(getUrl("data-del-url"), { id });
                container.innerHTML = html;
                clearForm();
                window.scrollTo(0, y);
                unlock();
            }
        } catch (err) {
            unlock();
            showError(err.message || "Error");
        }
    });

    document.addEventListener("DOMContentLoaded", loadPartialNoJump);
})();
