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

    function markMandatoryLabels(sec) {
        if (!sec) return;

        sec.querySelectorAll(".field label:not(.degree-pill):not(.check-label):not(.rank-upload-label):not(.rank-upload-trigger):not(.no-auto-req)").forEach(label => {
            const txt = (label.textContent || "").trim();
            if (!txt) return;
            if (label.querySelector(".req")) return;

            const star = document.createElement("span");
            star.className = "req";
            star.textContent = "*";
            label.appendChild(document.createTextNode(" "));
            label.appendChild(star);
        });
    }

    function collect(sectionId) {
        const sec = document.getElementById(sectionId);
        const data = {};
        if (!sec) return data;

        sec.querySelectorAll("input, select, textarea").forEach(el => {
            const name = el.getAttribute("name");
            if (!name) return;

            if (el.type === "checkbox") {
                if (!(name in data)) data[name] = el.checked ? "true" : "false";
            }
            else data[name] = (el.value ?? "");
        });

        return data;
    }

    function markInvalid(el, isInvalid) {
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function showToast(text, isError) {
        if (window.showAppToast) {
            window.showAppToast(text, isError ? "error" : "success");
            return;
        }
    }

    function bindMultiSelectTools(sec) {
        const map = [
            ["teachingMethodsGroup", "teachingMethodsCount"],
            ["assessmentMethodsGroup", "assessmentMethodsCount"],
            ["platformsGroup", "platformsCount"],
            ["eAssessmentGroup", "eAssessmentCount"]
        ];

        const refreshCount = (groupId, countId) => {
            const root = document.getElementById(groupId);
            const countEl = document.getElementById(countId);
            if (!root || !countEl) return;
            const c = root.querySelectorAll("input[type='checkbox']:checked").length;
            countEl.textContent = `${c} selected`;
        };

        map.forEach(([g, c]) => {
            const root = document.getElementById(g);
            if (!root) return;
            root.querySelectorAll("input[type='checkbox']").forEach(ch => {
                ch.addEventListener("change", () => refreshCount(g, c));
            });
            refreshCount(g, c);
        });

        sec.querySelectorAll(".ms-select-all").forEach(btn => {
            btn.addEventListener("click", () => {
                const g = btn.getAttribute("data-ms-target");
                const root = document.getElementById(g);
                if (!root) return;
                root.querySelectorAll("input[type='checkbox']").forEach(ch => ch.checked = true);
                const pair = map.find(x => x[0] === g);
                if (pair) refreshCount(pair[0], pair[1]);
            });
        });

        sec.querySelectorAll(".ms-clear").forEach(btn => {
            btn.addEventListener("click", () => {
                const g = btn.getAttribute("data-ms-target");
                const root = document.getElementById(g);
                if (!root) return;
                root.querySelectorAll("input[type='checkbox']").forEach(ch => ch.checked = false);
                const pair = map.find(x => x[0] === g);
                if (pair) refreshCount(pair[0], pair[1]);
            });
        });
    }

    function wireInstitutionTypeOther(sec) {
        const typeEl = sec.querySelector("[name='TypeOfAcademicInstitution']");
        const otherWrap = sec.querySelector("#TypeOfAcademicInstitutionOtherWrap");
        const otherEl = sec.querySelector("[name='TypeOfAcademicInstitutionOther']");
        if (!typeEl || !otherWrap || !otherEl) return;

        const toggle = () => {
            const isOther = (typeEl.value || "").trim() === "Others";
            otherWrap.style.display = isOther ? "block" : "none";
            if (!isOther) {
                otherEl.value = "";
                otherEl.classList.remove("input-invalid");
            }
        };

        typeEl.addEventListener("change", toggle);
        toggle();
    }

    const REQUIRED_FIELDS = [
        "TypeOfAcademicInstitution",
        "OfficialRecognitionInHomeCountry",
        "OfficialAccreditationQualityInHomeCountry",

        "CollegeCategoriesCsv",

        "LocalStudentPopulation",
        "ForeignStudentPopulation",
        "JordanianStudentPopulation",
        "TotalStudentPopulation",

        "StaffProfessorFullTimeCount",
        "StaffProfessorPartTimeCount",
        "StaffAssociateProfessorFullTimeCount",
        "StaffAssociateProfessorPartTimeCount",
        "StaffAssistantProfessorFullTimeCount",
        "StaffAssistantProfessorPartTimeCount",
        "StaffResearcherFullTimeCount",
        "StaffResearcherPartTimeCount",
        "StaffTeacherFullTimeCount",
        "StaffTeacherPartTimeCount",
        "StaffAssistantTeacherFullTimeCount",
        "StaffAssistantTeacherPartTimeCount",
        "StaffOthersFullTimeCount",
        "StaffOthersPartTimeCount",
        "StaffPractitionerPscFullTimeCount",
        "StaffPractitionerPscPartTimeCount",
        "StaffPractitionerMscFullTimeCount",
        "StaffPractitionerMscPartTimeCount",

        "TeachingMethodsCsv",
        "AssessmentMethodsCsv",
        "UsesELearning",
        "ForeignGraduatesAllowedToPractice"
    ];

    const DEGREE_CHECKBOXES = [
        "DegreeDiploma",
        "DegreeBSC",
        "DegreeHigherDiploma",
        "DegreeMaster",
        "DegreePhD"
    ];

    function validateRequired(sec) {
        let ok = true;

        sec.querySelectorAll(".input-invalid").forEach(x => x.classList.remove("input-invalid"));

        for (const name of REQUIRED_FIELDS) {
            const el = sec.querySelector(`[name='${name}']`);
            if (!el) continue;

            const v = (el.value ?? "").trim();
            const invalid = v.length === 0;
            markInvalid(el, invalid);
            if (invalid) ok = false;
        }

        const typeEl = sec.querySelector("[name='TypeOfAcademicInstitution']");
        const otherEl = sec.querySelector("[name='TypeOfAcademicInstitutionOther']");
        if (typeEl && otherEl) {
            const needsOther = (typeEl.value || "").trim() === "Others";
            const otherInvalid = needsOther && (otherEl.value || "").trim().length === 0;
            markInvalid(otherEl, otherInvalid);
            if (otherInvalid) ok = false;
        }

        const anyDegree = DEGREE_CHECKBOXES.some(n => sec.querySelector(`[name='${n}']`)?.checked);
        if (!anyDegree) ok = false;

        const anySystem = [
            "SystemYearlyProgram",
            "SystemSemesterProgram",
            "SystemCreditHours",
            "SystemECTS"
        ].some(n => sec.querySelector(`[name='${n}']`)?.checked);
        if (!anySystem) ok = false;

        const collegeCats = Array.from(sec.querySelectorAll("input[data-group='college-categories']"));
        if (collegeCats.length) {
            const anyCat = collegeCats.some(ch => ch.checked);
            if (!anyCat) {
                collegeCats.forEach(ch => markInvalid(ch, true));
                ok = false;
            } else {
                collegeCats.forEach(ch => markInvalid(ch, false));
            }
        }

        const usesELearning = (sec.querySelector("[name='UsesELearning']")?.value || "").trim();
        if (usesELearning !== "No") {
            ["DeliveryType", "ELearningPercentage", "PlatformsCsv", "EAssessmentMethodsCsv"].forEach(name => {
                const el = sec.querySelector(`[name='${name}']`);
                if (!el) return;
                const invalid = (el.value ?? "").toString().trim().length === 0;
                markInvalid(el, invalid);
                if (invalid) ok = false;
            });
        }

        const countFields = [
            "StaffProfessorFullTimeCount",
            "StaffProfessorPartTimeCount",
            "StaffAssociateProfessorFullTimeCount",
            "StaffAssociateProfessorPartTimeCount",
            "StaffAssistantProfessorFullTimeCount",
            "StaffAssistantProfessorPartTimeCount",
            "StaffResearcherFullTimeCount",
            "StaffResearcherPartTimeCount",
            "StaffTeacherFullTimeCount",
            "StaffTeacherPartTimeCount",
            "StaffAssistantTeacherFullTimeCount",
            "StaffAssistantTeacherPartTimeCount",
            "StaffOthersFullTimeCount",
            "StaffOthersPartTimeCount",
            "StaffPractitionerPscFullTimeCount",
            "StaffPractitionerPscPartTimeCount",
            "StaffPractitionerMscFullTimeCount",
            "StaffPractitionerMscPartTimeCount"
        ];

        countFields.forEach(name => {
            const el = sec.querySelector(`[name='${name}']`);
            if (!el) return;
            const raw = (el.value ?? "").toString().trim();
            if (!raw) return;

            const n = Number(raw);
            const invalid = !Number.isInteger(n) || n < 0;
            markInvalid(el, invalid);
            if (invalid) ok = false;
        });

        return ok;
    }

    function highlightFieldFromServerMessage(sec, msg) {
        const m = msg.match(/^([A-Za-z0-9_]+)\b/);
        if (!m) return;

        const fieldName = m[1];
        const el = sec.querySelector(`[name='${fieldName}']`);
        if (el) {
            markInvalid(el, true);
            el.focus();
        }
    }

    function toInt(v) {
        const n = parseInt((v ?? "").toString().trim(), 10);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    }

    function wireAutoTotal(sec) {
        const localEl = sec.querySelector("[name='LocalStudentPopulation']");
        const foreignEl = sec.querySelector("[name='ForeignStudentPopulation']");
        const jordanianEl = sec.querySelector("[name='JordanianStudentPopulation']");
        const totalEl = sec.querySelector("[name='TotalStudentPopulation']");
        if (!localEl || !foreignEl || !jordanianEl || !totalEl) return;

        const compute = () => {
            const total = toInt(localEl.value) + toInt(foreignEl.value) + toInt(jordanianEl.value);
            totalEl.value = total.toString();
        };

        [localEl, foreignEl, jordanianEl].forEach(el => {
            el.addEventListener("input", compute);
            el.addEventListener("change", compute);
        });

        compute();
    }

    function wireStudentsToFacultyRatio(sec) {
        const totalStudentsEl = sec.querySelector("[name='TotalStudentPopulation']");
        const ratioEl = sec.querySelector("[name='StudentsToFacultyRatio']");
        const displayEl = document.getElementById("StudentsToFacultyRatioDisplay");
        const statusEl = document.getElementById("studentsFacultyStatus");
        if (!totalStudentsEl || !ratioEl) return;

        const applyStatus = (status, label) => {
            if (!displayEl || !statusEl) return;
            const styles = {
                green: { border: "2px solid #22c55e", background: "#f0fdf4", badgeBg: "#ecfdf3", badgeBorder: "#bbf7d0", badgeColor: "#166534" },
                orange: { border: "2px solid #f59e0b", background: "#fffbeb", badgeBg: "#fff7ed", badgeBorder: "#fed7aa", badgeColor: "#9a3412" },
                red: { border: "2px solid #ef4444", background: "#fef2f2", badgeBg: "#fef2f2", badgeBorder: "#fecaca", badgeColor: "#991b1b" }
            };

            const s = styles[status];
            if (!s) return;

            displayEl.style.border = s.border;
            displayEl.style.background = s.background;

            statusEl.textContent = label;
            statusEl.style.backgroundColor = s.badgeBg;
            statusEl.style.borderColor = s.badgeBorder;
            statusEl.style.color = s.badgeColor;
        };

        const clearStatus = () => {
            if (displayEl) {
                displayEl.style.border = "";
                displayEl.style.background = "";
            }
            if (statusEl) {
                statusEl.textContent = "—";
                statusEl.style.backgroundColor = "#f8fafc";
                statusEl.style.borderColor = "#e5e7eb";
                statusEl.style.color = "#64748b";
            }
        };

        const inputs = [
            "StaffProfessorFullTimeCount",
            "StaffAssociateProfessorFullTimeCount",
            "StaffAssistantProfessorFullTimeCount",
            "StaffTeacherFullTimeCount",
            "StaffAssistantTeacherFullTimeCount",
            "StaffOthersFullTimeCount",
            "TotalStudentPopulation"
        ].map(name => sec.querySelector(`[name='${name}']`)).filter(Boolean);

        const compute = () => {
            const totalPhdHolders =
                toInt(sec.querySelector("[name='StaffProfessorFullTimeCount']")?.value) +
                toInt(sec.querySelector("[name='StaffAssociateProfessorFullTimeCount']")?.value) +
                toInt(sec.querySelector("[name='StaffAssistantProfessorFullTimeCount']")?.value) +
                toInt(sec.querySelector("[name='StaffTeacherFullTimeCount']")?.value);

            const allowedMscSupport = Math.ceil(totalPhdHolders * 0.20);
            const actualMscSupport =
                toInt(sec.querySelector("[name='StaffAssistantTeacherFullTimeCount']")?.value) +
                toInt(sec.querySelector("[name='StaffOthersFullTimeCount']")?.value);
            const mscSupportUsed = Math.min(allowedMscSupport, actualMscSupport);

            const totalFacultyForRatio = totalPhdHolders + (totalPhdHolders * 0.10) + mscSupportUsed;
            const totalStudents = toInt(totalStudentsEl.value);

            ratioEl.value = totalFacultyForRatio > 0
                ? Math.ceil(totalStudents / totalFacultyForRatio).toString()
                : "";

            if (displayEl) displayEl.value = ratioEl.value ? `1:${ratioEl.value}` : "";

            const selected = Array.from(sec.querySelectorAll("input[data-group='college-categories']:checked"))
                .map(ch => (ch.value || "").trim())
                .filter(Boolean);

            if (!selected.length || !ratioEl.value) {
                clearStatus();
                return;
            }

            const map = { Scientific: 20, Humanities: 35, Medical: 25, Applied: 20 };
            const ratios = selected.map(k => map[k]).filter(v => Number.isFinite(v));
            if (!ratios.length) {
                clearStatus();
                return;
            }

            const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
            const orangeLimit = avgRatio + (avgRatio * 0.25);
            const numericRatio = Number(ratioEl.value);

            if (numericRatio <= avgRatio) applyStatus("green", "Acceptable");
            else if (numericRatio <= orangeLimit) applyStatus("orange", "Warning");
            else applyStatus("red", "Critical");
        };

        inputs.forEach(el => {
            el.addEventListener("input", compute);
            el.addEventListener("change", compute);
        });

        const collegeCats = sec.querySelectorAll("input[data-group='college-categories']");
        collegeCats.forEach(ch => {
            ch.addEventListener("change", compute);
        });

        compute();
    }

    function parseJsonArray(value) {
        try {
            const parsed = JSON.parse(value || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function createObjectiveRow(value) {
        const row = document.createElement("div");
        row.className = "acad-row objective-row";
        row.innerHTML = `
            <div class="acad-row-top"><button type="button" class="icon-btn" title="Remove">✕</button></div>
            <div class="field" style="margin-bottom:0;">
                <label>Objective Description</label>
                <textarea class="objective-text" rows="2" placeholder="Write program objective...">${value || ""}</textarea>
            </div>`;
        row.querySelector(".icon-btn").addEventListener("click", () => row.remove());
        return row;
    }

    function createOutcomeRow(category, description) {
        const row = document.createElement("div");
        row.className = "acad-row outcome-row";
        row.innerHTML = `
            <div class="acad-row-top"><button type="button" class="icon-btn" title="Remove">✕</button></div>
            <div class="grid-2" style="gap:10px;">
                <div class="field" style="margin-bottom:0;">
                    <label>Category</label>
                    <select class="outcome-category">
                        <option value="Knowledge">Knowledge</option>
                        <option value="Cognitive Skills">Cognitive Skills</option>
                        <option value="Practical Skills">Practical Skills</option>
                        <option value="Communication Skills">Communication Skills</option>
                        <option value="Professional / Ethical Competencies">Professional / Ethical Competencies</option>
                    </select>
                </div>
                <div class="field" style="margin-bottom:0;">
                    <label>Outcome Description</label>
                    <textarea class="outcome-description" rows="2" placeholder="Write measurable learning outcome..."></textarea>
                </div>
            </div>`;

        const cat = row.querySelector(".outcome-category");
        const desc = row.querySelector(".outcome-description");
        if (category) cat.value = category;
        if (description) desc.value = description;

        row.querySelector(".icon-btn").addEventListener("click", () => row.remove());
        return row;
    }

    function setChecksFromCsv(selector, csv) {
        const values = (csv || "").split(";").map(x => x.trim()).filter(Boolean);
        document.querySelectorAll(selector).forEach(ch => {
            ch.checked = values.includes(ch.value);
        });
    }

    function serializeChecks(selector, targetId) {
        const selected = Array.from(document.querySelectorAll(selector))
            .filter(ch => ch.checked)
            .map(ch => ch.value.trim())
            .filter(Boolean);

        const target = document.getElementById(targetId);
        if (target) target.value = selected.join(";");
    }

    function initAdvancedAcademic(sec) {
        const objectivesRows = document.getElementById("objectivesRows");
        const outcomesRows = document.getElementById("outcomesRows");
        const btnAddObjective = document.getElementById("btnAddObjective");
        const btnAddOutcome = document.getElementById("btnAddOutcome");

        if (objectivesRows && btnAddObjective) {
            const existing = parseJsonArray(document.getElementById("ProgramObjectivesJson")?.value);
            if (existing.length) existing.forEach(v => objectivesRows.appendChild(createObjectiveRow(v)));
            else objectivesRows.appendChild(createObjectiveRow(""));

            btnAddObjective.addEventListener("click", () => objectivesRows.appendChild(createObjectiveRow("")));
        }

        if (outcomesRows && btnAddOutcome) {
            const existing = parseJsonArray(document.getElementById("LearningOutcomesJson")?.value);
            if (existing.length) existing.forEach(v => outcomesRows.appendChild(createOutcomeRow(v.category, v.description)));
            else outcomesRows.appendChild(createOutcomeRow("Knowledge", ""));

            btnAddOutcome.addEventListener("click", () => outcomesRows.appendChild(createOutcomeRow("Knowledge", "")));
        }

        setChecksFromCsv("input[data-group='teaching']", document.getElementById("TeachingMethodsCsv")?.value || "");
        setChecksFromCsv("input[data-group='assessment']", document.getElementById("AssessmentMethodsCsv")?.value || "");
        setChecksFromCsv("input[data-group='platforms']", document.getElementById("PlatformsCsv")?.value || "");
        setChecksFromCsv("input[data-group='eassessment']", document.getElementById("EAssessmentMethodsCsv")?.value || "");
        setChecksFromCsv("input[data-group='college-categories']", document.getElementById("CollegeCategoriesCsv")?.value || "");

        const collegeCats = sec.querySelectorAll("input[data-group='college-categories']");
        collegeCats.forEach(ch => {
            ch.addEventListener("change", () => {
                serializeChecks("input[data-group='college-categories']", "CollegeCategoriesCsv");
            });
        });

        const usesElearning = sec.querySelector("[name='UsesELearning']");
        const elearningSection = document.getElementById("acad-elearning");
        const elearningDetailsCard = elearningSection?.querySelector(".acad-adv-card");

        const professionalRegSection = document.getElementById("professionalRegulationSection");
        const clinicalTrainingCheck = sec.querySelector("input[data-group='teaching'][value='Clinical Training']");

        const setDisabledIn = (root, disabled) => {
            if (!root) return;
            root.querySelectorAll("input, select, textarea, button").forEach(el => {
                if (el.id === "btnSaveAcademic") return;
                el.disabled = disabled;
            });
            root.style.opacity = disabled ? "0.55" : "1";
        };

        const toggleElearning = () => {
            if (!usesElearning || !elearningDetailsCard) return;
            const hide = usesElearning.value === "No";
            elearningDetailsCard.style.display = hide ? "none" : "block";
            setDisabledIn(elearningDetailsCard, hide);
        };

        const toggleProfessionalRegulation = () => {
            if (!professionalRegSection || !clinicalTrainingCheck) return;
            const show = clinicalTrainingCheck.checked;
            professionalRegSection.style.display = show ? "block" : "none";
            setDisabledIn(professionalRegSection, !show);
        };

        if (usesElearning) {
            usesElearning.addEventListener("change", toggleElearning);
            toggleElearning();
        }
        if (clinicalTrainingCheck) {
            clinicalTrainingCheck.addEventListener("change", toggleProfessionalRegulation);
            toggleProfessionalRegulation();
        }
    }

    function serializeAdvancedAcademic() {
        const objectives = Array.from(document.querySelectorAll("#objectivesRows .objective-text"))
            .map(t => (t.value || "").trim())
            .filter(Boolean);
        const objectivesHidden = document.getElementById("ProgramObjectivesJson");
        if (objectivesHidden) objectivesHidden.value = JSON.stringify(objectives);

        const outcomes = Array.from(document.querySelectorAll("#outcomesRows .outcome-row")).map(row => ({
            category: (row.querySelector(".outcome-category")?.value || "").trim(),
            description: (row.querySelector(".outcome-description")?.value || "").trim()
        })).filter(x => x.description);
        const outcomesHidden = document.getElementById("LearningOutcomesJson");
        if (outcomesHidden) outcomesHidden.value = JSON.stringify(outcomes);

        serializeChecks("input[data-group='teaching']", "TeachingMethodsCsv");
        serializeChecks("input[data-group='assessment']", "AssessmentMethodsCsv");
        serializeChecks("input[data-group='platforms']", "PlatformsCsv");
        serializeChecks("input[data-group='eassessment']", "EAssessmentMethodsCsv");
        serializeChecks("input[data-group='college-categories']", "CollegeCategoriesCsv");
    }

    function updateCollegeCategoriesUI() {
        const csv = document.getElementById("CollegeCategoriesCsv")?.value || "";
        const categories = csv
            .split(";")
            .map(x => (x || "").trim())
            .filter(Boolean);

        const typeSelect = document.getElementById("fac_type");
        if (typeSelect) {
            const first = document.createElement("option");
            first.value = "";
            first.textContent = "-- Choose --";

            typeSelect.innerHTML = "";
            typeSelect.appendChild(first);

            if (categories.length) {
                categories.forEach(cat => {
                    const opt = document.createElement("option");
                    opt.value = cat;
                    opt.textContent = cat;
                    typeSelect.appendChild(opt);
                });
            } else {
                const opt = document.createElement("option");
                opt.value = "";
                opt.disabled = true;
                opt.textContent = "(Select categories in Academic Info)";
                typeSelect.appendChild(opt);
            }
        }

        const list = document.getElementById("selectedCollegeCategories");
        if (list) {
            list.innerHTML = "";
            if (categories.length) {
                categories.forEach(cat => {
                    const pill = document.createElement("span");
                    pill.className = "degree-pill";
                    pill.style.pointerEvents = "none";
                    const txt = document.createElement("span");
                    txt.textContent = cat;
                    pill.appendChild(txt);
                    list.appendChild(pill);
                });
            } else {
                const empty = document.createElement("span");
                empty.style.color = "#6b7280";
                empty.textContent = "No categories selected.";
                list.appendChild(empty);
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const sec = document.getElementById("sec-academic");
        const btn = document.getElementById("btnSaveAcademic");
        if (!sec || !btn) return;

        const showAcademicBanner = (message, isError) => {
            showToast(message, isError);
        };

        const wireRankFileUploads = () => {
            sec.querySelectorAll(".rank-staff-upload").forEach(input => {
                const shell = input.closest(".rank-upload-shell");
                const note = shell?.querySelector(".rank-upload-note");
                const rankKey = input.getAttribute("data-rank-key") || "";
                const employmentType = input.getAttribute("data-employment-type") || "";

                const hasUploadedName = () => {
                    const txt = (note?.textContent || "").trim();
                    return txt.length > 0;
                };

                const ensureDeleteButton = () => {
                    if (!shell) return null;

                    let btn = shell.querySelector(".rank-upload-delete");
                    if (btn) return btn;

                    btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "rank-upload-delete";
                    btn.textContent = "Delete File";

                    btn.addEventListener("click", async () => {
                        if (!rankKey || !employmentType) return;

                        try {
                            const body = new URLSearchParams();
                            body.set("rankKey", rankKey);
                            body.set("employmentType", employmentType);

                            const res = await fetch("/Home/DeleteAcademicRankStaffFile", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                                },
                                body: body.toString()
                            });

                            if (!res.ok) {
                                let msg = "Delete failed.";
                                try { msg = await res.text(); } catch { }
                                throw new Error(msg);
                            }

                            input.value = "";
                            if (note) note.textContent = "";
                            btn.style.display = "none";
                            showAcademicBanner("Excel file deleted successfully.", false);
                        } catch (e) {
                            showAcademicBanner(e.message || "Delete failed.", true);
                        }
                    });

                    shell.appendChild(btn);
                    return btn;
                };

                const deleteBtn = ensureDeleteButton();
                if (deleteBtn) deleteBtn.style.display = hasUploadedName() ? "inline-flex" : "none";

                input.addEventListener("change", async () => {
                    if (!input.files || !input.files.length) return;

                    const file = input.files[0];
                    if (note) note.textContent = file.name;

                    const data = new FormData();
                    data.append("file", file);
                    data.append("rankKey", rankKey);
                    data.append("employmentType", employmentType);

                    try {
                        const res = await fetch("/Home/UploadAcademicRankStaffFile", {
                            method: "POST",
                            body: data
                        });

                        if (!res.ok) {
                            let msg = "Upload failed.";
                            try { msg = await res.text(); } catch { }
                            throw new Error(msg);
                        }

                        const json = await res.json();
                        if (note) note.textContent = json.fileName || file.name;
                        if (deleteBtn) deleteBtn.style.display = "inline-flex";

                        showAcademicBanner("Excel file uploaded successfully.", false);
                    } catch (e) {
                        if (deleteBtn) deleteBtn.style.display = hasUploadedName() ? "inline-flex" : "none";
                        showAcademicBanner(e.message || "Upload failed.", true);
                    }
                });
            });
        };

        markMandatoryLabels(sec);
        wireAutoTotal(sec);
        wireStudentsToFacultyRatio(sec);
        wireInstitutionTypeOther(sec);
        initAdvancedAcademic(sec);
        bindMultiSelectTools(sec);
        wireRankFileUploads();

        btn.addEventListener("click", async () => {
            try {
                serializeAdvancedAcademic();

                if (!validateRequired(sec)) {
                    showToast("Please fill all required fields with valid non-negative numbers.", true);
                    return;
                }

                const url = btn.getAttribute("data-save-url");
                if (!url) {
                    showToast("Save URL is missing.", true);
                    return;
                }

                const data = collect("sec-academic");
                await postForm(url, data);
                showToast("Academic Info saved successfully.", false);
                window.scrollToNextSection("sec-academic");
                updateCollegeCategoriesUI();
                if (typeof window.LoadLaboratoriesSection === "function") {
                    window.LoadLaboratoriesSection();
                }
            } catch (e) {
                const msg = e.message || "Save failed.";
                showToast(msg, true);
                highlightFieldFromServerMessage(sec, msg);
            }
        });

        // College category info icon tooltips
        const catTooltip = document.getElementById("cat-tooltip-popup");
        if (catTooltip) {
            function showCatTooltip(wrap) {
                const label = wrap.dataset.catLabel || '';
                const programs = wrap.dataset.catPrograms || '';
                catTooltip.innerHTML = '';
                const head = document.createElement('div');
                head.className = 'cat-tt-head';
                head.textContent = label;
                const body = document.createElement('div');
                body.className = 'cat-tt-body';
                body.textContent = 'Includes faculties & programs such as: ' + programs;
                catTooltip.appendChild(head);
                catTooltip.appendChild(body);
                catTooltip.style.display = 'block';
                const rect = wrap.getBoundingClientRect();
                const tw = catTooltip.offsetWidth;
                const th = catTooltip.offsetHeight;
                let left = rect.left + rect.width / 2 - tw / 2;
                let top = rect.top - th - 10;
                left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
                if (top < 8) top = rect.bottom + 10;
                catTooltip.style.left = left + 'px';
                catTooltip.style.top = top + 'px';
            }

            function hideCatTooltip() {
                catTooltip.style.display = 'none';
            }

            sec.querySelectorAll('.cat-info-btn').forEach(wrap => {
                wrap.addEventListener('mouseenter', function () { showCatTooltip(this); });
                wrap.addEventListener('mouseleave', hideCatTooltip);
                wrap.addEventListener('focus', function () { showCatTooltip(this); });
                wrap.addEventListener('blur', hideCatTooltip);
            });

            window.addEventListener('scroll', hideCatTooltip, true);
        }
    });
})();