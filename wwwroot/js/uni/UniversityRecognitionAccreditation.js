(function () {
    const containerId = "uniRecAccContainer";

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
        const banner = document.getElementById("uniRecAccBanner");
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

    function bindFileHints() {
        function wire(inputId, hintId) {
            const input = document.getElementById(inputId);
            const hint  = document.getElementById(hintId);
            if (!input || !hint) return;
            input.addEventListener("change", () => {
                const files = input.files;
                if (!files || files.length === 0) hint.textContent = "";
                else if (files.length === 1)      hint.textContent = files[0].name;
                else                              hint.textContent = files.length + " files selected";
            });
        }
        wire("ura_docs_local_recognition", "ura_recog_hint");
        wire("ura_docs_accreditation",     "ura_accred_hint");
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
            bindFileHints();
            if (showMessage && message) showBanner(message, isError);
            if (keepScroll) window.scrollTo(0, y);
        } finally {
            unlock();
        }
    }

    async function uploadSection(section) {
        const recognitionInput = document.getElementById("ura_docs_local_recognition");
        const accreditationInput = document.getElementById("ura_docs_accreditation");
        const accreditationTypeInput = document.getElementById("ura_docs_accreditation_type");

        const recognitionFiles = Array.from(recognitionInput?.files || []);
        const accreditationFiles = Array.from(accreditationInput?.files || []);
        const accreditationType = (accreditationTypeInput?.value || "Local").trim();

        const url = getUrl("data-docs-save-url");
        if (!url) { showBanner("Documents upload URL is missing.", true); return; }

        const formData = new FormData();
        if (section === "recognition") {
            if (!recognitionFiles.length) { showBanner("Please choose local recognition files first.", true); return; }
            recognitionFiles.forEach(f => formData.append("LocalRecognitionDocuments", f));
        }
        if (section === "accreditation") {
            if (!accreditationFiles.length) { showBanner("Please choose accreditation files first.", true); return; }
            const fieldName = (() => {
                const normalized = accreditationType.toLowerCase();
                if (normalized.includes("local")) return "LocalAccreditationDocuments";
                if (normalized.includes("regional")) return "RegionalAccreditationDocuments";
                if (normalized.includes("international")) return "InternationalAccreditationDocuments";
                return "OtherAccreditationDocuments";
            })();
            accreditationFiles.forEach(f => formData.append(fieldName, f));
        }

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) await loadPartial(true, data.message, false, true);
            else showBanner(data.message || "Upload failed.", true);
        } catch {
            showBanner("An error occurred while uploading documents.", true);
        }
    }

    window.URAUploadSection = async function (section) {
        await uploadSection((section || "").toLowerCase());
    };

    window.URADeleteDocument = async function (storedFileName) {
        const url = getUrl("data-docs-delete-url");
        if (!url) { showBanner("Documents delete URL is missing.", true); return; }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storedFileName)
            });
            const data = await res.json();
            if (data.success) await loadPartial(true, data.message, false, true);
            else showBanner(data.message || "Delete failed.", true);
        } catch {
            showBanner("An error occurred while deleting the document.", true);
        }
    };

    window.LoadUniversityRecognitionAccreditationSection = async function () {
        await loadPartial(false, "", false, true);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;
        setTimeout(async () => {
            await loadPartial(false, "", false, false);
        }, 150);
    });
})();
