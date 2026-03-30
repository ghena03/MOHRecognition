(function () {
    const containerId = "teachingStaffContainer";

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

    function showBanner(message, type) {
        const banner = document.getElementById("tsExcelBanner");
        if (!banner) return;

        banner.style.display = "flex";
        banner.className = "banner " + (type || "warn");

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;
    }

    async function loadTeachingStaffSection() {
        const url = getUrl("data-load-url");
        if (!url) return;

        const res = await fetch(url, { cache: "no-store" });
        const html = await res.text();
        render(html);
        wireEvents();
    }

    async function uploadExcel() {
        const input = document.getElementById("tsExcelFile");
        if (!input || !input.files || !input.files.length) {
            showBanner("Please choose the Teaching Staff Excel file first.", "warn");
            return;
        }

        const file = input.files[0];
        const fd = new FormData();
        fd.append("file", file);

        const url = getUrl("data-upload-url");
        if (!url) return;

        const res = await fetch(url, {
            method: "POST",
            body: fd
        });

        const html = await res.text();

        if (!res.ok) {
            showBanner(html || "Upload failed.", "warn");
            return;
        }

        render(html);
        wireEvents();
        showBanner("Teaching Staff Excel file uploaded successfully.", "ok");
    }

    async function deleteExcel(id) {
        const url = getUrl("data-delete-url");
        if (!url) return;

        const fd = new FormData();
        fd.append("id", id);

        const res = await fetch(url, {
            method: "POST",
            body: fd
        });

        const html = await res.text();

        if (!res.ok) {
            showBanner(html || "Delete failed.", "warn");
            return;
        }

        render(html);
        wireEvents();
        showBanner("Teaching Staff Excel file deleted successfully.", "ok");
    }

    function wireEvents() {
        const uploadBtn = document.getElementById("tsExcelUploadBtn");
        if (uploadBtn) {
            uploadBtn.onclick = uploadExcel;
        }

        document.querySelectorAll(".ts-delete-file").forEach(btn => {
            btn.onclick = function () {
                const id = this.getAttribute("data-id");
                if (!id) return;

                if (confirm("Are you sure you want to delete this file?")) {
                    deleteExcel(id);
                }
            };
        });
    }

    window.LoadTeachingStaffSection = loadTeachingStaffSection;

    document.addEventListener("DOMContentLoaded", function () {
        if (getContainer()) {
            loadTeachingStaffSection();
        }
    });
})();