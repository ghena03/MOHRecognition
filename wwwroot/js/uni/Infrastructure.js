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
        const banner = document.getElementById("infraBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function splitExisting(text) {
        if (!text) return [];
        return text
            .split(/\r?\n/)
            .map(x => x.trim())
            .filter(x => x)
            .map(x => x.replace(/^\d+\)\s*/, ""));
    }

    function buildListRow(value, index, type) {
        return `
            <div class="infra-list-row">
                <div class="infra-list-number">${index})</div>
                <input type="text" class="infra-list-input" data-type="${type}" value="${escapeHtml(value)}" />
                <button type="button" class="infra-remove-btn" data-type="${type}">×</button>
            </div>
        `;
    }

    function escapeHtml(str) {
        return (str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function renderDynamicList(listId, existingText, type) {
        const container = document.getElementById(listId);
        if (!container) return;

        const items = splitExisting(existingText);
        const safeItems = items.length ? items : [""];

        container.innerHTML = safeItems
            .map((item, i) => buildListRow(item, i + 1, type))
            .join("");
    }

    function renumberList(listId) {
        const container = document.getElementById(listId);
        if (!container) return;

        const rows = container.querySelectorAll(".infra-list-row");
        rows.forEach((row, i) => {
            const num = row.querySelector(".infra-list-number");
            if (num) num.textContent = `${i + 1})`;
        });
    }

    function addRow(listId, type, value = "") {
        const container = document.getElementById(listId);
        if (!container) return;

        const index = container.querySelectorAll(".infra-list-row").length + 1;
        container.insertAdjacentHTML("beforeend", buildListRow(value, index, type));
    }

    function getListValues(listId) {
        const container = document.getElementById(listId);
        if (!container) return "";

        const inputs = [...container.querySelectorAll(".infra-list-input")];
        const values = inputs
            .map((input, i) => input.value.trim() ? `${i + 1}) ${input.value.trim()}` : "")
            .filter(x => x);

        return values.join("\n");
    }

    function collectData() {
        return {
            AreaKm2: document.getElementById("infra_areaKm2")?.value?.trim() || "",
            CampusesCount: document.getElementById("infra_campusesCount")?.value?.trim() || "",
            StadiumsCount: document.getElementById("infra_stadiumsCount")?.value?.trim() || "",
            ClassroomsAndLectureHallsCount: document.getElementById("infra_classroomsCount")?.value?.trim() || "",
            LibrariesCount: document.getElementById("infra_librariesCount")?.value?.trim() || "",
            LaboratoriesDetails: getListValues("infra_laboratoriesList"),
            StudentServicingBuildingsDetails: getListValues("infra_studentBuildingsList")
        };
    }

    function validate(data) {
        return data.AreaKm2 &&
            data.CampusesCount &&
            data.StadiumsCount &&
            data.ClassroomsAndLectureHallsCount &&
            data.LibrariesCount &&
            data.LaboratoriesDetails &&
            data.StudentServicingBuildingsDetails;
    }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    function bindDynamicLists() {
        const labList = document.getElementById("infra_laboratoriesList");
        const studentList = document.getElementById("infra_studentBuildingsList");

        if (labList) {
            renderDynamicList("infra_laboratoriesList", labList.dataset.existing || "", "lab");
        }

        if (studentList) {
            renderDynamicList("infra_studentBuildingsList", studentList.dataset.existing || "", "building");
        }

        const btnLab = document.getElementById("btnAddLaboratory");
        if (btnLab) {
            btnLab.onclick = function () {
                addRow("infra_laboratoriesList", "lab", "");
            };
        }

        const btnBuilding = document.getElementById("btnAddStudentBuilding");
        if (btnBuilding) {
            btnBuilding.onclick = function () {
                addRow("infra_studentBuildingsList", "building", "");
            };
        }

        document.addEventListener("click", function (e) {
            const btn = e.target.closest(".infra-remove-btn");
            if (!btn) return;

            const row = btn.closest(".infra-list-row");
            const list = row?.parentElement;
            if (!row || !list) return;

            if (list.querySelectorAll(".infra-list-row").length === 1) {
                const input = row.querySelector(".infra-list-input");
                if (input) input.value = "";
                return;
            }

            row.remove();

            if (list.id === "infra_laboratoriesList") {
                renumberList("infra_laboratoriesList");
            } else if (list.id === "infra_studentBuildingsList") {
                renumberList("infra_studentBuildingsList");
            }
        });
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

            bindDynamicLists();
            bindSave();

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

    async function saveInfrastructure() {
        const data = collectData();

        if (!validate(data)) {
            showBanner("Please fill all required fields.", true);
            return;
        }

        const url = getUrl("data-save-url");
        if (!url) return;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams(data).toString()
        });

        if (res.ok) {
            await loadPartial(true, "Infrastructure saved successfully.", false, true);
            location.hash = "#sec-infra";
        } else {
            const msg = await res.text();
            showBanner(msg || "Save failed.", true);
        }
    }

    function bindSave() {
        const btn = document.getElementById("btnSaveInfrastructure");
        if (!btn) return;

        btn.onclick = async function () {
            await saveInfrastructure();
        };
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