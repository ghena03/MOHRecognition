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
        const continueChoice = document.querySelector('input[name="subapp_continue_postgrad"]:checked');
        return {
            ApplicantName: document.getElementById("subapp_name")?.value?.trim() || "",
            WorkPlace: document.getElementById("subapp_workplace")?.value?.trim() || "",
            IsAcknowledged: document.getElementById("subapp_ack")?.checked || false,
            ContinueToPostgraduate: continueChoice ? (continueChoice.value === "yes") : false
        };
    }

    function validate(data) {
        return data.ApplicantName !== "" &&
            data.WorkPlace !== "";
    }

    async function sendSaveRequest(data) {
        const url = getUrl("data-save-url");
        if (!url) {
            showBanner("Save URL is missing.", true);
            return null;
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
                return null;
            }

            const result = await res.json();
            return result;
        } catch (err) {
            console.error(err);
            showBanner("Something went wrong while submitting the application.", true);
            return null;
        }
    }

    function bindSubmitUI() {
        // Setup UI toggles (ack -> show question; radio choice -> toggle buttons)
        const ack = document.getElementById("subapp_ack");
        const question = document.getElementById("subapp_postgrad_question");
        const btnSubmit = document.getElementById("btnSubmitApplication");
        const btnPostgrad = document.getElementById("btnSaveAndApplyPostgraduate");
        const radioYes = document.getElementById("subapp_continue_yes");
        const radioNo = document.getElementById("subapp_continue_no");

        function updateVisibility() {
            const acknowledged = ack?.checked || false;
            if (question) question.style.display = acknowledged ? "block" : "none";

            // if acknowledged is false, always show main submit and hide postgrad
            if (!acknowledged) {
                if (btnSubmit) btnSubmit.style.display = "inline-block";
                if (btnPostgrad) btnPostgrad.style.display = "none";
                return;
            }

            // acknowledged true -> check selection
            const selected = document.querySelector('input[name="subapp_continue_postgrad"]:checked')?.value || "no";
            if (selected === "yes") {
                if (btnSubmit) btnSubmit.style.display = "none";
                if (btnPostgrad) btnPostgrad.style.display = "inline-block";
            } else {
                if (btnSubmit) btnSubmit.style.display = "inline-block";
                if (btnPostgrad) btnPostgrad.style.display = "none";
            }
        }

        // attach events (use onclick/onchange to replace any previous handlers)
        if (ack) {
            ack.onchange = updateVisibility;
        }

        if (radioYes) radioYes.onchange = updateVisibility;
        if (radioNo) radioNo.onchange = updateVisibility;

        // initialize UI state
        updateVisibility();
    }

    function bindSubmitButton() {
        const btn = document.getElementById("btnSubmitApplication");
        const btnPost = document.getElementById("btnSaveAndApplyPostgraduate");

        async function handleClick(overrideContinueToPostgraduate = null) {
            const data = collectData();

            if (!validate(data)) {
                showBanner("Please fill all required fields.", true);
                return;
            }

            if (!data.IsAcknowledged) {
                showBanner("Please confirm that all data are correct.", true);
                return;
            }

            // if caller passed override, use it (postgrad button); otherwise use collected value
            const continueToPostgraduate = typeof overrideContinueToPostgraduate === "boolean"
                ? overrideContinueToPostgraduate
                : data.ContinueToPostgraduate;

            const result = await sendSaveRequest(data);
            if (!result) return;

            // If user chose to continue to postgraduate, redirect to postgraduate instructions.
            if (continueToPostgraduate) {
                window.location.href = "/Home/UniPostgraduateInstructions";
                return;
            }

            // otherwise use server provided redirect if any
            if (result.success && result.redirectUrl) {
                window.location.href = result.redirectUrl;
                return;
            }

            showBanner("Failed to submit application.", true);
        }

        if (btn) {
            btn.onclick = function () { handleClick(false); }; // explicit no
        }

        if (btnPost) {
            btnPost.onclick = function () { handleClick(true); }; // explicit yes
        }
    }

    async function loadPartial(showMessage = false, message = "", isError = false) {
        const url = getUrl("data-load-url");
        if (!url) return;

        try {
            const res = await fetch(url, { cache: "no-store" });
            const html = await res.text();
            render(html);

            // bind UI toggles and buttons after partial is injected
            bindSubmitUI();
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