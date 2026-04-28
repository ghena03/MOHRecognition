namespace DTOs;

public class MedicineDentistryDto
{
    public int? Med_FullTimeProfessor { get; set; }
    public int? Med_FullTimeAssociateProfessor { get; set; }
    public int? Med_FullTimeAssistantProfessor { get; set; }
    public int? Med_FullTimeLecturerPhd { get; set; }
    public int? Med_FullTimeLecturerMsc { get; set; }
    public int? Med_FullTimeAssistantLecturerMsc { get; set; }
    public int? Med_FullTimeAssistantLecturerPsc { get; set; }
    public int? Med_FullTimePractitionerPsc { get; set; }
    public int? Med_FullTimePractitionerMsc { get; set; }

    public int? Den_FullTimeProfessor { get; set; }
    public int? Den_FullTimeAssociateProfessor { get; set; }
    public int? Den_FullTimeAssistantProfessor { get; set; }
    public int? Den_FullTimeLecturerPhd { get; set; }
    public int? Den_FullTimeLecturerMsc { get; set; }
    public int? Den_FullTimeAssistantLecturerMsc { get; set; }
    public int? Den_FullTimeAssistantLecturerPsc { get; set; }
    public int? Den_FullTimePractitionerPsc { get; set; }
    public int? Den_FullTimePractitionerMsc { get; set; }

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
        (Med_FullTimeAssistantLecturerPsc ?? 0) +
        (Med_FullTimePractitionerPsc ?? 0);

    public int Den_PscHolders =>
        (Den_FullTimeAssistantLecturerPsc ?? 0) +
        (Den_FullTimePractitionerPsc ?? 0);
}
