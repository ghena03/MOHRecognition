(function () {
    const URLS = {
        save: "/Home/AutoSaveDuration"
    };

    function qs(sel, root = document) {
        return root.querySelector(sel);
    }

    function showBanner(sectionEl, type, text) {
        if (window.showAppToast) {
            window.showAppToast(text, type === "ok" ? "success" : "error");
            return;
        }
        // type: "ok" | "warn"
        let banner = qs("#durationBanner", sectionEl);

        if (!banner) {
            banner = document.createElement("div");
            banner.id = "durationBanner";
            banner.className = "banner";
            banner.style.marginTop = "12px";

            banner.innerHTML = `
                <span class="dot"></span>
                <span class="txt"></span>
                <button type="button" class="x" aria-label="Close">×</button>
            `;

            // Put banner at top of the section body (nice + consistent)
            const cardBd = qs(".card-bd", sectionEl) || sectionEl;
            cardBd.insertBefore(banner, cardBd.firstChild);

            // close button
            const closeBtn = qs(".x", banner);
            closeBtn.addEventListener("click", () => (banner.style.display = "none"));
        }

        banner.style.display = "flex";
        banner.classList.remove("ok", "warn");
        banner.classList.add(type);

        qs(".txt", banner).textContent = text;
    }

    function collectSectionForm(sectionId) {
        const sec = document.getElementById(sectionId);
        if (!sec) return null;

        const fields = sec.querySelectorAll("input[name], select[name], textarea[name]");
        const form = new URLSearchParams();

        fields.forEach(el => {
            // ignore disabled fields
            if (el.disabled) return;

            const name = el.getAttribute("name");
            if (!name) return;

            // checkbox/radio handling
            if ((el.type === "checkbox" || el.type === "radio") && !el.checked) return;

            form.append(name, (el.value ?? "").toString());
        });

        return { sec, form, fields };
    }

    function validateRequiredDuration(sec) {
        const inputs = sec.querySelectorAll("input[name^='Duration.']");

        for (const inp of inputs) {
            const val = (inp.value || "").trim();
            if (!val) {
                inp.classList.add("invalid"); // if you have styling; harmless if not
                inp.focus();
                return false;
            } else {
                inp.classList.remove("invalid");
            }
        }
        return true;
    }

    async function postForm(url, form) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: form.toString()
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(txt || "Request failed.");
        }
        return true;
    }

    function init() {
        const btn = document.getElementById("btnSaveDuration");
        const sec = document.getElementById("sec-duration");

        if (!btn || !sec) return;

        btn.addEventListener("click", async () => {
            try {
                // Validate required
                if (!validateRequiredDuration(sec)) {
                    showBanner(sec, "warn", "Please fill all Study Duration fields before saving.");
                    return;
                }

                // Collect + send
                const pack = collectSectionForm("sec-duration");
                if (!pack) return;

                btn.disabled = true;
                btn.classList.add("loading"); // harmless if you don’t style it

                await postForm(URLS.save, pack.form);

                // UI success message
                showBanner(sec, "ok", "Study Duration saved successfully.");
            } catch (e) {
                showBanner(sec, "warn", "Save failed. Please try again.");
            } finally {
                btn.disabled = false;
                btn.classList.remove("loading");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})();