namespace DTOs;

public class MedicineDentistryDto
{
    // ── Full-Time Academic Staff (Medicine) ──────────────────────────────
    public int? Med_FullTimeProfessor { get; set; }
    public int? Med_FullTimeAssociateProfessor { get; set; }
    public int? Med_FullTimeAssistantProfessor { get; set; }
    public int? Med_FullTimeLecturerPhd { get; set; }
    public int? Med_FullTimeLecturerMsc { get; set; }
    public int? Med_FullTimeAssistantLecturerMsc { get; set; }
    public int? Med_FullTimeAssistantLecturerPhd { get; set; }
    public int? Med_FullTimePractitionerPsc { get; set; }
    public int? Med_FullTimePractitionerMsc { get; set; }

    // ── Full-Time Academic Staff (Dentistry) ─────────────────────────────
    public int? Den_FullTimeProfessor { get; set; }
    public int? Den_FullTimeAssociateProfessor { get; set; }
    public int? Den_FullTimeAssistantProfessor { get; set; }
    public int? Den_FullTimeLecturerPhd { get; set; }
    public int? Den_FullTimeLecturerMsc { get; set; }
    public int? Den_FullTimeAssistantLecturerMsc { get; set; }
    public int? Den_FullTimeAssistantLecturerPhd { get; set; }
    public int? Den_FullTimePractitionerPsc { get; set; }
    public int? Den_FullTimePractitionerMsc { get; set; }

    // ── Part-Time Clinical Staff (Medicine) ──────────────────────────────
    public int? Med_PartTimeClinicalProfessor { get; set; }
    public int? Med_PartTimeClinicalAssociateProfessor { get; set; }
    public int? Med_PartTimeClinicalAssistantProfessor { get; set; }
    public int? Med_PartTimeClinicalLecturerPhd { get; set; }
    public int? Med_PartTimeClinicalAssistantLecturerPhd { get; set; }
    public int? Med_PartTimeClinicalLecturerMsc { get; set; }
    public int? Med_PartTimeClinicalAssistantLecturerMsc { get; set; }
    public int? Med_PartTimeClinicalPractitionerPsc { get; set; }
    public int? Med_PartTimeClinicalPractitionerMsc { get; set; }

    // ── Part-Time Clinical Staff (Dentistry) ─────────────────────────────
    public int? Den_PartTimeClinicalProfessor { get; set; }
    public int? Den_PartTimeClinicalAssociateProfessor { get; set; }
    public int? Den_PartTimeClinicalAssistantProfessor { get; set; }
    public int? Den_PartTimeClinicalLecturerPhd { get; set; }
    public int? Den_PartTimeClinicalAssistantLecturerPhd { get; set; }
    public int? Den_PartTimeClinicalLecturerMsc { get; set; }
    public int? Den_PartTimeClinicalAssistantLecturerMsc { get; set; }
    public int? Den_PartTimeClinicalPractitionerPsc { get; set; }
    public int? Den_PartTimeClinicalPractitionerMsc { get; set; }

    // ── Total Students ────────────────────────────────────────────────────
    public int? Med_TotalStudents { get; set; }
    public int? Den_TotalStudents { get; set; }

    // ── Computed: Part-Time Totals ────────────────────────────────────────
    public int Med_TotalPartTime =>
        (Med_PartTimeClinicalProfessor ?? 0) +
        (Med_PartTimeClinicalAssociateProfessor ?? 0) +
        (Med_PartTimeClinicalAssistantProfessor ?? 0) +
        (Med_PartTimeClinicalLecturerPhd ?? 0) +
        (Med_PartTimeClinicalAssistantLecturerPhd ?? 0) +
        (Med_PartTimeClinicalLecturerMsc ?? 0) +
        (Med_PartTimeClinicalAssistantLecturerMsc ?? 0) +
        (Med_PartTimeClinicalPractitionerPsc ?? 0) +
        (Med_PartTimeClinicalPractitionerMsc ?? 0);

    public int Den_TotalPartTime =>
        (Den_PartTimeClinicalProfessor ?? 0) +
        (Den_PartTimeClinicalAssociateProfessor ?? 0) +
        (Den_PartTimeClinicalAssistantProfessor ?? 0) +
        (Den_PartTimeClinicalLecturerPhd ?? 0) +
        (Den_PartTimeClinicalAssistantLecturerPhd ?? 0) +
        (Den_PartTimeClinicalLecturerMsc ?? 0) +
        (Den_PartTimeClinicalAssistantLecturerMsc ?? 0) +
        (Den_PartTimeClinicalPractitionerPsc ?? 0) +
        (Den_PartTimeClinicalPractitionerMsc ?? 0);

    // ── Computed: Part-Time by Degree Level ──────────────────────────────
    public int Med_PartTimePhdHolders =>
        (Med_PartTimeClinicalProfessor ?? 0) +
        (Med_PartTimeClinicalAssociateProfessor ?? 0) +
        (Med_PartTimeClinicalAssistantProfessor ?? 0) +
        (Med_PartTimeClinicalLecturerPhd ?? 0) +
        (Med_PartTimeClinicalAssistantLecturerPhd ?? 0);

    public int Den_PartTimePhdHolders =>
        (Den_PartTimeClinicalProfessor ?? 0) +
        (Den_PartTimeClinicalAssociateProfessor ?? 0) +
        (Den_PartTimeClinicalAssistantProfessor ?? 0) +
        (Den_PartTimeClinicalLecturerPhd ?? 0) +
        (Den_PartTimeClinicalAssistantLecturerPhd ?? 0);

    public int Med_PartTimeMscHolders =>
        (Med_PartTimeClinicalLecturerMsc ?? 0) +
        (Med_PartTimeClinicalAssistantLecturerMsc ?? 0) +
        (Med_PartTimeClinicalPractitionerMsc ?? 0);

    public int Den_PartTimeMscHolders =>
        (Den_PartTimeClinicalLecturerMsc ?? 0) +
        (Den_PartTimeClinicalAssistantLecturerMsc ?? 0) +
        (Den_PartTimeClinicalPractitionerMsc ?? 0);

    public int Med_PartTimePscHolders => Med_PartTimeClinicalPractitionerPsc ?? 0;
    public int Den_PartTimePscHolders => Den_PartTimeClinicalPractitionerPsc ?? 0;

    // ── Computed: Legacy summaries ────────────────────────────────────────
    public int Med_PhdHolders =>
        (Med_FullTimeProfessor ?? 0) +
        (Med_FullTimeAssociateProfessor ?? 0) +
        (Med_FullTimeAssistantProfessor ?? 0) +
        (Med_FullTimeLecturerPhd ?? 0);

    public int Den_PhdHolders =>
        (Den_FullTimeProfessor ?? 0) +
        (Den_FullTimeAssociateProfessor ?? 0) +
        (Den_FullTimeAssistantProfessor ?? 0) +
        (Den_FullTimeLecturerPhd ?? 0);

    public int Med_MscHolders =>
        (Med_FullTimeLecturerMsc ?? 0) +
        (Med_FullTimeAssistantLecturerMsc ?? 0) +
        (Med_FullTimePractitionerMsc ?? 0);

    public int Den_MscHolders =>
        (Den_FullTimeLecturerMsc ?? 0) +
        (Den_FullTimeAssistantLecturerMsc ?? 0) +
        (Den_FullTimePractitionerMsc ?? 0);

    public int Med_PscHolders =>
        (Med_FullTimePractitionerPsc ?? 0);

    public int Den_PscHolders =>
        (Den_FullTimePractitionerPsc ?? 0);

    // ── Computed: Full-Time Clinical PhD (Prof + AssocProf + AssistProf + LecPhD + AssistLecPhD) ──
    public int Med_FullTimeClinicalPhD =>
        (Med_FullTimeProfessor ?? 0) +
        (Med_FullTimeAssociateProfessor ?? 0) +
        (Med_FullTimeAssistantProfessor ?? 0) +
        (Med_FullTimeLecturerPhd ?? 0) +
        (Med_FullTimeAssistantLecturerPhd ?? 0);

    public int Den_FullTimeClinicalPhD =>
        (Den_FullTimeProfessor ?? 0) +
        (Den_FullTimeAssociateProfessor ?? 0) +
        (Den_FullTimeAssistantProfessor ?? 0) +
        (Den_FullTimeLecturerPhd ?? 0) +
        (Den_FullTimeAssistantLecturerPhd ?? 0);

    // ── Computed: Actual Part-Time Clinical (PhD only) ────────────────────
    public int Med_ActualPartTimeClinical =>
        (Med_PartTimeClinicalProfessor ?? 0) +
        (Med_PartTimeClinicalAssociateProfessor ?? 0) +
        (Med_PartTimeClinicalAssistantProfessor ?? 0) +
        (Med_PartTimeClinicalLecturerPhd ?? 0) +
        (Med_PartTimeClinicalAssistantLecturerPhd ?? 0);

    public int Den_ActualPartTimeClinical =>
        (Den_PartTimeClinicalProfessor ?? 0) +
        (Den_PartTimeClinicalAssociateProfessor ?? 0) +
        (Den_PartTimeClinicalAssistantProfessor ?? 0) +
        (Den_PartTimeClinicalLecturerPhd ?? 0) +
        (Den_PartTimeClinicalAssistantLecturerPhd ?? 0);

    // ── Computed: Allowed / Counted Part-Time and Ratio ───────────────────
    private static double ComputeAllowedPartTime(int ftPhD)
    {
        if (ftPhD < 50)   return ftPhD * 0.25;
        if (ftPhD <= 100) return (50 * 0.25) + ((ftPhD - 50) * 0.35);
        return (50 * 0.25) + (50 * 0.35) + ((ftPhD - 100) * 0.50);
    }

    public double Med_AllowedPartTimeClinical => ComputeAllowedPartTime(Med_FullTimeClinicalPhD);
    public double Den_AllowedPartTimeClinical => ComputeAllowedPartTime(Den_FullTimeClinicalPhD);

    public double Med_CountedPartTimeClinical => Math.Min(Med_ActualPartTimeClinical, Med_AllowedPartTimeClinical);
    public double Den_CountedPartTimeClinical => Math.Min(Den_ActualPartTimeClinical, Den_AllowedPartTimeClinical);

    public double Med_CountedClinicalStaff => Med_FullTimeClinicalPhD + Med_CountedPartTimeClinical;
    public double Den_CountedClinicalStaff => Den_FullTimeClinicalPhD + Den_CountedPartTimeClinical;

    public double? Med_StudentFacultyRatio =>
        Med_TotalStudents.HasValue && Med_CountedClinicalStaff > 0
            ? (double?)(Med_TotalStudents.Value / Med_CountedClinicalStaff)
            : null;

    public double? Den_StudentFacultyRatio =>
        Den_TotalStudents.HasValue && Den_CountedClinicalStaff > 0
            ? (double?)(Den_TotalStudents.Value / Den_CountedClinicalStaff)
            : null;
}
