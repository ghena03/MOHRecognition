// ================= PROCTORING =================

const examOnline =
    document.getElementById("examOnline");

const examHybrid =
    document.getElementById("examHybrid");

const examCampus =
    document.getElementById("examCampus");

const proctoringSection =
    document.getElementById("proctoringSection");

function toggleProctoring() {

    if (
        examOnline.checked ||
        examHybrid.checked
    ) {
        proctoringSection.style.display = "block";
    }
    else {
        proctoringSection.style.display = "none";
    }
}

examOnline.addEventListener(
    "change",
    toggleProctoring
);

examHybrid.addEventListener(
    "change",
    toggleProctoring
);

examCampus.addEventListener(
    "change",
    toggleProctoring
);


// ================= PLATFORM =================

const hasPlatformYes =
    document.getElementById("hasPlatformYes");

const hasPlatformNo =
    document.getElementById("hasPlatformNo");

const platformDetails =
    document.getElementById("platformDetails");

function togglePlatformDetails() {

    if (hasPlatformYes.checked) {

        platformDetails.style.display = "block";
    }
    else {

        platformDetails.style.display = "none";
    }
}

hasPlatformYes.addEventListener(
    "change",
    togglePlatformDetails
);

hasPlatformNo.addEventListener(
    "change",
    togglePlatformDetails
);
// ================= ACTIVE SIDEBAR =================

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(".side-item");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop;

        const sectionHeight =
            section.clientHeight;

        if (
            pageYOffset >= sectionTop - 200
        ) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            `#${current}`
        ) {
            link.classList.add("active");
        }
    });
});
// ================= SAVE =================

window.saveOnlineSystem =
    async function (nextSectionId = null) {

        try {

            const form =
                document.getElementById(
                    "onlineSystemForm"
                );

            if (!form) {

                Swal.fire({
                    icon: "error",
                    title: "Form Not Found"
                });

                return;
            }

            const formData =
                new FormData(form);

            const response =
                await fetch(
                    "/Home/SaveOnlineSystem",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            const result =
                await response.json();

            if (result.success) {

                await Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: "Data saved successfully.",
                    confirmButtonColor: "#8d1831"
                });

                if (nextSectionId) {

                    const nextSection =
                        document.getElementById(
                            nextSectionId
                        );

                    if (nextSection) {

                        nextSection.scrollIntoView({
                            behavior: "smooth"
                        });
                    }
                }
            }
            else {

                Swal.fire({
                    icon: "error",
                    title: "Save Failed",
                    text: "Something went wrong.",
                    confirmButtonColor: "#8d1831"
                });
            }
        }
        catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Check console.",
                confirmButtonColor: "#8d1831"
            });
        }
    };