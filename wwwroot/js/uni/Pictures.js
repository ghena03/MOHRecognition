(function () {
    const containerId = "picturesContainer";
    let snapshotDebounceTimer = null;
    let lastSavedSnapshotKey = "";

    function getContainer() {
        return document.getElementById(containerId);
    }

    function getNumbersContainer() {
        return document.getElementById("numbersInfoContainer");
    }

    function getUrl(attr) {
        const c = getContainer();
        return c ? c.getAttribute(attr) : null;
    }

    function getSnapshotSaveUrl() {
        const n = getNumbersContainer();
        return (n && n.getAttribute("data-save-labs-summary-url")) || getUrl("data-save-labs-summary-url");
    }

    function render(html) {
        const c = getContainer();
        if (c) c.innerHTML = html;
    }

    function showBanner(message, isError) {
        const banner = document.getElementById("picBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function getFileInputById(inputId) {
        return document.getElementById(inputId);
    }

    function isAllowedFile(fileName) {
        const name = (fileName || "").toLowerCase();
        const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
        return allowed.some(ext => name.endsWith(ext));
    }

    function updateSelectedNames(inputId) {
        const input = getFileInputById(inputId);
        const cardId = inputId.replace("input_", "");
        const selected = document.getElementById(`selected_${cardId}`);
        if (!input || !selected) return;

        const files = Array.from(input.files || []);
        if (!files.length) {
            selected.innerHTML = "";
            return;
        }

        selected.innerHTML = files
            .map(f => `<div class="pic-selected-line">${f.name}</div>`)
            .join("");
    }

    function updateProgressAndSubmitState() {
        const cards = Array.from(document.querySelectorAll(".pic-upload-card[data-has-files]"));
        const ready = cards.filter(c => c.getAttribute("data-has-files") === "1").length;
        const total = cards.length;

        const progress = document.getElementById("picProgressText");
        if (progress) progress.textContent = `Uploaded ${ready} of ${total} files`;
    }

    function collectSnapshotData() {
        return {
            TotalLaboratoriesCount: (document.getElementById("pic_totalLaboratories")?.value || "").trim(),
            TotalFacilitiesCount: (document.getElementById("pic_totalFacilities")?.value || "").trim(),
            TeachingHallsCount: (document.getElementById("pic_teachingHalls")?.value || "").trim(),
            StadiumsCount: (document.getElementById("pic_stadiums")?.value || "").trim()
        };
    }

    function hasCompleteSnapshot(data) {
        return !!data.TotalLaboratoriesCount &&
            !!data.TotalFacilitiesCount &&
            !!data.TeachingHallsCount &&
            !!data.StadiumsCount;
    }

    async function saveSnapshotSilently() {
        const data = collectSnapshotData();

        if (!hasCompleteSnapshot(data)) {
            return;
        }

        const snapshotKey = JSON.stringify(data);
        if (snapshotKey === lastSavedSnapshotKey) {
            return;
        }

        const url = getSnapshotSaveUrl();
        if (!url) {
            showBanner("Snapshot save URL is missing.", true);
            return;
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: new URLSearchParams(data).toString()
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Snapshot save failed.");
            }

            lastSavedSnapshotKey = snapshotKey;
            showBanner("Snapshot saved automatically.", false);
        } catch (err) {
            console.error(err);
            showBanner(err.message || "An unexpected error happened while saving snapshot.", true);
        }
    }

    function wireSnapshotAutoSave() {
        const ids = ["pic_totalLaboratories", "pic_totalFacilities", "pic_teachingHalls", "pic_stadiums"];
        const inputs = ids
            .map(id => document.getElementById(id))
            .filter(Boolean);

        if (!inputs.length) return;

        const queueSave = () => {
            if (snapshotDebounceTimer) {
                clearTimeout(snapshotDebounceTimer);
            }

            snapshotDebounceTimer = setTimeout(() => {
                saveSnapshotSilently();
            }, 650);
        };

        inputs.forEach(input => {
            if (input.dataset.snapshotWired === "1") {
                return;
            }
            input.dataset.snapshotWired = "1";
            input.addEventListener("input", queueSave);
            input.addEventListener("change", queueSave);
            input.addEventListener("blur", queueSave);
        });
    }

    window.PictureSaveLabSnapshot = async function () {
        await saveSnapshotSilently();
    };

    window.PictureUploadCategory = async function (subject, inputId) {
        const input = getFileInputById(inputId);
        const files = Array.from(input?.files || []);

        if (!subject) {
            showBanner("Category is missing.", true);
            return;
        }

        if (!files.length) {
            showBanner("Please choose one or more files.", true);
            return;
        }

        const invalidFile = files.find(f => !isAllowedFile(f.name));
        if (invalidFile) {
            showBanner("Only PDF or image files are allowed.", true);
            return;
        }

        const url = getUrl("data-upload-url");
        if (!url) {
            showBanner("Upload URL is missing.", true);
            return;
        }

        try {
            await uploadFilesForSubject(url, subject, files);
            await loadPartial(true, "Files uploaded successfully.", false);
        } catch (err) {
            console.error(err);
            showBanner(err.message || "An unexpected error happened while uploading.", true);
        }
    };

    function wireDropZones() {
        document.querySelectorAll(".pic-drop-zone").forEach(zone => {
            const cardId = zone.id.replace("drop_", "");
            const input = document.getElementById(`input_${cardId}`);
            if (!input) return;

            ["dragenter", "dragover"].forEach(evt => {
                zone.addEventListener(evt, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.add("drag-over");
                });
            });

            ["dragleave", "drop"].forEach(evt => {
                zone.addEventListener(evt, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.remove("drag-over");
                });
            });

            zone.addEventListener("drop", e => {
                const files = Array.from(e.dataTransfer?.files || []);
                if (!files.length) return;

                const invalidFile = files.find(f => !isAllowedFile(f.name));
                if (invalidFile) {
                    showBanner("Only PDF or image files are allowed.", true);
                    return;
                }

                const dt = new DataTransfer();
                files.forEach(f => dt.items.add(f));
                input.files = dt.files;
                updateSelectedNames(input.id);
            });

            input.addEventListener("change", () => {
                updateSelectedNames(input.id);
                updateProgressAndSubmitState();
            });
        });
    }

    async function loadPartial(showMessage = false, message = "", isError = false) {
        const url = getUrl("data-load-url");
        if (!url) return;

        try {
            const res = await fetch(url, { cache: "no-store" });
            const html = await res.text();
            render(html);
            wireDropZones();
            wireSnapshotAutoSave();
            updateProgressAndSubmitState();

            if (showMessage && message) {
                showBanner(message, isError);
            }
        } catch (err) {
            console.error(err);
            showBanner("Failed to load pictures section.", true);
        }
    }

    window.PictureChooseFiles = function (inputId) {
        const input = getFileInputById(inputId);
        if (input) input.click();
    };

    window.PictureClearSelected = function (inputId) {
        const input = getFileInputById(inputId);
        if (!input) return;
        input.value = "";
        updateSelectedNames(inputId);
        updateProgressAndSubmitState();
    };

    async function uploadFilesForSubject(url, subject, files) {
        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("subject", subject);

            const res = await fetch(url, { method: "POST", body: formData });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Upload failed.");
            }
        }
    }

    window.PictureDelete = async function (id) {
        const url = getUrl("data-delete-url");
        if (!url) {
            showBanner("Delete URL is missing.", true);
            return;
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: new URLSearchParams({ id }).toString()
            });

            const html = await res.text();
            render(html);
            wireDropZones();
            updateProgressAndSubmitState();

            if (res.ok) {
                showBanner("File removed successfully.", false);
            } else {
                showBanner(html || "Delete failed.", true);
            }
        } catch (err) {
            console.error(err);
            showBanner("An unexpected error happened while deleting.", true);
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;

        setTimeout(async () => {
            await loadPartial(false, "", false);

            if (window.location.hash === "#sec-pictures") {
                const sec = document.getElementById("sec-pictures");
                if (sec) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: "auto", block: "start" });
                    }, 50);
                }
            }
        }, 150);
    });
})();