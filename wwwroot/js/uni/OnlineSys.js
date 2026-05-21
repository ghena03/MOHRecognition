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