(function () {
    const containerId = "picturesContainer";

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
        const banner = document.getElementById("picBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function getFileInput() {
        return document.getElementById("pic_file");
    }

    function getSubjectInput() {
        return document.getElementById("pic_subject");
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
            showBanner("Failed to load pictures section.", true);
        }
    }

    window.PictureUpload = async function () {
        const fileInput = getFileInput();
        const subjectInput = getSubjectInput();

        const file = fileInput?.files?.[0];
        const subject = subjectInput?.value?.trim() || "";

        if (!file) {
            showBanner("Please choose a picture.", true);
            return;
        }

        if (!subject) {
            showBanner("Please enter the subject.", true);
            return;
        }

        const url = getUrl("data-upload-url");
        if (!url) {
            showBanner("Upload URL is missing.", true);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject", subject);

        try {
            const res = await fetch(url, {
                method: "POST",
                body: formData
            });

            const html = await res.text();
            render(html);

            if (res.ok) {
                showBanner("Picture uploaded successfully.", false);
            } else {
                showBanner(html || "Upload failed.", true);
            }
        } catch (err) {
            console.error(err);
            showBanner("An unexpected error happened while uploading.", true);
        }
    };

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

            if (res.ok) {
                showBanner("Picture deleted successfully.", false);
            } else {
                showBanner(html || "Delete failed.", true);
            }
        } catch (err) {
            console.error(err);
            showBanner("An unexpected error happened while deleting.", true);
        }
    };

    window.LoadPicturesSection = async function () {
        await loadPartial(false, "", false);
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