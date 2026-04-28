(function () {

    async function postForm(url, dataObj) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams(dataObj).toString()
        });

        if (!res.ok) {
            let msg = "Save failed.";
            try { msg = await res.text(); } catch { }
            throw new Error(msg);
        }
    }

    function collect(sectionId) {
        const sec = document.getElementById(sectionId);
        const data = {};
        if (!sec) return data;

        sec.querySelectorAll("input, select, textarea").forEach(el => {
            const name = el.getAttribute("name");
            if (!name) return;

            if (el.type === "checkbox") data[name] = el.checked ? "true" : "false";
            else data[name] = (el.value ?? "");
        });

        return data;
    }

    function markInvalid(el, isInvalid) {
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function showToast(text, isError) {
        let host = document.getElementById("uniToastHost");
        if (!host) {
            host = document.createElement("div");
            host.id = "uniToastHost";
            host.style.position = "fixed";
            host.style.inset = "0";
            host.style.zIndex = "9999";
            host.style.display = "grid";
            host.style.placeItems = "center";
            host.style.pointerEvents = "none";
            document.body.appendChild(host);
        }

        const toast = document.createElement("div");
        toast.style.padding = "14px 16px";
        toast.style.borderRadius = "12px";
        toast.style.border = isError ? "1px solid rgba(185, 28, 28, .25)" : "1px solid rgba(22, 163, 74, .25)";
        toast.style.background = isError ? "#fef2f2" : "#f0fdf4";
        toast.style.color = isError ? "#991b1b" : "#166534";
        toast.style.boxShadow = "0 16px 38px rgba(2,8,23,.18)";
        toast.style.fontWeight = "800";
        toast.style.fontSize = "14px";
        toast.style.minWidth = "320px";
        toast.style.maxWidth = "520px";
        toast.style.textAlign = "center";
        toast.style.pointerEvents = "auto";
        toast.textContent = text;
        host.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-6px)";
            toast.style.transition = "all .2s ease";
            setTimeout(() => toast.remove(), 220);
        }, 2200);
    }

    function wireLanguageOfInstructionOther(sec) {
        const languageEl = sec.querySelector("[name='LanguageOfInstruction']");
        const otherWrap = sec.querySelector("#LanguageOfInstructionOtherWrap");
        const otherEl = sec.querySelector("[name='LanguageOfInstructionOther']");
        if (!languageEl || !otherWrap || !otherEl) return;

        const toggle = () => {
            const isOther = (languageEl.value || "").trim() === "Others";
            otherWrap.style.display = isOther ? "block" : "none";
            if (!isOther) {
                otherEl.value = "";
                otherEl.classList.remove("input-invalid");
            }
        };

        languageEl.addEventListener("change", toggle);
        toggle();
    }

    // ✅ Required fields (the ones with * in your Public Info section)
    const REQUIRED_FIELDS = [
        "InstitutionName",
        "FoundationDate",
        "DateOfEstablishment",
        "StartOfTeaching",
        "ModeOfStudy",
        "LanguageOfInstruction",
        "MailingFullAddress",
        "DirectPhoneNumber",
        "EmailAddress",
        "InstitutionalWebAddress"
    ];

    function validateRequired(sec) {
        let ok = true;

        // clear old marks
        sec.querySelectorAll(".input-invalid").forEach(x => x.classList.remove("input-invalid"));

        for (const name of REQUIRED_FIELDS) {
            const el = sec.querySelector(`[name='${name}']`);
            if (!el) continue;

            const v = (el.value ?? "").trim();
            const invalid = v.length === 0;
            markInvalid(el, invalid);
            if (invalid) ok = false;
        }

        const languageEl = sec.querySelector("[name='LanguageOfInstruction']");
        const otherEl = sec.querySelector("[name='LanguageOfInstructionOther']");
        if (languageEl && otherEl) {
            const needsOther = (languageEl.value || "").trim() === "Others";
            const otherInvalid = needsOther && (otherEl.value || "").trim().length === 0;
            markInvalid(otherEl, otherInvalid);
            if (otherInvalid) ok = false;
        }

        return ok;
    }

    function highlightFieldFromServerMessage(sec, msg) {
        // expecting: "InstitutionName is required."
        const m = msg.match(/^([A-Za-z0-9_]+)\b/);
        if (!m) return;

        const fieldName = m[1];
        const el = sec.querySelector(`[name='${fieldName}']`);
        if (el) {
            markInvalid(el, true);
            el.focus();
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const sec = document.getElementById("sec-general");
        const btn = document.getElementById("btnSavePublic");
        if (!sec || !btn) return;

        wireLanguageOfInstructionOther(sec);

        btn.addEventListener("click", async () => {
            try {
                if (!validateRequired(sec)) {
                    showToast("Please fill all required fields before saving.", true);
                    return;
                }

                const url = btn.getAttribute("data-save-url");
                if (!url) {
                    showToast("Save URL is missing.", true);
                    return;
                }

                const data = collect("sec-general");
                await postForm(url, data);

                // Success
                showToast("Public Info saved successfully.", false);
                const b = sec.querySelector("#publicBanner");
                if (b) b.style.display = "none";

            } catch (e) {
                const msg = e.message || "Save failed.";
                showToast(msg, true);
                highlightFieldFromServerMessage(sec, msg);
            }
        });
    });

})();