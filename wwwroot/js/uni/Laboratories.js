(function () {
    const containerId = "laboratoriesContainer";

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
        const banner = document.getElementById("labBanner");
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
        const editId = document.getElementById("lab_editId");
        const facultyId = document.getElementById("lab_facultyId");
        const computers = document.getElementById("lab_computers");
        const workshops = document.getElementById("lab_workshops");
        const laboratories = document.getElementById("lab_laboratories");
        const personalComputers = document.getElementById("lab_personalComputers");
        const addBtn = document.getElementById("lab_addBtn");
        const cancelBtn = document.getElementById("lab_cancelBtn");

        if (editId) editId.value = "";
        if (facultyId) facultyId.value = "";
        if (computers) computers.value = "";
        if (workshops) workshops.value = "";
        if (laboratories) laboratories.value = "";
        if (personalComputers) personalComputers.value = "";

        if (addBtn) addBtn.textContent = "Add";
        if (cancelBtn) cancelBtn.style.display = "none";
    }

    function collectData() {
        return {
            Id: document.getElementById("lab_editId")?.value || "",
            FacultyId: document.getElementById("lab_facultyId")?.value || "",
            Computers: document.getElementById("lab_computers")?.value || "",
            Workshops: document.getElementById("lab_workshops")?.value || "",
            Laboratories: document.getElementById("lab_laboratories")?.value || "",
            PersonalComputers: document.getElementById("lab_personalComputers")?.value || ""
        };
    }

    function validate(data) {
        return data.FacultyId.trim() !== "" &&
            data.Computers !== "" &&
            data.Workshops !== "" &&
            data.Laboratories !== "" &&
            data.PersonalComputers !== "";
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
        } catch (err) {
            showBanner("Failed to load laboratories section.", true);
            console.error(err);
        } finally {
            unlock();
        }
    }

    window.LabAdd = async function () {
        const data = collectData();

        if (!validate(data)) {
            showBanner("Please fill all required fields.", true);
            return;
        }

        const url = getUrl("data-add-url");
        if (!url) {
            showBanner("Save URL is missing.", true);
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
                body: new URLSearchParams(data).toString()
            });

            const html = await res.text();

            if (res.ok) {
                render(html);
                showBanner(
                    data.Id ? "Laboratory row updated successfully." : "Laboratory row added successfully.",
                    false
                );
                location.hash = "#sec-labs";
                window.scrollTo(0, y);
            } else {
                render(html);
                showBanner(html || "Save failed.", true);
            }
        } catch (err) {
            showBanner("An unexpected error happened while saving.", true);
            console.error(err);
        } finally {
            unlock();
        }
    };

    window.LabStartEdit = function (id) {
        const editId = document.getElementById("lab_editId");
        const facultyId = document.getElementById(`lab_row_facultyId_${id}`);
        const computers = document.getElementById(`lab_row_computers_${id}`);
        const workshops = document.getElementById(`lab_row_workshops_${id}`);
        const laboratories = document.getElementById(`lab_row_laboratories_${id}`);
        const personalComputers = document.getElementById(`lab_row_personalComputers_${id}`);

        const facultySelect = document.getElementById("lab_facultyId");
        const computersInput = document.getElementById("lab_computers");
        const workshopsInput = document.getElementById("lab_workshops");
        const laboratoriesInput = document.getElementById("lab_laboratories");
        const personalComputersInput = document.getElementById("lab_personalComputers");
        const addBtn = document.getElementById("lab_addBtn");
        const cancelBtn = document.getElementById("lab_cancelBtn");

        if (editId) editId.value = id;
        if (facultySelect && facultyId) facultySelect.value = facultyId.value;
        if (computersInput && computers) computersInput.value = computers.value;
        if (workshopsInput && workshops) workshopsInput.value = workshops.value;
        if (laboratoriesInput && laboratories) laboratoriesInput.value = laboratories.value;
        if (personalComputersInput && personalComputers) personalComputersInput.value = personalComputers.value;

        if (addBtn) addBtn.textContent = "Update";
        if (cancelBtn) cancelBtn.style.display = "inline-flex";

        location.hash = "#sec-labs";
    };

    window.LabCancelEdit = function () {
        clearForm();
    };

    window.LabDelete = async function (id) {
        const url = getUrl("data-delete-url");
        if (!url) {
            showBanner("Delete URL is missing.", true);
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
    };

    window.LoadLaboratoriesSection = async function () {
        await loadPartial(false, "", false, true);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;

        setTimeout(async () => {
            await loadPartial(false, "", false, false);

            if (window.location.hash === "#sec-labs") {
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