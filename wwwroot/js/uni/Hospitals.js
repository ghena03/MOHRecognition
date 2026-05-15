 (function () {
    const containerId = "hospitalsContainer";

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

    function showBanner(message, isError) {
        if (window.showAppToast) {
            window.showAppToast(message, isError ? "error" : "success");
            return;
        }
        const banner = document.getElementById("hospBanner");
        if (!banner) return;
        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;
        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function isNonNegativeInteger(value) {
        if (value === "") return false;
        const n = Number(value);
        return Number.isInteger(n) && n >= 0;
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function bindPendingFiles(inputId, pendingId) {
        const input = document.getElementById(inputId);
        const box = document.getElementById(pendingId);
        if (!input || !box) return;

        const escapeHtml = (value) => (value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#39;");

        const renderPending = () => {
            const files = Array.from(input.files || []);
            if (!files.length) {
                box.style.display = "none";
                box.innerHTML = "";
                return;
            }

            box.style.display = "block";
            box.innerHTML = `
                <div class="hosp-selected-title">Pending upload (${files.length})</div>
                <ul class="hosp-selected-list">
                    ${files.map(f => `<li>${escapeHtml(f.name)}</li>`).join("")}
                </ul>
            `;
        };

        input.addEventListener("change", renderPending);
        renderPending();
    }

    function bindAllPendingFiles() {
        bindFacilityAgreementHint();
    }

    function bindFacilityAgreementHint() {
        const input = document.getElementById("hosp_fac_agreement_files");
        const hint = document.getElementById("hosp_fac_agreement_files_hint");
        const selected = document.getElementById("hosp_fac_agreement_files_selected");
        if (!input || !hint) return;

        input.addEventListener("change", () => {
            const files = input.files;
            if (!files || files.length === 0) {
                hint.textContent = "";
            } else if (files.length === 1) {
                hint.textContent = files[0].name;
            } else {
                hint.textContent = files.length + " files selected";
            }
            if (selected) {
                selected.innerHTML = "";
                selected.classList.remove("is-visible");
            }
        });
    }

    async function loadPartial(showMessage, message, isError, keepScroll = true) {
        const c = getContainer();
        if (!c) return;
        const url = getUrl("data-load-url");
        if (!url) return;

        const y      = window.scrollY || 0;
        const unlock = lockHeight(c);

        try {
            const res  = await fetch(url, { cache: "no-store" });
            const html = await res.text();
            render(html);
            bindAllPendingFiles();
            if (showMessage && message) showBanner(message, isError);
            if (keepScroll) window.scrollTo(0, y);
        } finally {
            unlock();
        }
    }

    function clearFacilityForm() {
        const editId         = document.getElementById("hosp_fac_editId");
        const specialization = document.getElementById("hosp_fac_specialization");
        const name           = document.getElementById("hosp_fac_name");
        const beds           = document.getElementById("hosp_fac_beds");
        const dental         = document.getElementById("hosp_fac_dental");
        const addBtn         = document.getElementById("hosp_fac_addBtn");
        const cancelBtn      = document.getElementById("hosp_fac_cancelBtn");
        const formTitle      = document.getElementById("hosp_fac_formTitle");
        const agreementFiles = document.getElementById("hosp_fac_agreement_files");

        if (editId)         editId.value         = "";
        if (specialization) specialization.value = "";
        if (name)           name.value           = "";
        if (beds)           beds.value           = "";
        if (dental)         dental.value         = "";
        if (addBtn)         addBtn.textContent   = "Add Facility";
        if (cancelBtn)      cancelBtn.style.display = "none";
        if (formTitle)      formTitle.textContent   = "Add Facility";
        if (agreementFiles) agreementFiles.value = "";
        const agreementHint = document.getElementById("hosp_fac_agreement_files_hint");
        if (agreementHint) agreementHint.textContent = "No files selected";
        const agreementSelected = document.getElementById("hosp_fac_agreement_files_selected");
        if (agreementSelected) {
            agreementSelected.innerHTML = "";
            agreementSelected.classList.remove("is-visible");
        }

        window.HospFacilityToggleCapacity();
    }

    // ── Capacity toggle ────────────────────────────────────────────────────
    window.HospFacilityToggleCapacity = function () {
        const spec       = (document.getElementById("hosp_fac_specialization")?.value || "").trim();
        const capacityWrap = document.getElementById("hosp_fac_capacity_wrap");
        const capacityEmpty = document.getElementById("hosp_fac_capacity_empty");
        const capacityInputs = capacityWrap ? capacityWrap.querySelector(".hosp-capacity-inputs") : null;
        const bedsWrap   = document.getElementById("hosp_fac_beds_wrap");
        const dentalWrap = document.getElementById("hosp_fac_dental_wrap");
        const bedsInput  = document.getElementById("hosp_fac_beds");
        const dentalInput = document.getElementById("hosp_fac_dental");

        const isMed  = /^medicine$/i.test(spec);
        const isDent = /^dentistry$/i.test(spec);
        const isBoth = /^both$/i.test(spec);

        if (capacityWrap) capacityWrap.style.display = "";
        if (capacityEmpty) capacityEmpty.style.display = (isMed || isDent || isBoth) ? "none" : "";
        if (bedsWrap)   bedsWrap.style.display   = (isMed  || isBoth) ? "" : "none";
        if (dentalWrap) dentalWrap.style.display = (isDent || isBoth) ? "" : "none";
        if (capacityInputs) {
            capacityInputs.classList.toggle("is-dual", isBoth);
            capacityInputs.classList.toggle("is-single", isMed || isDent);
            capacityInputs.classList.toggle("is-empty", !(isMed || isDent || isBoth));
        }
        if (bedsInput && !(isMed || isBoth)) bedsInput.value = "";
        if (dentalInput && !(isDent || isBoth)) dentalInput.value = "";
    };

    // ── Add / Update facility ──────────────────────────────────────────────
    window.HospFacilityAdd = async function () {
        const editId         = (document.getElementById("hosp_fac_editId")?.value        || "").trim();
        const specialization = (document.getElementById("hosp_fac_specialization")?.value || "").trim();
        const name           = (document.getElementById("hosp_fac_name")?.value           || "").trim();
        const beds           = (document.getElementById("hosp_fac_beds")?.value           || "").trim();
        const dental         = (document.getElementById("hosp_fac_dental")?.value         || "").trim();
        const agreementFiles = Array.from(document.getElementById("hosp_fac_agreement_files")?.files || []);

        if (!specialization || !name) {
            showBanner("Please fill all required fields.", true);
            return;
        }

        const isMed  = /^medicine$/i.test(specialization);
        const isDent = /^dentistry$/i.test(specialization);
        const isBoth = /^both$/i.test(specialization);

        if ((isMed || isBoth)  && beds   !== "" && !isNonNegativeInteger(beds)) {
            showBanner("Please enter a valid number of beds.", true);
            return;
        }
        if ((isDent || isBoth) && dental !== "" && !isNonNegativeInteger(dental)) {
            showBanner("Please enter a valid number of dental chairs.", true);
            return;
        }

        const url = editId
            ? getUrl("data-facility-update-url")
            : getUrl("data-facility-add-url");

        if (!url) { showBanner("Request URL is missing.", true); return; }

        const formData = new FormData();
        formData.append("Id",               editId);
        formData.append("Specialization",   specialization);
        formData.append("Name",             name);
        formData.append("BedCapacity",      beds);
        formData.append("DentalChairCapacity", dental);
        agreementFiles.forEach(f => formData.append("AgreementDocuments", f));

        try {
            const res  = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) await loadPartial(true, data.message, false, true);
            else showBanner(data.message || "Something went wrong.", true);
        } catch {
            showBanner("An error occurred while saving hospital data.", true);
        }
    };

    window.HospFacilityStartEdit = function (id) {
        const editId         = document.getElementById("hosp_fac_editId");
        const specialization = document.getElementById("hosp_fac_specialization");
        const name           = document.getElementById("hosp_fac_name");
        const beds           = document.getElementById("hosp_fac_beds");
        const dental         = document.getElementById("hosp_fac_dental");
        const addBtn         = document.getElementById("hosp_fac_addBtn");
        const cancelBtn      = document.getElementById("hosp_fac_cancelBtn");
        const formTitle      = document.getElementById("hosp_fac_formTitle");

        const rowSpec   = document.getElementById("hosp_fac_row_spec_"   + id);
        const rowName   = document.getElementById("hosp_fac_row_name_"   + id);
        const rowBed    = document.getElementById("hosp_fac_row_bed_"    + id);
        const rowDental = document.getElementById("hosp_fac_row_dental_" + id);

        if (editId)                        editId.value         = id;
        if (specialization && rowSpec)     specialization.value = rowSpec.value;
        if (name           && rowName)     name.value           = rowName.value;
        if (beds           && rowBed)      beds.value           = rowBed.value;
        if (dental         && rowDental)   dental.value         = rowDental.value;
        if (addBtn)    addBtn.textContent      = "Update Facility";
        if (cancelBtn) cancelBtn.style.display = "inline-block";
        if (formTitle) formTitle.textContent   = "Update Facility";

        window.HospFacilityToggleCapacity();
        location.hash = "#sec-hosp";
    };

    window.HospFacilityCancelEdit = function () { clearFacilityForm(); };

    window.HospToggleFacilityFiles = function (id) {
        const row = document.getElementById("hosp_files_row_" + id);
        if (!row) return;
        const isHidden = row.style.display === "none" || row.style.display === "";
        row.style.display = isHidden ? "table-row" : "none";
    };

    window.HospFacilityDelete = async function (id) {
        const url = getUrl("data-facility-delete-url");
        if (!url) return;

        try {
            const res  = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id)
            });
            const data = await res.json();
            if (data.success) { await loadPartial(false, "", false, true); location.hash = "#sec-hosp"; }
            else alert(data.message || "Delete failed.");
        } catch {
            alert("An error occurred while deleting facility data.");
        }
    };

    async function uploadHospDocuments(section) {
        const localRecognitionInput = document.getElementById("hosp_docs_local_recognition");
        const accreditationInput = document.getElementById("hosp_docs_accreditation");
        const accreditationTypeInput = document.getElementById("hosp_docs_accreditation_type");
        const hospitalAgreementsInput = document.getElementById("hosp_docs_hospital_agreements");

        const localRecognition = Array.from(localRecognitionInput?.files || []);
        const accreditationDocs = Array.from(accreditationInput?.files || []);
        const accreditationType = (accreditationTypeInput?.value || "Local").trim();
        const hospitalAgreements = Array.from(hospitalAgreementsInput?.files || []);

        if (!localRecognition.length &&
            !accreditationDocs.length &&
            !hospitalAgreements.length) {
            showBanner("Please choose one or more documents to upload.", true);
            return;
        }

        const url = getUrl("data-docs-save-url");
        if (!url) { showBanner("Documents upload URL is missing.", true); return; }

        const formData = new FormData();
        if (!section || section === "recognition") {
            localRecognition.forEach(f => formData.append("LocalRecognitionDocuments", f));
        }
        if (!section || section === "accreditation") {
            const accreditationFieldName = (() => {
                const normalized = accreditationType.toLowerCase();
                if (normalized.includes("local")) return "LocalAccreditationDocuments";
                if (normalized.includes("regional")) return "RegionalAccreditationDocuments";
                if (normalized.includes("international")) return "InternationalAccreditationDocuments";
                return "OtherAccreditationDocuments";
            })();
            accreditationDocs.forEach(f => formData.append(accreditationFieldName, f));
        }
        if (!section || section === "agreement") {
            hospitalAgreements.forEach(f => formData.append("HospitalAgreementDocuments", f));
        }

        try {
            const res  = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) await loadPartial(true, data.message, false, true);
            else showBanner(data.message || "Upload failed.", true);
        } catch {
            showBanner("An error occurred while uploading documents.", true);
        }
    };

    // ── Document upload (all) ───────────────────────────────────────────────
    window.HospSaveDocuments = async function () {
        await uploadHospDocuments("");
    };

    // ── Document upload (single section) ───────────────────────────────────
    window.HospUploadSection = async function (section) {
        const normalized = (section || "").toLowerCase();
        if (normalized === "recognition") {
            const files = Array.from(document.getElementById("hosp_docs_local_recognition")?.files || []);
            if (!files.length) { showBanner("Please choose local recognition files first.", true); return; }
            await uploadHospDocuments("recognition");
            return;
        }
        if (normalized === "accreditation") {
            const files = Array.from(document.getElementById("hosp_docs_accreditation")?.files || []);
            if (!files.length) { showBanner("Please choose accreditation files first.", true); return; }
            await uploadHospDocuments("accreditation");
            return;
        }
        if (normalized === "agreement") {
            const files = Array.from(document.getElementById("hosp_docs_hospital_agreements")?.files || []);
            if (!files.length) { showBanner("Please choose university-hospital agreement files first.", true); return; }
            await uploadHospDocuments("agreement");
            return;
        }
        await uploadHospDocuments("");
    };

    window.HospDeleteDocument = async function (storedFileName) {
        const url = getUrl("data-docs-delete-url");
        if (!url) return;

        try {
            const res  = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storedFileName)
            });
            const data = await res.json();
            if (data.success) { await loadPartial(false, "", false, true); location.hash = "#sec-hosp"; }
            else alert(data.message || "Delete failed.");
        } catch {
            alert("An error occurred while deleting the document.");
        }
    };

    window.LoadHospitalsSection = async function () {
        await loadPartial(false, "", false, true);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;
        bindAllPendingFiles();
        setTimeout(async () => {
            await loadPartial(false, "", false, false);
            if (window.location.hash === "#sec-hosp") {
                const sec = document.getElementById("sec-hosp");
                if (sec) setTimeout(() => sec.scrollIntoView({ behavior: "auto", block: "start" }), 50);
            }
        }, 150);
    });
})();
