(function () {

    async function postForm(url, dataObj) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams(dataObj).toString()
        });

        if (!res.ok) {
            let msg = "Request failed.";
            try { msg = await res.text(); } catch { }
            throw new Error(msg);
        }

        return await res.text(); // we expect partial HTML back
    }

    function showError(sectionEl, text) {
        if (window.showAppToast) {
            window.showAppToast(text, "error");
            return;
        }
        let b = sectionEl.querySelector("#admissionBanner");
        if (!b) {
            b = document.createElement("div");
            b.id = "admissionBanner";
            b.className = "banner warn";
            b.style.marginTop = "12px";
            b.innerHTML = `<span class="dot"></span><span class="txt"></span><button type="button" class="x">×</button>`;

            const bd = sectionEl.querySelector(".card-bd") || sectionEl;
            bd.insertBefore(b, bd.firstChild);

            b.querySelector(".x").addEventListener("click", () => (b.style.display = "none"));
        }

        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = text;
    }

    function markInvalid(el, isInvalid) {
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    document.addEventListener("DOMContentLoaded", () => {
        const container = document.getElementById("admission-container");
        if (!container) return;

        // We'll set these URLs from HTML data attributes in the next step
        function getAddUrl() { return container.getAttribute("data-add-url"); }
        function getDelUrl() { return container.getAttribute("data-del-url"); }

        // Event delegation: works even after partial refresh
        container.addEventListener("click", async (e) => {
            const addBtn = e.target.closest("[data-adm-add]");
            const delBtn = e.target.closest("[data-adm-del]");
            if (!addBtn && !delBtn) return;

            const sec = container.querySelector("#sec-admission") || container;

            try {
                // ADD
                if (addBtn) {
                    const degree = addBtn.getAttribute("data-adm-add");
                    const inputId = "req_" + degree;
                    const input = container.querySelector("#" + CSS.escape(inputId));
                    const requirement = (input?.value ?? "").trim();

                    // client validation
                    markInvalid(input, false);
                    if (!requirement) {
                        markInvalid(input, true);
                        input?.focus();
                        showError(sec, `${degree}: Requirement is required.`);
                        return;
                    }

                    const url = getAddUrl();
                    if (!url) {
                        showError(sec, "Admission add URL is missing.");
                        return;
                    }

                    const html = await postForm(url, { degree, requirement });
                    container.innerHTML = html;

                    // keep user on same section
                    location.hash = "#sec-admission";
                    return;
                }

                // DELETE
                if (delBtn) {
                    const degree = delBtn.getAttribute("data-adm-del");
                    const id = delBtn.getAttribute("data-id");

                    const url = getDelUrl();
                    if (!url) {
                        showError(sec, "Admission delete URL is missing.");
                        return;
                    }

                    const html = await postForm(url, { degree, id });
                    container.innerHTML = html;

                    // keep user on same section
                    location.hash = "#sec-admission";
                    return;
                }

            } catch (err) {
                showError(sec, err.message || "Operation failed.");
            }
        });
    });

})();