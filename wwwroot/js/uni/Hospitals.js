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

    async function loadPartial(showMessage, message, isError, keepScroll = true) {
        const c = getContainer();
        if (!c) return;

        const url = getUrl("data-load-url");
        if (!url) return;

        const y = window.scrollY || 0;
        const unlock = lockHeight(c);

        try {
            const res = await fetch(url, { cache: "no-store" });
            const html = await res.text();
            render(html);

            if (showMessage && message) {
                showBanner(message, isError);
            }

            if (window.HospCapacityToggleLabel) window.HospCapacityToggleLabel();
            if (keepScroll) window.scrollTo(0, y);
        } finally {
            unlock();
        }
    }

    function clearFacilityForm() {
        const editId = document.getElementById("hosp_fac_editId");
        const specialization = document.getElementById("hosp_fac_specialization");
        const name = document.getElementById("hosp_fac_name");
        const major = document.getElementById("hosp_fac_major");
        const addBtn = document.getElementById("hosp_fac_addBtn");
        const cancelBtn = document.getElementById("hosp_fac_cancelBtn");
        const formTitle = document.getElementById("hosp_fac_formTitle");

        if (editId) editId.value = "";
        if (specialization) specialization.value = "";
        if (name) name.value = "";
        if (major) major.value = "";

        if (addBtn) addBtn.textContent = "Add Facility";
        if (cancelBtn) cancelBtn.style.display = "none";
        if (formTitle) formTitle.textContent = "Add Facility";
    }

    window.HospCapacityToggleLabel = function () {
        const specializationEl = document.getElementById("hosp_cap_specialization");
        const label = document.getElementById("hosp_cap_label");
        const hint = document.getElementById("hosp_cap_hint");
        const input = document.getElementById("hosp_cap_value");
        const medSaved = document.getElementById("hosp_saved_med_capacity")?.value || "";
        const dentSaved = document.getElementById("hosp_saved_dent_capacity")?.value || "";

        const specialization = (specializationEl?.value || "").trim();
        const isMed = /medicine/i.test(specialization);
        const isDent = /dent/i.test(specialization);

        if (label) {
            if (isMed) label.innerHTML = 'Total Bed Capacity <span class="req">*</span>';
            else if (isDent) label.innerHTML = 'Total Dental Chair Capacity <span class="req">*</span>';
            else label.innerHTML = 'Capacity <span class="req">*</span>';
        }

        if (hint) {
            hint.textContent = isMed
                ? "One value for all Medicine rows."
                : isDent
                    ? "One value for all Dentistry rows."
                    : "Select specialization first.";
        }

        if (input) {
            input.placeholder = isMed ? "e.g. 250" : isDent ? "e.g. 40" : "Enter capacity";
            input.value = isMed ? medSaved : isDent ? dentSaved : "";
        }
    };

    window.HospSaveCapacity = async function () {
        const specialization = (document.getElementById("hosp_cap_specialization")?.value || "").trim();
        const capacity = (document.getElementById("hosp_cap_value")?.value || "").trim();

        if (!specialization) {
            showBanner("Please select specialization.", true);
            return;
        }
        if (!isNonNegativeInteger(capacity)) {
            showBanner("Please enter a valid capacity.", true);
            return;
        }

        const url = getUrl("data-capacity-save-url");
        if (!url) {
            showBanner("Capacity save URL is missing.", true);
            return;
        }

        const formData = new FormData();
        formData.append("Specialization", specialization);
        formData.append("Capacity", capacity);

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                await loadPartial(true, data.message, false, true);
                location.hash = "#sec-hosp";
            } else {
                showBanner(data.message || "Could not save capacity.", true);
            }
        } catch {
            showBanner("An error occurred while saving capacity.", true);
        }
    };

    window.HospFacilityAdd = async function () {
        const editId = (document.getElementById("hosp_fac_editId")?.value || "").trim();
        const specialization = (document.getElementById("hosp_fac_specialization")?.value || "").trim();
        const name = (document.getElementById("hosp_fac_name")?.value || "").trim();
        const major = (document.getElementById("hosp_fac_major")?.value || "").trim();

        if (!specialization || !name) {
            showBanner("Please fill all required fields.", true);
            return;
        }

        const url = editId ? getUrl("data-facility-update-url") : getUrl("data-facility-add-url");
        if (!url) {
            showBanner("Request URL is missing.", true);
            return;
        }

        const formData = new FormData();
        formData.append("Id", editId);
        formData.append("Specialization", specialization);
        formData.append("Name", name);
        formData.append("Major", major);

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                await loadPartial(true, data.message, false, true);
                location.hash = "#sec-hosp";
            } else {
                showBanner(data.message || "Something went wrong.", true);
            }
        } catch {
            showBanner("An error occurred while saving hospital data.", true);
        }
    };

    window.HospFacilityStartEdit = function (id) {
        const editId = document.getElementById("hosp_fac_editId");
        const specialization = document.getElementById("hosp_fac_specialization");
        const name = document.getElementById("hosp_fac_name");
        const major = document.getElementById("hosp_fac_major");
        const addBtn = document.getElementById("hosp_fac_addBtn");
        const cancelBtn = document.getElementById("hosp_fac_cancelBtn");
        const formTitle = document.getElementById("hosp_fac_formTitle");

        const rowSpec = document.getElementById("hosp_fac_row_spec_" + id);
        const rowName = document.getElementById("hosp_fac_row_name_" + id);
        const rowMajor = document.getElementById("hosp_fac_row_major_" + id);

        if (editId) editId.value = id;
        if (specialization && rowSpec) specialization.value = rowSpec.value;
        if (name && rowName) name.value = rowName.value;
        if (major && rowMajor) major.value = rowMajor.value;

        if (addBtn) addBtn.textContent = "Update Facility";
        if (cancelBtn) cancelBtn.style.display = "inline-block";
        if (formTitle) formTitle.textContent = "Update Facility";
        location.hash = "#sec-hosp";
    };

    window.HospFacilityCancelEdit = function () {
        clearFacilityForm();
    };

    window.HospFacilityDelete = async function (id) {
        if (!confirm("Are you sure you want to delete this facility?")) return;

        const url = getUrl("data-facility-delete-url");
        if (!url) return;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id)
            });
            const data = await res.json();
            if (data.success) {
                await loadPartial(true, data.message, false, true);
                location.hash = "#sec-hosp";
            } else {
                showBanner(data.message || "Delete failed.", true);
            }
        } catch {
            showBanner("An error occurred while deleting facility data.", true);
        }
    };

    window.HospSaveDocuments = async function () {
        const agreementsInput = document.getElementById("hosp_docs_agreements");
        const accreditationInput = document.getElementById("hosp_docs_accreditation");
        const hasAgreementEl = document.getElementById("hosp_docs_hasAgreement");

        const agreements = Array.from(agreementsInput?.files || []);
        const accreditations = Array.from(accreditationInput?.files || []);
        const hasAgreement = hasAgreementEl ? hasAgreementEl.value === "1" : false;

        if (!agreements.length && !hasAgreement) {
            showBanner("Please upload at least one agreement document.", true);
            return;
        }

        if (!agreements.length && !accreditations.length) {
            showBanner("Please choose one or more documents to upload.", true);
            return;
        }

        const url = getUrl("data-docs-save-url");
        if (!url) {
            showBanner("Documents upload URL is missing.", true);
            return;
        }

        const formData = new FormData();
        agreements.forEach(f => formData.append("AgreementDocuments", f));
        accreditations.forEach(f => formData.append("AccreditationDocuments", f));

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                await loadPartial(true, data.message, false, true);
                location.hash = "#sec-hosp";
            } else {
                showBanner(data.message || "Upload failed.", true);
            }
        } catch {
            showBanner("An error occurred while uploading documents.", true);
        }
    };

    window.HospDeleteDocument = async function (storedFileName) {
        const url = getUrl("data-docs-delete-url");
        if (!url) {
            showBanner("Documents delete URL is missing.", true);
            return;
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storedFileName)
            });
            const data = await res.json();
            if (data.success) {
                await loadPartial(true, data.message, false, true);
                location.hash = "#sec-hosp";
            } else {
                showBanner(data.message || "Delete failed.", true);
            }
        } catch {
            showBanner("An error occurred while deleting the document.", true);
        }
    };

    window.LoadHospitalsSection = async function () {
        await loadPartial(false, "", false, true);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;
        setTimeout(async () => {
            await loadPartial(false, "", false, false);
            if (window.location.hash === "#sec-hosp") {
                const sec = document.getElementById("sec-hosp");
                if (sec) setTimeout(() => sec.scrollIntoView({ behavior: "auto", block: "start" }), 50);
            }
        }, 150);
    });
})();
