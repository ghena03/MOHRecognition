(function () {
    const containerId = "submitApplicationContainer";

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
        const banner = document.getElementById("subAppBanner");
        if (!banner) return;

        const txt = banner.querySelector(".txt");
        if (txt) txt.textContent = message;

        banner.classList.remove("warn", "ok");
        banner.classList.add(isError ? "warn" : "ok");
        banner.style.display = "flex";
    }

    function collectData() {
        return {
            ApplicantName: document.getElementById("subapp_name")?.value?.trim() || "",
            WorkPlace: document.getElementById("subapp_workplace")?.value?.trim() || "",
            IsAcknowledged: document.getElementById("subapp_ack")?.checked || false
        };
    }

    function validate(data) {
        return data.ApplicantName !== "" &&
            data.WorkPlace !== "";
    }

    function bindSubmitButton() {
        const btn = document.getElementById("btnSubmitApplication");
        if (!btn) return;

        btn.onclick = async function () {
            const data = collectData();

            if (!validate(data)) {
                showBanner("Please fill all required fields.", true);
                return;
            }

            if (!data.IsAcknowledged) {
                showBanner("Please confirm that all data are correct.", true);
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
                    body: new URLSearchParams({
                        ApplicantName: data.ApplicantName,
                        WorkPlace: data.WorkPlace,
                        IsAcknowledged: data.IsAcknowledged
                    }).toString()
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    showBanner(errorText || "Failed to submit application.", true);
                    return;
                }

                const result = await res.json();

                if (result.success && result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                    return;
                }

                showBanner("Failed to submit application.", true);
            } catch (err) {
                showBanner("Something went wrong while submitting the application.", true);
            }
        };
    }

    async function loadPartial(showMessage = false, message = "", isError = false) {
        const url = getUrl("data-load-url");
        if (!url) return;

        try {
            const res = await fetch(url, { cache: "no-store" });
            const html = await res.text();
            render(html);
            bindSubmitButton();

            if (showMessage && message) {
                showBanner(message, isError);
            }
        } catch (err) {
            console.error(err);
            showBanner("Failed to load submit application section.", true);
        }
    }

    window.LoadSubmitApplicationSection = async function () {
        await loadPartial(false, "", false);
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;

        setTimeout(async () => {
            await loadPartial(false, "", false);

            if (window.location.hash === "#sec-submit-application") {
                const sec = document.getElementById("sec-submit-application");
                if (sec) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: "auto", block: "start" });
                    }, 50);
                }
            }
        }, 150);
    });
})();