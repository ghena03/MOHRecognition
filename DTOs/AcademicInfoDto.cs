using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class AcademicInfoDto
{
    // =============================================
    // Curriculum & Delivery (Advanced Academic Info)
    // =============================================
    public string ProgramObjectivesJson { get; set; } = "[]";
    public string LearningOutcomesJson { get; set; } = "[]";

    public string TeachingMethodsCsv { get; set; } = "";
    public string TeachingMethodsOther { get; set; } = "";

    public string AssessmentMethodsCsv { get; set; } = "";
    public string AssessmentMethodsOther { get; set; } = "";

    public string UsesELearning { get; set; } = ""; // Yes / No
    public string DeliveryType { get; set; } = "";
    public int? ELearningPercentage { get; set; }
    public int? BlendedLearningPercentage { get; set; }

    public string PlatformsCsv { get; set; } = "";
    public string OtherPlatform { get; set; } = "";

    public string EAssessmentUsed { get; set; } = ""; // Yes / No
    public string EAssessmentMethodsCsv { get; set; } = "";

    // Type of Academic Institution (dropdown: Governmental / Regional / International / Others)
    public string TypeOfAcademicInstitution { get; set; } = "";
    public string TypeOfAcademicInstitutionOther { get; set; } = "";

    // Degrees in institution (checkboxes)
    public bool DegreeDiploma { get; set; }
    public bool DegreeBSC { get; set; }
    public bool DegreeHigherDiploma { get; set; }
    public bool DegreeMaster { get; set; }
    public bool DegreePhD { get; set; }

    // Official recognition (dropdown)
    public string OfficialRecognitionInHomeCountry { get; set; } = ""; // Yes/No/Choose

    // Official accreditation & quality assurance (dropdown)
    public string OfficialAccreditationQualityInHomeCountry { get; set; } = ""; // Yes/No/Choose

    // Language of instruction (two fields shown: domestic + foreign)
    public string LanguageForDomesticStudents { get; set; } = "";
    public string LanguageForForeignStudents { get; set; } = "";

    // Foreign students offered programs in joint classrooms with locals (dropdown)
    public string ForeignStudentsJointClassroomsWithLocal { get; set; } = ""; // Yes/No/Choose

    // Overall student population (4 fields shown)
    public int? LocalStudentPopulation { get; set; }
    public int? ForeignStudentPopulation { get; set; }
    public int? JordanianStudentPopulation { get; set; }
    public int? TotalStudentPopulation { get; set; }

    // Academic Staff Head Count Per Academic Rank (manual inputs)
    public int? StaffProfessorFullTimeCount { get; set; }
    public int? StaffProfessorPartTimeCount { get; set; }
    public int? StaffAssociateProfessorFullTimeCount { get; set; }
    public int? StaffAssociateProfessorPartTimeCount { get; set; }
    public int? StaffAssistantProfessorFullTimeCount { get; set; }
    public int? StaffAssistantProfessorPartTimeCount { get; set; }
    public int? StaffResearcherFullTimeCount { get; set; }
    public int? StaffResearcherPartTimeCount { get; set; }
    public int? StaffTeacherFullTimeCount { get; set; }
    public int? StaffTeacherPartTimeCount { get; set; }
    public int? StaffAssistantTeacherFullTimeCount { get; set; }
    public int? StaffAssistantTeacherPartTimeCount { get; set; }
    public int? StaffOthersFullTimeCount { get; set; }
    public int? StaffOthersPartTimeCount { get; set; }
    public int? StaffPractitionerPscFullTimeCount { get; set; }
    public int? StaffPractitionerPscPartTimeCount { get; set; }
    public int? StaffPractitionerMscFullTimeCount { get; set; }
    public int? StaffPractitionerMscPartTimeCount { get; set; }

    // Per-rank Excel supporting files (stored separately per rank and status)
    public string ProfessorFullTimeExcelFile { get; set; } = "";
    public string ProfessorFullTimeExcelFileName { get; set; } = "";
    public string ProfessorPartTimeExcelFile { get; set; } = "";
    public string ProfessorPartTimeExcelFileName { get; set; } = "";

    public string AssociateProfessorFullTimeExcelFile { get; set; } = "";
    public string AssociateProfessorFullTimeExcelFileName { get; set; } = "";
    public string AssociateProfessorPartTimeExcelFile { get; set; } = "";
    public string AssociateProfessorPartTimeExcelFileName { get; set; } = "";

    public string AssistantProfessorFullTimeExcelFile { get; set; } = "";
    public string AssistantProfessorFullTimeExcelFileName { get; set; } = "";
    public string AssistantProfessorPartTimeExcelFile { get; set; } = "";
    public string AssistantProfessorPartTimeExcelFileName { get; set; } = "";

    public string ResearcherFullTimeExcelFile { get; set; } = "";
    public string ResearcherFullTimeExcelFileName { get; set; } = "";
    public string ResearcherPartTimeExcelFile { get; set; } = "";
    public string ResearcherPartTimeExcelFileName { get; set; } = "";

    public string TeacherFullTimeExcelFile { get; set; } = "";
    public string TeacherFullTimeExcelFileName { get; set; } = "";
    public string TeacherPartTimeExcelFile { get; set; } = "";
    public string TeacherPartTimeExcelFileName { get; set; } = "";

    public string AssistantTeacherFullTimeExcelFile { get; set; } = "";
    public string AssistantTeacherFullTimeExcelFileName { get; set; } = "";
    public string AssistantTeacherPartTimeExcelFile { get; set; } = "";
    public string AssistantTeacherPartTimeExcelFileName { get; set; } = "";

    public string OthersFullTimeExcelFile { get; set; } = "";
    public string OthersFullTimeExcelFileName { get; set; } = "";
    public string OthersPartTimeExcelFile { get; set; } = "";
    public string OthersPartTimeExcelFileName { get; set; } = "";

    public string PractitionerPscFullTimeExcelFile { get; set; } = "";
    public string PractitionerPscFullTimeExcelFileName { get; set; } = "";
    public string PractitionerPscPartTimeExcelFile { get; set; } = "";
    public string PractitionerPscPartTimeExcelFileName { get; set; } = "";

    public string PractitionerMscFullTimeExcelFile { get; set; } = "";
    public string PractitionerMscFullTimeExcelFileName { get; set; } = "";
    public string PractitionerMscPartTimeExcelFile { get; set; } = "";
    public string PractitionerMscPartTimeExcelFileName { get; set; } = "";

    // Legacy aggregate fields retained for backward compatibility
    public int? StaffProfessor { get; set; }
    public int? StaffAssociateProfessor { get; set; }
    public int? StaffAssistantProfessor { get; set; }
    public int? StaffResearcher { get; set; }
    public int? StaffTeacher { get; set; }
    public int? StaffAssistantTeacher { get; set; }
    public int? StaffOthers { get; set; }
    public int? StaffPractitionerPsc { get; set; }
    public int? StaffPractitionerMsc { get; set; }

    // Full-time / Part-time faculty summary
    public int? FullTimeFacultyCount { get; set; }
    public int? PartTimeFacultyCount { get; set; }
    public string FullTimeFacultyFileName { get; set; } = "";
    public string FullTimeFacultyFileContentBase64 { get; set; } = "";
    public string PartTimeFacultyFileName { get; set; } = "";
    public string PartTimeFacultyFileContentBase64 { get; set; } = "";

    // Ratios / percentages (manual inputs)
    public int? DoctorateHoldersPercentage { get; set; }
    public int? AssociateProfessorPercentage { get; set; }
    public decimal? StudentsToFacultyRatio { get; set; }

    // Colleges and accreditation
    public int? CollegesCount { get; set; }
    public string CollegesNames { get; set; } = "";
    public string AccreditationBodies { get; set; } = "";
    public string AccreditationBodiesType { get; set; } = "";

    // College categories (csv)
    public string CollegeCategoriesCsv { get; set; } = "";

    public string IntakeCapacityNotes { get; set; } = "";

    // Educational System in Effect (checkboxes)
    public bool SystemYearlyProgram { get; set; }
    public bool SystemSemesterProgram { get; set; }
    public bool SystemCreditHours { get; set; }
    public bool SystemECTS { get; set; }

    // Research Activities By Faculty
    public int? ResearchItemsScopus { get; set; }
    public int? ResearchItemsOtherSearchEngines { get; set; }

    // Foreign graduates (medicine/dentistry/pharmacy) allowed to practice (dropdown)
    public string ForeignGraduatesAllowedToPractice { get; set; } = ""; // Yes/No/Choose

    // Class attendance enforced (dropdown) + mention exceptions (text)
    public string EnforceClassAttendance { get; set; } = ""; // Yes/No/Choose
    public string MentionExceptions { get; set; } = "";


}
