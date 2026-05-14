(function () {
    const containerId = "laboratoriesContainer";
    const defaultAddLabel = "Add";
    const defaultUpdateLabel = "Update";
    let isSaving = false;

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
        const banner = document.getElementById("labBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function hideBanner() {
        const banner = document.getElementById("labBanner");
        if (banner) {
            banner.style.display = "none";
        }
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function getFormElements() {
        return {
            editId: document.getElementById("lab_editId"),
            facultyId: document.getElementById("lab_facultyId"),
            computers: document.getElementById("lab_computers"),
            laboratories: document.getElementById("lab_laboratories"),
            addBtn: document.getElementById("lab_addBtn"),
            cancelBtn: document.getElementById("lab_cancelBtn")
        };
    }

    function clearForm() {
        const {
            editId,
            facultyId,
            computers,
            laboratories,
            addBtn,
            cancelBtn
        } = getFormElements();

        if (editId) editId.value = "";
        if (facultyId) facultyId.value = "";
        if (computers) computers.value = "";
        if (laboratories) laboratories.value = "";

        if (addBtn) {
            addBtn.textContent = defaultAddLabel;
            addBtn.disabled = false;
        }
        if (cancelBtn) cancelBtn.style.display = "none";

        [facultyId, computers, laboratories]
            .filter(Boolean)
            .forEach(el => el.classList.remove("is-invalid"));
    }

    function collectData() {
        return {
            Id: document.getElementById("lab_editId")?.value?.trim() || "",
            FacultyId: document.getElementById("lab_facultyId")?.value?.trim() || "",
            Computers: document.getElementById("lab_computers")?.value?.trim() || "",
            Laboratories: document.getElementById("lab_laboratories")?.value?.trim() || ""
        };
    }

    function isNonNegativeInteger(v) {
        return /^\d+$/.test(v);
    }

    function validate(data) {
        const {
            facultyId,
            computers,
            laboratories
        } = getFormElements();

        [facultyId, computers, laboratories]
            .filter(Boolean)
            .forEach(el => el.classList.remove("is-invalid"));

        if (!data.FacultyId) {
            if (facultyId) facultyId.classList.add("is-invalid");
            return "Please select a college.";
        }

        const numericFields = [
            ["Computers", data.Computers, computers],
            ["Laboratories", data.Laboratories, laboratories]
        ];

        for (const [label, value, element] of numericFields) {
            if (!isNonNegativeInteger(value)) {
                if (element) element.classList.add("is-invalid");
                return `${label} must be a whole number (0 or more).`;
            }
        }

        return "";
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
            bindSectionEvents();

            if (showMessage && message) {
                showBanner(message, isError);
            }

            if (keepScroll) {
                window.scrollTo(0, y);
            }
        } catch (err) {
            showBanner("Failed to load laboratories section.", true);
            console.error(err);
        } finally {
            unlock();
        }
    }

    async function addOrUpdateLaboratory() {
        if (isSaving) return;

        const data = collectData();
        const validationMessage = validate(data);

        if (validationMessage) {
            showBanner(validationMessage, true);
            return;
        }

        const addBtn = document.getElementById("lab_addBtn");
        const cancelBtn = document.getElementById("lab_cancelBtn");
        const isEditing = !!data.Id;

        const url = getUrl("data-add-url");
        if (!url) {
            showBanner("Save URL is missing.", true);
            return;
        }

        isSaving = true;
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = isEditing ? "Updating..." : "Adding...";
        }
        if (cancelBtn) cancelBtn.disabled = true;

        const c = getContainer();
        const unlock = c ? lockHeight(c) : () => { };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: new URLSearchParams(data).toString()
            });

            const html = await res.text();

            if (res.ok) {
                render(html);
                bindSectionEvents();
                showBanner(
                    data.Id ? "Laboratory row updated successfully." : "Laboratory row added successfully.",
                    false
                );
            } else {
                showBanner(html || "Save failed.", true);
            }
        } catch (err) {
            showBanner("An unexpected error happened while saving.", true);
            console.error(err);
        } finally {
            isSaving = false;
            unlock();

            const refreshedAddBtn = document.getElementById("lab_addBtn");
            const refreshedCancelBtn = document.getElementById("lab_cancelBtn");
            if (refreshedAddBtn) {
                refreshedAddBtn.disabled = false;
                refreshedAddBtn.textContent = isEditing ? defaultUpdateLabel : defaultAddLabel;
            }
            if (refreshedCancelBtn) refreshedCancelBtn.disabled = false;
        }
    }

    function startEditFromButton(btn) {
        const {
            editId,
            facultyId,
            computers,
            laboratories,
            addBtn,
            cancelBtn
        } = getFormElements();

        if (editId) editId.value = btn.dataset.id || "";
        if (facultyId) facultyId.value = btn.dataset.facultyId || "";
        if (computers) computers.value = btn.dataset.computers || "";
        if (laboratories) laboratories.value = btn.dataset.laboratories || "";

        if (addBtn) addBtn.textContent = defaultUpdateLabel;
        if (cancelBtn) cancelBtn.style.display = "inline-flex";

        location.hash = "#sec-labs";
    }

    function cancelEdit() {
        hideBanner();
        clearForm();
    }

    async function deleteLaboratory(id) {
        const url = getUrl("data-delete-url");
        if (!url) {
            showBanner("Delete URL is missing.", true);
            return;
        }

        if (!id) {
            showBanner("Invalid row id.", true);
            return;
        }

        if (!window.confirm("Delete this row?")) {
            return;
        }

        const c = getContainer();
        const y = window.scrollY || 0;
        const unlock = c ? lockHeight(c) : () => { };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: new URLSearchParams({ id }).toString()
            });

            const html = await res.text();

            if (res.ok) {
                render(html);
                bindSectionEvents();
                showBanner("Laboratory row deleted successfully.", false);
                location.hash = "#sec-labs";
                window.scrollTo(0, y);
            } else {
                showBanner(html || "Delete failed.", true);
            }
        } catch (err) {
            showBanner("An unexpected error happened while deleting.", true);
            console.error(err);
        } finally {
            unlock();
        }
    }

    function bindSectionEvents() {
        const c = getContainer();
        if (!c || c.dataset.labsEventsBound === "1") return;

        c.dataset.labsEventsBound = "1";

        c.addEventListener("click", async function (e) {
            const addBtn = e.target.closest("#lab_addBtn");
            if (addBtn) {
                e.preventDefault();
                await addOrUpdateLaboratory();
                return;
            }

            const cancelBtn = e.target.closest("#lab_cancelBtn");
            if (cancelBtn) {
                e.preventDefault();
                cancelEdit();
                return;
            }

            const actionBtn = e.target.closest("[data-lab-action]");
            if (!actionBtn) return;

            const action = actionBtn.dataset.labAction;

            if (action === "edit") {
                startEditFromButton(actionBtn);
            } else if (action === "delete") {
                await deleteLaboratory(actionBtn.dataset.id || "");
            }
        });

        c.addEventListener("keydown", async function (e) {
            if (e.key !== "Enter") return;
            if (e.target && e.target.tagName === "SELECT") return;
            if (e.target && e.target.closest("#lab_addBtn, #lab_cancelBtn")) return;
            e.preventDefault();
            await addOrUpdateLaboratory();
        });
    }

    window.LabAdd = async function () {
        await addOrUpdateLaboratory();
    };

    window.LabStartEdit = function (id) {
        const btn = document.querySelector(`[data-lab-action="edit"][data-id="${CSS.escape(id)}"]`);
        if (btn) startEditFromButton(btn);
    };

    window.LabCancelEdit = function () {
        cancelEdit();
    };

    window.LabDelete = async function (id) {
        await deleteLaboratory(id);
    };

    window.LoadLaboratoriesSection = async function () {
        await loadPartial(false, "", false, true);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;

        setTimeout(async () => {
            await loadPartial(false, "", false, false);

            if (window.location.hash === "#sec-labs" || window.location.hash === "#sec-infra") {
                const sec = document.getElementById("sec-labs");
                if (sec) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: "auto", block: "start" });
                    }, 50);
                }
            }
        }, 150);
    });
})();
