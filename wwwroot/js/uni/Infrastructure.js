(function () {
    const containerId = "infrastructureContainer";

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
        const banner = document.getElementById("infraBanner");
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

    function collectData() {
        return {
            AreaKm2: document.getElementById("infra_areaKm2")?.value?.trim() || "",
            CampusesCount: document.getElementById("infra_campusesCount")?.value?.trim() || "",
            StadiumsCount: document.getElementById("infra_stadiumsCount")?.value?.trim() || "",
            ClassroomsAndLectureHallsCount: document.getElementById("infra_classroomsCount")?.value?.trim() || "",
            LibrariesCount: document.getElementById("infra_librariesCount")?.value?.trim() || "",
            StudentServicingBuildingsDetails: ""
        };
    }

    function clearInvalidState() {
        const c = getContainer();
        if (!c) return;
        c.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
    }

    function markInvalid(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add("is-invalid");
    }

    function isNonNegativeInteger(v) {
        return /^\d+$/.test(v);
    }

    function isPositiveNumber(v) {
        return /^\d+(\.\d+)?$/.test(v) && Number(v) > 0;
    }

    function removeLegacyStudentBuildingsUI() {
        const legacyList = document.getElementById("infra_studentBuildingsList");
        if (!legacyList) return;

        const legacyField = legacyList.closest(".field");
        if (legacyField) {
            legacyField.remove();
            return;
        }

        legacyList.remove();
        const legacyAddBtn = document.getElementById("btnAddStudentBuilding");
        if (legacyAddBtn) legacyAddBtn.remove();
    }

    function validate(data) {
        clearInvalidState();

        if (!data.AreaKm2 || !isPositiveNumber(data.AreaKm2)) {
            markInvalid("infra_areaKm2");
            return "Area (Km²) must be a valid positive number.";
        }

        const countRules = [
            ["infra_campusesCount", data.CampusesCount, "Number of Colleges"],
            ["infra_stadiumsCount", data.StadiumsCount, "Number of Stadiums"],
            ["infra_classroomsCount", data.ClassroomsAndLectureHallsCount, "Classrooms and Lecture Halls"],
            ["infra_librariesCount", data.LibrariesCount, "Number of Laboratories"]
        ];

        for (const [id, value, label] of countRules) {
            if (!value || !isNonNegativeInteger(value)) {
                markInvalid(id);
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
            removeLegacyStudentBuildingsUI();
            bindSectionEvents();

            if (showMessage && message) {
                showBanner(message, isError);
            }

            if (keepScroll) {
                window.scrollTo(0, y);
            }
        } catch (err) {
            showBanner("Failed to load infrastructure section.", true);
            console.error(err);
        } finally {
            unlock();
        }
    }

    async function saveInfrastructure() {
        const data = collectData();
        const validationMessage = validate(data);

        if (validationMessage) {
            showBanner(validationMessage, true);
            return;
        }

        const url = getUrl("data-save-url");
        if (!url) return;

        const saveBtn = document.getElementById("btnSaveInfrastructure");
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving...";
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                body: new URLSearchParams(data).toString()
            });

            if (res.ok) {
                await loadPartial(true, "Infrastructure saved successfully.", false, true);
                window.scrollToNextSection("sec-infra");
            } else {
                const msg = await res.text();
                showBanner(msg || "Save failed.", true);
            }
        } catch (err) {
            showBanner("An unexpected error happened while saving.", true);
            console.error(err);
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save";
            }
        }
    }

    function bindSectionEvents() {
        removeLegacyStudentBuildingsUI();

        const saveBtn = document.getElementById("btnSaveInfrastructure");
        if (saveBtn) {
            saveBtn.onclick = async function () {
                await saveInfrastructure();
            };
        }
    }

    window.LoadInfrastructureSection = async function () {
        await loadPartial(false, "", false, true);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;

        setTimeout(async () => {
            await loadPartial(false, "", false, false);

            if (window.location.hash === "#sec-infra") {
                const sec = document.getElementById("sec-infra");
                if (sec) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: "auto", block: "start" });
                    }, 50);
                }
            }
        }, 150);
    });
})();