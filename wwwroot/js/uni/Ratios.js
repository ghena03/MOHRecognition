(function () {

    function normalizeRatio(value) {
        if (!value) return "";
        value = value.replace(/\s+/g, "");
        value = value.replace(/[^0-9:]/g, "");
        const first = value.indexOf(":");
        if (first !== -1) {
            value = value.substring(0, first + 1) + value.substring(first + 1).replace(/:/g, "");
        }
        return value;
    }

    function isValidRatio(value) {
        return /^\d+:\d+$/.test(value);
    }

    function getRatioInputs(sec) {
        return Array.from(sec.querySelectorAll("input"))
            .filter(i => i.type !== "hidden" && i.type !== "button" && i.type !== "submit");
    }

    function markInvalid(el, isInvalid) {
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function showBanner(sec, type, text) {
        let b = sec.querySelector("#ratiosBanner");
        if (!b) {
            b = document.createElement("div");
            b.id = "ratiosBanner";
            b.className = "banner warn";
            b.style.marginTop = "12px";
            b.innerHTML = `<span class="dot"></span><span class="txt"></span><button type="button" class="x">×</button>`;

            const bd = sec.querySelector(".card-bd") || sec;
            bd.insertBefore(b, bd.firstChild);

            b.querySelector(".x").addEventListener("click", () => (b.style.display = "none"));
        }

        b.style.display = "flex";
        b.classList.remove("warn", "ok");
        b.classList.add(type === "ok" ? "ok" : "warn");
        b.querySelector(".txt").textContent = text;
    }

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
            data[name] = (el.value ?? "");
        });

        return data;
    }

    // only restrict typing + show format message on blur (and keep it)
    function wireInputs(sec) {
        const inputs = getRatioInputs(sec);

        inputs.forEach(inp => {
            inp.addEventListener("input", () => {
                const cleaned = normalizeRatio(inp.value);
                if (inp.value !== cleaned) inp.value = cleaned;
            });

            inp.addEventListener("blur", () => {
                inp.value = normalizeRatio(inp.value);
                const v = (inp.value || "").trim();

                if (v === "") {
                    markInvalid(inp, true);
                    return;
                }

                if (!isValidRatio(v)) {
                    markInvalid(inp, true);
                    // ✅ keep format message (as you want)
                    showBanner(sec, "warn", "Format should be like: 12:13 (numbers only).");
                    return;
                }

                markInvalid(inp, false);
            });
        });
    }

    // validate on save (priority: empty first, then format)
    function validateForSave(sec) {
        const inputs = getRatioInputs(sec);

        let hasEmpty = false;
        let hasBadFormat = false;

        inputs.forEach(inp => {
            inp.value = normalizeRatio(inp.value);
            const v = (inp.value || "").trim();

            if (v === "") {
                hasEmpty = true;
                markInvalid(inp, true);
                return;
            }

            if (!isValidRatio(v)) {
                hasBadFormat = true;
                markInvalid(inp, true);
                return;
            }

            markInvalid(inp, false);
        });

        return { hasEmpty, hasBadFormat };
    }

    document.addEventListener("DOMContentLoaded", () => {
        const sec = document.getElementById("sec-ratios");
        const btn = document.getElementById("btnSaveRatios");
        if (!sec || !btn) return;

        wireInputs(sec);

        btn.addEventListener("click", async () => {
            try {
                const v = validateForSave(sec);

                // ✅ Priority 1: empty fields
                if (v.hasEmpty) {
                    showBanner(sec, "warn", "Please fill all required fields.");
                    return;
                }

                // ✅ Priority 2: bad format
                if (v.hasBadFormat) {
                    showBanner(sec, "warn", "Format should be like: 12:13 (numbers only).");
                    return;
                }

                // ✅ Save
                const data = collect("sec-ratios");
                await postForm("/Home/SaveRatios", data);

                showBanner(sec, "ok", "Saved successfully.");

            } catch (e) {
                showBanner(sec, "warn", e.message || "Save failed. Please try again.");
            }
        });
    });

})();