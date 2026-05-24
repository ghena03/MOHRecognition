// ================= TOAST =================

function showToast(type, message) {
    let host = document.getElementById("uniToastHost");
    if (!host) {
        host = document.createElement("div");
        host.id = "uniToastHost";
        host.className = "uni-toast-host";
        document.body.appendChild(host);
    }

    const toast = document.createElement("div");
    toast.className = "uni-toast" + (type === "error" ? " is-error" : " is-success");
    toast.textContent = message;
    host.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 220);
    }, 2200);
}


// ================= SCROLL =================

function scrollToNext(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}


// ================= PROCTORING =================

const examOnline   = document.getElementById("examOnline");
const examHybrid   = document.getElementById("examHybrid");
const examCampus   = document.getElementById("examCampus");
const proctoringSection = document.getElementById("proctoringSection");

function toggleProctoring() {
    if (examOnline.checked || examHybrid.checked) {
        proctoringSection.style.display = "block";
    } else {
        proctoringSection.style.display = "none";
    }
}

examOnline.addEventListener("change", toggleProctoring);
examHybrid.addEventListener("change", toggleProctoring);
examCampus.addEventListener("change", toggleProctoring);


// ================= PLATFORM =================

const hasPlatformYes   = document.getElementById("hasPlatformYes");
const hasPlatformNo    = document.getElementById("hasPlatformNo");
const platformDetails  = document.getElementById("platformDetails");

function togglePlatformDetails() {
    platformDetails.style.display = hasPlatformYes.checked ? "block" : "none";
}

hasPlatformYes.addEventListener("change", togglePlatformDetails);
hasPlatformNo.addEventListener("change",  togglePlatformDetails);


// ================= ACTIVE SIDEBAR =================

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".side-item");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - 200)
            current = section.getAttribute("id");
    });
    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`)
            link.classList.add("active");
    });
});


// ================= SAVE =================

window.saveOnlineSystem = async function (nextSectionId) {
    try {
        const form = document.getElementById("onlineSystemForm");
        if (!form) { showToast("error", "Form not found"); return; }

        const response = await fetch("/Home/SaveOnlineSystem", {
            method: "POST",
            body: new FormData(form)
        });

        const result = await response.json();

        if (result.success) {
            showToast("success", "Saved successfully");
            if (nextSectionId) scrollToNext(nextSectionId);
        } else {
            showToast("error", "Save failed");
        }
    } catch (error) {
        console.error(error);
        showToast("error", "Something went wrong");
    }
};
