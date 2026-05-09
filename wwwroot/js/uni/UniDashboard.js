(function () {
    // Navigate to the section that follows currentSectionId in the sidebar order
    window.scrollToNextSection = function (currentSectionId) {
        const order = [
            "sec-instructions",
            "sec-general",
            "sec-academic",
            "sec-admission-duration",
            "sec-faculties",
            "sec-programs",
            "sec-med",
            "sec-hosp",
            "sec-infra",
            "sec-labs",
            "sec-library",
            "sec-pictures",
            "sec-accreditation-bodies",
            "sec-submit-application"
        ];
        const idx = order.indexOf(currentSectionId);
        if (idx === -1 || idx >= order.length - 1) return;
        const next = document.getElementById(order[idx + 1]);
        if (next) {
            setTimeout(function () {
                next.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 600);
        }
    };

    // Sidebar active highlight while scrolling
    document.addEventListener("DOMContentLoaded", () => {
        const sections = document.querySelectorAll("section[id]");
        const sidebarLinks = document.querySelectorAll(".side-item[href^='#']");

        function activateSection() {
            let current = "";
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 140;
                const sectionHeight = section.offsetHeight;
                const scrollY = window.pageYOffset;

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute("id");
                }
            });

            sidebarLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === "#" + current) link.classList.add("active");
            });
        }

        window.addEventListener("scroll", activateSection);
        activateSection();
    });
})();