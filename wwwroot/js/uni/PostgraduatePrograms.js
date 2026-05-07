// ===============================
// Postgraduate Page Script (FINAL CLEAN)
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // ===============================
    // CHECKBOXES
    // ===============================
    const master = document.getElementById("chkMaster");
    const phd = document.getElementById("chkPhD");
    const diploma = document.getElementById("chkDiploma");

    // ===============================
    // PROGRAM CARDS
    // ===============================
    const masterCard = document.getElementById("masterCard");
    const phdCard = document.getElementById("phdCard");
    const diplomaCard = document.getElementById("diplomaCard");

    // ===============================
    // STUDENTS INPUTS
    // ===============================
    const masterStudents = document.getElementById("masterStudents");
    const phdStudents = document.getElementById("phdStudents");
    const diplomaStudents = document.getElementById("diplomaStudents");

    // ===============================
    // FACULTY SECTIONS
    // ===============================
    const masterFaculty = document.getElementById("masterFaculty");
    const phdFaculty = document.getElementById("phdFaculty");
    const diplomaFaculty = document.getElementById("diplomaFaculty");

    // ===============================
    // TOGGLE FUNCTION (ALL IN ONE)
    // ===============================
    function toggleSection(checkbox, card, students, faculty) {
        if (!checkbox) return;

        checkbox.addEventListener("change", function () {
            const show = this.checked;

            // programs
            if (card) card.style.display = show ? "block" : "none";

            // students
            if (students) students.style.display = show ? "flex" : "none";

            // faculty
            if (faculty) faculty.style.display = show ? "block" : "none";
        });
    }

    // ===============================
    // APPLY TO ALL DEGREES
    // ===============================
    toggleSection(master, masterCard, masterStudents, masterFaculty);
    toggleSection(phd, phdCard, phdStudents, phdFaculty);
    toggleSection(diploma, diplomaCard, diplomaStudents, diplomaFaculty);

    // ===============================
    // FILE NAME DISPLAY
    // ===============================
    document.querySelectorAll("input[type='file']").forEach(input => {
        input.addEventListener("change", function () {

            const fileName = this.files.length
                ? this.files[0].name
                : "No file selected";

            const container = this.closest(".upload-card") || this.closest(".drop-zone");

            if (container) {
                const label = container.querySelector(".file-name");
                if (label) label.textContent = fileName;
            }
        });
    });

});
document.querySelectorAll("#sec-faculty form").forEach(form => {
    form.addEventListener("submit", function (e) {

        if (!form.checkValidity()) {
            e.preventDefault();
            alert("Please fill all required fields before saving.");
        }
    });
});
document.querySelectorAll(".btn-save").forEach(btn => {
    btn.addEventListener("click", function () {

        const inputs = this.parentElement.querySelectorAll("input");

        for (let input of inputs) {
            if (!input.value) {
                alert("Please fill all fields");
                return;
            }
        }

        alert("Saved successfully ✅");
    });
});