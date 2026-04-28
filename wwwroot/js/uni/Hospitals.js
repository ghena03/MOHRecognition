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
        const banner = document.getElementById("hospBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function clearForm() {
        const editId = document.getElementById("hosp_editId");
        const specialization = document.getElementById("hosp_specialization");
        const name = document.getElementById("hosp_name");
        const major = document.getElementById("hosp_major");
        const addBtn = document.getElementById("hosp_addBtn");
        const cancelBtn = document.getElementById("hosp_cancelBtn");

        if (editId) editId.value = "";
        if (specialization) specialization.value = "";
        if (name) name.value = "";
        if (major) major.value = "";

        if (addBtn) addBtn.textContent = "Add";
        if (cancelBtn) cancelBtn.style.display = "none";
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

            if (keepScroll) {
                window.scrollTo(0, y);
            }
        } finally {
            unlock();
        }
    }

    window.HospAdd = async function () {
        const editIdEl = document.getElementById("hosp_editId");
        const specializationEl = document.getElementById("hosp_specialization");
        const nameEl = document.getElementById("hosp_name");
        const majorEl = document.getElementById("hosp_major");

        const editId = editIdEl ? editIdEl.value.trim() : "";
        const specialization = specializationEl ? specializationEl.value.trim() : "";
        const name = nameEl ? nameEl.value.trim() : "";
        const major = majorEl ? majorEl.value.trim() : "";

        if (!specialization || !name) {
            showBanner("Please fill all required fields.", true);
            return;
        }

        const isEdit = !!editId;

        const url = isEdit
            ? getUrl("data-update-url")
            : getUrl("data-add-url");

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
            const res = await fetch(url, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                await loadPartial(true, data.message, false, true);
                location.hash = "#sec-hosp";
            } else {
                showBanner(data.message || "Something went wrong.", true);
            }
        } catch (e) {
            showBanner("An error occurred while saving hospital data.", true);
        }
    };

    window.HospStartEdit = function (id) {
        const editId = document.getElementById("hosp_editId");
        const specialization = document.getElementById("hosp_specialization");
        const name = document.getElementById("hosp_name");
        const major = document.getElementById("hosp_major");
        const addBtn = document.getElementById("hosp_addBtn");
        const cancelBtn = document.getElementById("hosp_cancelBtn");

        const rowSpecialization = document.getElementById("hosp_row_specialization_" + id);
        const rowName = document.getElementById("hosp_row_name_" + id);
        const rowMajor = document.getElementById("hosp_row_major_" + id);

        if (editId) editId.value = id;
        if (specialization && rowSpecialization) specialization.value = rowSpecialization.value;
        if (name && rowName) name.value = rowName.value;
        if (major && rowMajor) major.value = rowMajor.value;

        if (addBtn) addBtn.textContent = "Update";
        if (cancelBtn) cancelBtn.style.display = "inline-block";

        location.hash = "#sec-hosp";
    };

    window.HospSaveContracts = async function () {
        const input = document.getElementById("hosp_contracts_global");
        const files = Array.from(input?.files || []);
        if (!files.length) {
            showBanner("Please choose one or more contracts/supporting files.", true);
            return;
        }

        const url = getUrl("data-save-contracts-url");
        if (!url) {
            showBanner("Contracts upload URL is missing.", true);
            return;
        }

        const formData = new FormData();
        files.forEach(f => formData.append("files", f));

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
            showBanner("An error occurred while uploading contracts.", true);
        }
    };

    window.HospDeleteContract = async function (storedFileName) {
        const url = getUrl("data-delete-contract-url");
        if (!url) {
            showBanner("Contracts delete URL is missing.", true);
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
            showBanner("An error occurred while deleting contract file.", true);
        }
    };

    window.HospCancelEdit = function () {
        clearForm();
    };

    window.HospDelete = async function (id) {
        if (!confirm("Are you sure you want to delete this row?")) return;

        const url = getUrl("data-delete-url");
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
        } catch (e) {
            showBanner("An error occurred while deleting hospital data.", true);
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
                if (sec) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: "auto", block: "start" });
                    }, 50);
                }
            }
        }, 150);
    });
})();