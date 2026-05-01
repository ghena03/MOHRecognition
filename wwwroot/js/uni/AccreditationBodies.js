(function () {
    const containerId = "accreditationBodiesContainer";

    function getContainer() {
        return document.getElementById(containerId);
    }

    function getUrl(attr) {
        const c = getContainer();
        return c ? c.getAttribute(attr) : null;
    }

    function showBanner(message, isError) {
        if (window.showAppToast) {
            window.showAppToast(message, isError ? "error" : "success");
            return;
        }
        const banner = document.getElementById("accBodiesBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function clearForm() {
        const editId = document.getElementById("accb_editId");
        const bodyName = document.getElementById("accb_bodyName");
        const type = document.getElementById("accb_type");
        const pdf = document.getElementById("accb_pdf");
        const addBtn = document.getElementById("accb_addBtn");
        const cancelBtn = document.getElementById("accb_cancelBtn");
        const note = document.getElementById("accb_pdf_note");

        if (editId) editId.value = "";
        if (bodyName) bodyName.value = "";
        if (type) type.value = "";
        if (pdf) pdf.value = "";
        if (addBtn) addBtn.textContent = "Add";
        if (cancelBtn) cancelBtn.style.display = "none";
        if (note) note.textContent = "One PDF file is required for each accreditation body row.";
    }

    async function refreshPartial(showMessage, message, isError) {
        const container = getContainer();
        if (!container) return;

        const url = getUrl("data-load-url");
        if (!url) return;

        const y = window.scrollY || 0;
        const unlock = lockHeight(container);

        try {
            const res = await fetch(url, { cache: "no-store" });
            const html = await res.text();
            container.innerHTML = html;

            if (showMessage && message) {
                showBanner(message, isError);
            }

            window.scrollTo(0, y);
            location.hash = "#sec-accreditation-bodies";
        } finally {
            unlock();
        }
    }

    async function addOrUpdate() {
        const editId = document.getElementById("accb_editId")?.value?.trim() || "";
        const bodyName = document.getElementById("accb_bodyName")?.value?.trim() || "";
        const type = document.getElementById("accb_type")?.value?.trim() || "";
        const fileInput = document.getElementById("accb_pdf");
        const file = fileInput?.files?.[0] || null;

        if (!bodyName || !type) {
            showBanner("Please fill all required fields.", true);
            return;
        }

        const isEdit = !!editId;
        if (!isEdit && !file) {
            showBanner("Please upload one PDF file for this accreditation body.", true);
            return;
        }

        if (file && !file.name.toLowerCase().endsWith(".pdf")) {
            showBanner("Only PDF files are allowed.", true);
            return;
        }

        const url = isEdit ? getUrl("data-update-url") : getUrl("data-add-url");
        if (!url) {
            showBanner("Request URL is missing.", true);
            return;
        }

        const formData = new FormData();
        formData.append("Id", editId);
        formData.append("AccreditationBodyName", bodyName);
        formData.append("AccreditationType", type);
        if (file) formData.append("PdfFile", file);

        const container = getContainer();
        if (!container) return;

        const y = window.scrollY || 0;
        const unlock = lockHeight(container);

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const text = await res.text();

            if (!res.ok) {
                showBanner(text || "Save failed.", true);
                return;
            }

            container.innerHTML = text;
            showBanner(isEdit ? "Accreditation body updated successfully." : "Accreditation body added successfully.", false);
            window.scrollTo(0, y);
            location.hash = "#sec-accreditation-bodies";
        } catch {
            showBanner("An error occurred while saving accreditation body data.", true);
        } finally {
            unlock();
        }
    }

    async function deleteRow(id) {
        const url = getUrl("data-delete-url");
        if (!url) {
            showBanner("Delete URL is missing.", true);
            return;
        }

        const container = getContainer();
        if (!container) return;

        const y = window.scrollY || 0;
        const unlock = lockHeight(container);

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ id }).toString()
            });

            const text = await res.text();
            if (!res.ok) {
                showBanner(text || "Delete failed.", true);
                return;
            }

            container.innerHTML = text;
            showBanner("Accreditation body deleted successfully.", false);
            window.scrollTo(0, y);
            location.hash = "#sec-accreditation-bodies";
        } catch {
            showBanner("An error occurred while deleting accreditation body data.", true);
        } finally {
            unlock();
        }
    }

    document.addEventListener("click", function (e) {
        const container = getContainer();
        if (!container) return;

        const addBtn = e.target.closest("#accb_addBtn");
        const cancelBtn = e.target.closest("#accb_cancelBtn");
        const editBtn = e.target.closest("[data-accb-edit]");
        const delBtn = e.target.closest("[data-accb-del]");

        if (!addBtn && !cancelBtn && !editBtn && !delBtn) return;

        if (addBtn) {
            addOrUpdate();
            return;
        }

        if (cancelBtn) {
            clearForm();
            return;
        }

        if (editBtn) {
            const id = editBtn.getAttribute("data-id") || "";
            const body = editBtn.getAttribute("data-body") || "";
            const type = editBtn.getAttribute("data-type") || "";

            const editId = document.getElementById("accb_editId");
            const bodyName = document.getElementById("accb_bodyName");
            const typeInput = document.getElementById("accb_type");
            const add = document.getElementById("accb_addBtn");
            const cancel = document.getElementById("accb_cancelBtn");
            const note = document.getElementById("accb_pdf_note");

            if (editId) editId.value = id;
            if (bodyName) bodyName.value = body;
            if (typeInput) typeInput.value = type;
            if (add) add.textContent = "Update";
            if (cancel) cancel.style.display = "inline-block";
            if (note) note.textContent = "Upload a new PDF only if you want to replace the existing file.";

            location.hash = "#sec-accreditation-bodies";
            return;
        }

        if (delBtn) {
            const id = delBtn.getAttribute("data-id") || "";
            if (!id) return;
            deleteRow(id);
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;
        setTimeout(() => refreshPartial(false, "", false), 100);
    });
})();
