(function () {
    const containerId = "attachmentsContainer";

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
        const banner = document.getElementById("attBanner");
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
            showBanner("Failed to load attachments section.", true);
        }
    }

    window.AttachmentUploadCategory = async function (subject, fileInputId) {
        const fileInput = getFileInputById(fileInputId);
        const files = Array.from(fileInput?.files || []);

        if (!subject) {
            showBanner("Attachment category is missing.", true);
            return;
        }

        if (!files.length) {
            showBanner("Please choose one or more PDF files.", true);
            return;
        }

        const nonPdf = files.find(f => !(f.name || "").toLowerCase().endsWith(".pdf"));
        if (nonPdf) {
            showBanner("Only PDF files are allowed in Attachments section.", true);
            return;
        }

        const url = getUrl("data-upload-url");
        if (!url) {
            showBanner("Upload URL is missing.", true);
            return;
        }

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("subject", subject);

                const res = await fetch(url, {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) {
                    const errText = await res.text();
                    showBanner(errText || "Upload failed.", true);
                    return;
                }
            }

            await loadPartial(true, "Files uploaded successfully.", false);
        } catch (err) {
            console.error(err);
            showBanner("An unexpected error happened while uploading.", true);
        }
    };

    window.AttachmentDelete = async function (id) {
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

            if (res.ok) {
                showBanner("Attachment deleted successfully.", false);
            } else {
                showBanner(html || "Delete failed.", true);
            }
        } catch (err) {
            console.error(err);
            showBanner("An unexpected error happened while deleting.", true);
        }
    };

    window.LoadAttachmentsSection = async function () {
        await loadPartial(false, "", false);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;

        setTimeout(async () => {
            await loadPartial(false, "", false);

            if (window.location.hash === "#sec-attachments") {
                const sec = document.getElementById("sec-attachments");
                if (sec) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: "auto", block: "start" });
                    }, 50);
                }
            }
        }, 150);
    });
})();