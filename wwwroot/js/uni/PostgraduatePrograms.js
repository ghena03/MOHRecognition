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



document.addEventListener("DOMContentLoaded", function () {

    // ================= DEGREE TOGGLES =================

    const master = document.getElementById("chkMaster");
    const phd = document.getElementById("chkPhD");
    const diploma = document.getElementById("chkDiploma");



    function toggle(el, card, students, faculty) {

        el.addEventListener("change", function () {

            const show = this.checked;

            if (card)
                card.style.display = show ? "block" : "none";

            if (students)
                students.style.display = show ? "grid" : "none";

            if (faculty)
                faculty.style.display = show ? "block" : "none";

        });

    }



    toggle(
        master,
        document.getElementById("masterCard"),
        document.getElementById("masterStudents"),
        document.getElementById("masterFaculty")
    );

    toggle(
        phd,
        document.getElementById("phdCard"),
        document.getElementById("phdStudents"),
        document.getElementById("phdFaculty")
    );

    toggle(
        diploma,
        document.getElementById("diplomaCard"),
        document.getElementById("diplomaStudents"),
        document.getElementById("diplomaFaculty")
    );



    // ================= PUBLIC INFO =================

    document.getElementById("btnSavePublic")
        ?.addEventListener("click", function () {

            let errors = [];

            const address =
                document.querySelector('[name="MailingFullAddress"]').value.trim();

            const phone =
                document.querySelector('[name="DirectPhoneNumber"]').value.trim();

            const email =
                document.querySelector('[name="EmailAddress"]').value.trim();

            const website =
                document.querySelector('[name="InstitutionalWebAddress"]').value.trim();



            if (!address)
                errors.push("Mailing address required");

            if (!phone)
                errors.push("Phone number required");

            if (!email)
                errors.push("Email required");

            if (!website)
                errors.push("Website required");



            if (errors.length > 0) {

                showToast("error", errors[0]);
                return;

            }

            showToast("success", "Public info saved");
            scrollToNext("sec-programs");

        });




    // ================= PROGRAMS =================

    document.getElementById("btnSavePrograms")
        ?.addEventListener("click", function () {

            let errors = [];



            if (master.checked) {

                const file =
                    document.querySelector('[name="MasterFile"]').value;

                if (!file)
                    errors.push("Master file required");

            }



            if (phd.checked) {

                const file =
                    document.querySelector('[name="PhDFile"]').value;

                if (!file)
                    errors.push("PhD file required");

            }



            if (diploma.checked) {

                const file =
                    document.querySelector('[name="DiplomaFile"]').value;

                if (!file)
                    errors.push("Diploma file required");

            }



            if (errors.length > 0) {

                showToast("error", errors[0]);
                return;

            }

            showToast("success", "Programs saved");
            scrollToNext("sec-students");

        });




    // ================= STUDENTS =================

    document.getElementById("btnSaveStudents")
        ?.addEventListener("click", function () {

            let errors = [];



            if (master.checked) {

                const value =
                    document.querySelector('[name="MasterStudents"]').value;

                if (!value)
                    errors.push("Master students required");

            }



            if (phd.checked) {

                const value =
                    document.querySelector('[name="PhDStudents"]').value;

                if (!value)
                    errors.push("PhD students required");

            }



            if (diploma.checked) {

                const value =
                    document.querySelector('[name="DiplomaStudents"]').value;

                if (!value)
                    errors.push("Diploma students required");

            }



            if (errors.length > 0) {

                showToast("error", errors[0]);
                return;

            }

            showToast("success", "Students saved");
            scrollToNext("sec-faculty");

        });




    // ================= FACULTY =================

    document.getElementById("btnSaveFaculty")
        ?.addEventListener("click", function () {

            let errors = [];



            if (master.checked) {

                const professor =
                    document.querySelector('[name="MasterProfessor"]').value;

                const associate =
                    document.querySelector('[name="MasterAssociate"]').value;

                const assistant =
                    document.querySelector('[name="MasterAssistant"]').value;



                if (!professor)
                    errors.push("Master professor count required");

                if (!associate)
                    errors.push("Master associate professor count required");

                if (!assistant)
                    errors.push("Master assistant professor count required");

            }



            if (phd.checked) {

                const professor =
                    document.querySelector('[name="PhDProfessor"]').value;

                const associate =
                    document.querySelector('[name="PhDAssociate"]').value;

                const assistant =
                    document.querySelector('[name="PhDAssistant"]').value;



                if (!professor)
                    errors.push("PhD professor count required");

                if (!associate)
                    errors.push("PhD associate professor count required");

                if (!assistant)
                    errors.push("PhD assistant professor count required");

            }



            if (diploma.checked) {

                const professor =
                    document.querySelector('[name="DiplomaProfessor"]').value;

                const associate =
                    document.querySelector('[name="DiplomaAssociate"]').value;

                const assistant =
                    document.querySelector('[name="DiplomaAssistant"]').value;



                if (!professor)
                    errors.push("Diploma professor count required");

                if (!associate)
                    errors.push("Diploma associate professor count required");

                if (!assistant)
                    errors.push("Diploma assistant professor count required");

            }



            if (errors.length > 0) {

                showToast("error", errors[0]);
                return;

            }

            showToast("success", "Faculty saved");
            scrollToNext("sec-user");

        });




    // ================= ONLINE QUESTION BUTTON TOGGLE =================

    const radioOnlineYes = document.querySelector('input[name="ApplyOnline"][value="yes"]');
    const radioOnlineNo  = document.querySelector('input[name="ApplyOnline"][value="no"]');
    const btnSubmit      = document.getElementById("btnSubmitPostgrad");
    const btnOnline      = document.getElementById("btnContinueOnline");

    function updateOnlineButtons() {
        const selected = document.querySelector('input[name="ApplyOnline"]:checked')?.value || "no";
        if (selected === "yes") {
            if (btnSubmit) btnSubmit.style.display = "none";
            if (btnOnline) btnOnline.style.display = "inline-flex";
        } else {
            if (btnSubmit) btnSubmit.style.display = "inline-flex";
            if (btnOnline) btnOnline.style.display = "none";
        }
    }

    if (radioOnlineYes) radioOnlineYes.onchange = updateOnlineButtons;
    if (radioOnlineNo)  radioOnlineNo.onchange  = updateOnlineButtons;
    updateOnlineButtons();



    // ================= FINAL SUBMIT =================

    document.querySelector("form")
        ?.addEventListener("submit", function (e) {

            const name      = document.querySelector('[name="Name"]')?.value.trim();
            const workPlace = document.querySelector('[name="WorkPlace"]')?.value.trim();

            if (!name || !workPlace) {
                e.preventDefault();
                showToast("error", "Please fill in Full Name and Work Place.");
            }

        });

});




// ================= SIDEBAR =================

const sideLinks = document.querySelectorAll(".side-item");

sideLinks.forEach(link => {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const targetId = this.getAttribute("href");
        const target = document.querySelector(targetId);

        if (!target)
            return;

        const offset = 100;

        window.scrollTo({
            top: target.offsetTop - offset,
            behavior: "smooth"
        });



        sideLinks.forEach(l =>
            l.classList.remove("active"));

        this.classList.add("active");

    });

});




// ================= SCROLL ACTIVE =================

window.addEventListener("scroll", () => {

    let current = "";

    document.querySelectorAll("section").forEach(section => {

        const sectionTop =
            section.offsetTop - 120;

        if (window.scrollY >= sectionTop) {

            current =
                section.getAttribute("id");

        }

    });



    sideLinks.forEach(link => {

        link.classList.remove("active");



        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});