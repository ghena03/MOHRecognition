(function () {

    async function postForm(url, dataObj) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams(dataObj).toString()
        });

        if (!res.ok) {
            let msg = "Save failed.";
            try { msg = await res.text(); } catch { }
            throw new Error(msg);
        }
    }

    function collect(sectionId) {
        const sec = document.getElementById(sectionId);
        const data = {};
        if (!sec) return data;

        sec.querySelectorAll("input, select, textarea").forEach(el => {
            const name = el.getAttribute("name");
            if (!name) return;

            if (el.type === "checkbox") data[name] = el.checked ? "true" : "false";
            else data[name] = (el.value ?? "");
        });

        return data;
    }

    function markInvalid(el, isInvalid) {
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function showError(sec, text) {
        let b = sec.querySelector("#academicBanner");
        if (!b) {
            b = document.createElement("div");
            b.id = "academicBanner";
            b.className = "banner warn";
            b.style.marginTop = "12px";
            b.innerHTML = `<span class="dot"></span><span class="txt"></span><button type="button" class="x">×</button>`;

            const bd = sec.querySelector(".card-bd") || sec;
            bd.insertBefore(b, bd.firstChild);

            b.querySelector(".x").addEventListener("click", () => (b.style.display = "none"));
        }

        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = text;
    }

    // ✅ These are the required fields (based on the * in your Academic section)
    const REQUIRED_FIELDS = [
        "TypeOfAcademicInstitution",
        "OfficialRecognitionInHomeCountry",
        "OfficialAccreditationQualityInHomeCountry",
        "LanguageForDomesticStudents",
        "LanguageForForeignStudents",
        "ForeignStudentsJointClassroomsWithLocal",

        "JordanianStudentPopulation",
        "TotalStudentPopulation",

        "StaffProfessor",
        "StaffAssociateProfessor",
        "StaffAssistantProfessor",
        "StaffLabAssistant",
        "StaffResearcher",
        "StaffTeacher",
        "StaffAssistantTeacher",

        "ResearchItemsScopus",
        "ResearchItemsOtherSearchEngines"
    ];

    // ✅ At least one of these must be checked (Degrees in institution *)
    const DEGREE_CHECKBOXES = [
        "DegreeDiploma",
        "DegreeBSC",
        "DegreeHigherDiploma",
        "DegreeMaster",
        "DegreePhD"
    ];

    function validateRequired(sec) {
        let ok = true;

        // clear previous invalid marks
        sec.querySelectorAll(".input-invalid").forEach(x => x.classList.remove("input-invalid"));

        // required text/select/number fields
        for (const name of REQUIRED_FIELDS) {
            const el = sec.querySelector(`[name='${name}']`);
            if (!el) continue;

            const v = (el.value ?? "").trim();
            const invalid = v.length === 0;
            markInvalid(el, invalid);
            if (invalid) ok = false;
        }

        // degrees: at least one checkbox checked
        const anyDegree = DEGREE_CHECKBOXES.some(n => sec.querySelector(`[name='${n}']`)?.checked);
        if (!anyDegree) ok = false;

        return ok;
    }

    function highlightFieldFromServerMessage(sec, msg) {
        // expecting: "FieldName is required." OR "FieldName has invalid format..."
        const m = msg.match(/^([A-Za-z0-9_]+)\b/);
        if (!m) return;

        const fieldName = m[1];
        const el = sec.querySelector(`[name='${fieldName}']`);
        if (el) {
            markInvalid(el, true);
            el.focus();
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const sec = document.getElementById("sec-academic");
        const btn = document.getElementById("btnSaveAcademic");
        if (!sec || !btn) return;

        btn.addEventListener("click", async () => {
            try {
                if (!validateRequired(sec)) {
                    showError(sec, "Please fill all required fields (and select at least one degree) before saving.");
                    return;
                }

                const url = btn.getAttribute("data-save-url");
                if (!url) {
                    showError(sec, "Save URL is missing.");
                    return;
                }

                const data = collect("sec-academic");
                await postForm(url, data);

                // no success message
                const b = sec.querySelector("#academicBanner");
                if (b) b.style.display = "none";

            } catch (e) {
                const msg = e.message || "Save failed.";
                showError(sec, msg);
                highlightFieldFromServerMessage(sec, msg);
            }
        });
    });

})();