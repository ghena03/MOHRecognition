document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".side-link");
    const sections = document.querySelectorAll(".section-block");

    function setActiveLink() {
        let currentSectionId = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const scrollY = window.scrollY;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        links.forEach(link => {
            link.classList.remove("active");
            const target = link.getAttribute("href").substring(1);

            if (target === currentSectionId) {
                link.classList.add("active");
            }
        });
    }

    links.forEach(link => {
        link.addEventListener("click", function () {
            links.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

    window.addEventListener("scroll", setActiveLink);
    setActiveLink();
});