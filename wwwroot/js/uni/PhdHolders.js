// wwwroot/js/PhdHolders.js
(function () {
    const containerId = "phdHoldersContainer";

    function $(id) { return document.getElementById(id); }

    function getContainer() {
        return document.getElementById(containerId);
    }

    function getUrl(attrName) {
        const c = getContainer();
        return c ? c.getAttribute(attrName) : null;
    }

    function render(html) {
        const c = getContainer();
        if (c) c.innerHTML = html;
    }

    // ---------- Banner UI ----------
    function ensureBanner() {
        // banner is inside partial, but we keep safe
        const b = document.getElementById("phdBanner");
        return b;
    }

    function showError(msg) {
        if (window.showAppToast) {
            window.showAppToast(msg, "error");
            return;
        }
        const b = ensureBanner();
        if (!b) return;
        b.style.display = "flex";
        b.classList.remove("ok");
        b.classList.add("warn");
        b.querySelector(".txt").textContent = msg;
    }

    function clearError() {
        const b = ensureBanner();
        if (!b) return;
        b.style.display = "none";
    }

    function markInvalid(el, isInvalid) {
        if (!el) return;
        if (isInvalid) el.classList.add("input-invalid");
        else el.classList.remove("input-invalid");
    }

    function clearInvalid() {
        ["phd_name", "phd_programId", "phd_major", "phd_status"].forEach(id => markInvalid($(id), false));
    }

    function v(id) { return ($(id)?.value ?? "").trim(); }

    function lockHeight(el) {
        const h = el.offsetHeight;
        el.style.minHeight = h + "px";
        return () => { el.style.minHeight = ""; };
    }

    async function post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams(data).toString()
        });
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || "Request failed");
        return txt;
    }

    async function loadPartialNoJump() {
        const c = getContainer();
        if (!c) return;

        const partialUrl = getUrl("data-partial-url");
        if (!partialUrl) {
            c.innerHTML = `<div style="padding:12px; color:#b00020; font-weight:600;">
      PhD error: data-partial-url is missing.
    </div>`;
            return;
        }

        const y = window.scrollY || 0;
        const unlock = lockHeight(c);

        try {
            const res = await fetch(partialUrl, { method: "GET" });
            const html = await res.text();

            if (!res.ok) {
                c.innerHTML = `<div style="padding:12px; color:#b00020; font-weight:600;">
        PhD error: ${res.status} <br/>
        <div style="margin-top:8px; font-weight:400; white-space:pre-wrap;">${html}</div>
      </div>`;
                return;
            }

            render(html);
            window.scrollTo(0, y);
        } catch (e) {
            c.innerHTML = `<div style="padding:12px; color:#b00020; font-weight:600;">
      PhD error: ${e && e.message ? e.message : e}
    </div>`;
        } finally {
            unlock();
        }
    }

    // ✅ allow Programs.js to refresh this dropdown after programs changes
    window.refreshPhdHoldersNoJump = async function () {
        await loadPartialNoJump();
    };

    // ---------- Form helpers ----------
    window.PhdCancelEdit = function () {
        if ($("phd_editId")) $("phd_editId").value = "";

        ["phd_name", "phd_programId", "phd_major", "phd_status"].forEach(id => {
            if ($(id)) $(id).value = "";
        });

        const prog = $("phd_programId");
        if (prog) prog.disabled = false;

        const addBtn = $("phd_addBtn");
        if (addBtn) addBtn.innerText = "Add";

        const cancelBtn = $("phd_cancelBtn");
        if (cancelBtn) cancelBtn.style.display = "none";

        clearError();
        clearInvalid();
    };

    window.PhdStartEdit = function (id) {
        $("phd_editId").value = id;

        $("phd_name").value = $("phd_row_name_" + id).value;
        $("phd_programId").value = $("phd_row_programId_" + id).value;
        $("phd_major").value = $("phd_row_major_" + id).value;
        $("phd_status").value = $("phd_row_status_" + id).value;

        // lock program in edit mode (same as TeachingStaff)
        $("phd_programId").disabled = true;

        $("phd_addBtn").innerText = "Update";
        $("phd_cancelBtn").style.display = "inline-block";

        clearError();
        clearInvalid();
    };

    function validate(isEdit) {
        if (!v("phd_name")) return { msg: "Name is required.", field: "phd_name" };
        if (!isEdit && !v("phd_programId")) return { msg: "Program is required.", field: "phd_programId" };
        if (!v("phd_major")) return { msg: "Major Area of Study is required.", field: "phd_major" };
        if (!v("phd_status")) return { msg: "Status is required.", field: "phd_status" };
        return null;
    }

    // ---------- Actions ----------
    window.PhdAdd = async function () {
        const c = getContainer();
        if (!c) return;

        clearError();
        clearInvalid();

        const editId = v("phd_editId");
        if (editId) return window.PhdUpdate();

        const err = validate(false);
        if (err) {
            showError(err.msg);
            markInvalid($(err.field), true);
            return;
        }

        const y = window.scrollY || 0;
        const unlock = lockHeight(c);

        try {
            const html = await post(getUrl("data-add-url"), {
                name: v("phd_name"),
                programId: v("phd_programId"),
                majorAreaOfStudy: v("phd_major"),
                status: v("phd_status")
            });

            render(html);
            window.scrollTo(0, y);
            window.PhdCancelEdit();
        } catch (e) {
            showError(e.message || "Error");
        } finally {
            unlock();
        }
    };

    window.PhdUpdate = async function () {
        const c = getContainer();
        if (!c) return;

        clearError();
        clearInvalid();

        const err = validate(true);
        if (err) {
            showError(err.msg);
            markInvalid($(err.field), true);
            return;
        }

        const y = window.scrollY || 0;
        const unlock = lockHeight(c);

        try {
            const html = await post(getUrl("data-update-url"), {
                id: v("phd_editId"),
                name: v("phd_name"),
                majorAreaOfStudy: v("phd_major"),
                status: v("phd_status")
            });

            render(html);
            window.scrollTo(0, y);
            window.PhdCancelEdit();
        } catch (e) {
            showError(e.message || "Error");
        } finally {
            unlock();
        }
    };

    // ✅ No confirm — delete immediately
    window.PhdDelete = async function (id) {
        const c = getContainer();
        if (!c) return;

        clearError();
        clearInvalid();

        const y = window.scrollY || 0;
        const unlock = lockHeight(c);

        try {
            const html = await post(getUrl("data-del-url"), { id });
            render(html);
            window.scrollTo(0, y);
            window.PhdCancelEdit();
        } catch (e) {
            showError(e.message || "Error");
        } finally {
            unlock();
        }
    };

    // init
    document.addEventListener("DOMContentLoaded", function () {
        if (!getContainer()) return;
        loadPartialNoJump();
    });
})();