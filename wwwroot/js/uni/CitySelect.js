(function () {
    const COUNTRY_FIELD = document.querySelector("select[name='Country']");
    const CITY_SELECT = document.getElementById("CitySelect");
    const OTHER_CITY_WRAP = document.getElementById("OtherCityWrap");
    const OTHER_CITY_INPUT = document.getElementById("CityOther");

    if (!COUNTRY_FIELD || !CITY_SELECT) return;
    if (!OTHER_CITY_WRAP || !OTHER_CITY_INPUT) return;

    const initialCity = (CITY_SELECT.dataset.selectedCity || "").trim();

    function showOtherCity(value) {
        const isOther = (value || "").toLowerCase().includes("other");
        OTHER_CITY_WRAP.style.display = isOther ? "block" : "none";

        if (isOther) {
            OTHER_CITY_INPUT.required = true;
            OTHER_CITY_INPUT.focus();
        } else {
            OTHER_CITY_INPUT.required = false;
            OTHER_CITY_INPUT.value = "";
        }
    }

    function applySelectedCity(selectedCity) {
        const target = (selectedCity || "").trim();
        if (!target) return;

        const match = Array.from(CITY_SELECT.options)
            .find(option => option.value.toLowerCase() === target.toLowerCase());

        if (match) {
            CITY_SELECT.value = match.value;
            showOtherCity(CITY_SELECT.value);
            return;
        }

        const otherOption = Array.from(CITY_SELECT.options)
            .find(option => option.value.toLowerCase().includes("other"));

        if (otherOption) {
            CITY_SELECT.value = otherOption.value;
            showOtherCity(CITY_SELECT.value);
            OTHER_CITY_INPUT.value = target;
        }
    }

    async function loadCities(country, selectedCity = "") {
        CITY_SELECT.innerHTML = '<option value="">-- Choose City --</option>';
        OTHER_CITY_WRAP.style.display = "none";
        OTHER_CITY_INPUT.value = "";

        if (!country) return;

        try {
            const res = await fetch('/Home/GetCitiesByCountry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: country })
            });

            if (!res.ok) throw new Error("Failed to load cities");

            const cities = await res.json();
            cities.forEach(city => {
                const option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                CITY_SELECT.appendChild(option);
            });

            applySelectedCity(selectedCity);
        } catch (err) {
            console.error("Error loading cities:", err);
            const option = document.createElement("option");
            option.value = "Other (Please specify)";
            option.textContent = "Other (Please specify)";
            CITY_SELECT.appendChild(option);
            applySelectedCity(selectedCity);
        }
    }

    // When country changes, load cities
    COUNTRY_FIELD.addEventListener("change", async function () {
        const country = this.value.trim();
        await loadCities(country);
    });

    // When city is selected, show "Other" input if needed
    CITY_SELECT.addEventListener("change", function () {
        showOtherCity(this.value);
    });

    // On form submit, use the "Other" city value if selected
    document.addEventListener("DOMContentLoaded", function () {
        const form = CITY_SELECT.closest("form");
        if (form) {
            const originalSubmit = form.onsubmit;
            form.onsubmit = function (e) {
                // If "Other" is selected, set the City field to the custom input value
                if (CITY_SELECT.value.includes("Other") && OTHER_CITY_INPUT.value) {
                    CITY_SELECT.value = OTHER_CITY_INPUT.value;
                }
                
                if (typeof originalSubmit === "function") {
                    return originalSubmit.call(this, e);
                }
            };
        }
    });

    if (COUNTRY_FIELD.value) {
        loadCities(COUNTRY_FIELD.value.trim(), initialCity);
    }

})();
