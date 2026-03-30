(function () {
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