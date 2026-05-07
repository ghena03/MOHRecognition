document.addEventListener("DOMContentLoaded", function () {

    const master = document.getElementById("chkMaster");
    const phd = document.getElementById("chkPhD");
    const diploma = document.getElementById("chkDiploma");

    function toggle(el, card, students, faculty) {
        el.addEventListener("change", function () {
            const show = this.checked;

            if (card) card.style.display = show ? "block" : "none";
            if (students) students.style.display = show ? "grid" : "none";
            if (faculty) faculty.style.display = show ? "block" : "none";
        });
    }

    toggle(master,
        document.getElementById("masterCard"),
        document.getElementById("masterStudents"),
        document.getElementById("masterFaculty")
    );

    toggle(phd,
        document.getElementById("phdCard"),
        document.getElementById("phdStudents"),
        document.getElementById("phdFaculty")
    );

    toggle(diploma,
        document.getElementById("diplomaCard"),
        document.getElementById("diplomaStudents"),
        document.getElementById("diplomaFaculty")
    );

    // Validation
    document.querySelector("form").addEventListener("submit", function (e) {
        if (!this.checkValidity()) {
            e.preventDefault();
            alert("Please fill all required fields");
        }
    });

});

// ===== SIDEBAR SCROLL + ACTIVE =====
const sideLinks = document.querySelectorAll(".side-item");

sideLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const target = document.querySelector(targetId);

        if (!target) return;

        const offset = 100; // adjust for header height

        window.scrollTo({
            top: target.offsetTop - offset,
            behavior: "smooth"
        });

        // ACTIVE STATE
        sideLinks.forEach(l => l.classList.remove("active"));
        this.classList.add("active");
    });
});

// ===== SCROLL DETECTION (AUTO ACTIVE) =====
window.addEventListener("scroll", () => {
    let current = "";

    document.querySelectorAll("section").forEach(section => {
        const sectionTop = section.offsetTop - 120;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });

    sideLinks.forEach(link => {
        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});