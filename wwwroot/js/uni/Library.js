(function () {
    const containerId = "libraryContainer";

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
        const banner = document.getElementById("libBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function collectData() {
        return {
            Area: document.getElementById("lib_area")?.value || "",
            TotalStudentCapacity: document.getElementById("lib_capacity")?.value || "",
            NumberOfArabicBooks: document.getElementById("lib_arabicBooks")?.value || "",
            NumberOfEnglishBooks: document.getElementById("lib_englishBooks")?.value || "",
            NumberOfPaperJournals: document.getElementById("lib_paperJournals")?.value || "",
            NumberOfElectronicBooks: document.getElementById("lib_electronicBooks")?.value || "",
            NumberOfElectronicJournals: document.getElementById("lib_electronicJournals")?.value || ""
        };
    }

    function validate(data) {
        return data.Area !== "" &&
            data.TotalStudentCapacity !== "" &&
            data.NumberOfArabicBooks !== "" &&
            data.NumberOfEnglishBooks !== "" &&
            data.NumberOfPaperJournals !== "" &&
            data.NumberOfElectronicBooks !== "" &&
            data.NumberOfElectronicJournals !== "";
    }

    async function loadPartial(showMessage = false, message = "", isError = false) {
        const url = getUrl("data-load-url");
        if (!url) return;

        try {
            const res = await fetch(url, { cache: "no-store" });
            const html = await res.text();
            render(html);

            if (showMessage && message) {
                showBanner(message, isError);
            }
        } catch (err) {
            console.error(err);
            showBanner("Failed to load library section.", true);
        }
    }

    window.LibrarySave = async function () {
        const data = collectData();

        if (!validate(data)) {
            showBanner("Please fill all required fields.", true);
            return;
        }

        const url = getUrl("data-save-url");
        if (!url) {
            showBanner("Save URL is missing.", true);
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

            const html = await res.text();

            render(html);

            if (res.ok) {
                showBanner("Library data saved successfully.", false);
            } else {
                showBanner(html || "Save failed.", true);
            }
        } catch (err) {
            console.error(err);
            showBanner("An unexpected error happened while saving.", true);
        }
    };

    window.LoadLibrarySection = async function () {
        await loadPartial(false, "", false);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;

        setTimeout(async () => {
            await loadPartial(false, "", false);

            if (window.location.hash === "#sec-library") {
                const sec = document.getElementById("sec-library");
                if (sec) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: "auto", block: "start" });
                    }, 50);
                }
            }
        }, 150);
    });
})();