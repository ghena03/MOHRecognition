using DTOs;

namespace MOHRecognition.Services
{
    public interface IRecognitionRequestService
    {
        Task<IReadOnlyList<RecognitionRequestRecord>> GetAll();
        Task<RecognitionRequestRecord?> GetById(int id);
        Task<RecognitionRequestRecord> Add(RecognitionRequestRecord request);

        Task<bool> RequireAdminReview(int id, string submittedBy);
        Task<bool> AssignMember(int id, string memberName);
        Task<bool> SaveInfrastructureNotes(
            int id,
            string facultiesAssessment,
            string hospitalsAssessment,
            string hospitalEnvironmentAssessment,
            string laboratoriesFacilitiesAssessment,
            string libraryAssessment,
            string facultiesAssessmentNote,
            string hospitalsAssessmentNote,
            string hospitalEnvironmentAssessmentNote,
            string laboratoriesFacilitiesAssessmentNote,
            string libraryAssessmentNote);
        Task<bool> SaveAdmissionStudyDurationReview(int id, AdmissionStudyDurationReviewDto review);
        Task<bool> SaveGlobalRankings(int id, GlobalRankingsDto rankings);
        Task<bool> SaveBasicInfoAssessment(int id, string decision, string reason, string accreditationStatus, string accreditationNote);
        Task<bool> UpdateStatus(int id, string status);
        Task<bool> SavePublicInfoSection(int id, PublicInfoDto publicInfo, AcademicInfoDto academicInfoPatch, string city, string country);
        Task<bool> SaveAcademicStaffSection(int id, AcademicInfoDto staffData);
        Task<bool> SaveStudyDurationSection(int id, StudyDurationDto studyDuration);
        Task<bool> SetManualDataFilled(int id);
        Task<bool> UpdateManualRequestData(int id, Action<RecognitionRequestRecord> updater);
    }

    public class RecognitionRequestRecord
    {
        public int Id { get; set; }
        public string InstitutionType { get; set; } = "";

        public string ReferenceNumber { get; set; } = string.Empty;

        public string RecognitionNumber { get; set; } = string.Empty;

        public string UniversityName { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string UniversityEmail { get; set; } = string.Empty;

        public string ApplicantName { get; set; } = string.Empty;

        public string WorkPlace { get; set; } = string.Empty;

        public string ApplicantEmail { get; set; } = string.Empty;

        public string AssignedMember { get; set; } = "Unassigned";

        public string Status { get; set; } = "Pending";

        public string SubmittedToAdminBy { get; set; } = string.Empty;

        public DateTime? SubmittedToAdminAt { get; set; }

        public int Year { get; set; }

        public DateTime SubmittedAt { get; set; }

        public PublicInfoDto PublicInfo { get; set; } = new();

        public AcademicInfoDto AcademicInfo { get; set; } = new();

        public SubmitApplicationDto SubmitApplication { get; set; } = new();

        public List<FacultyRowDto> Faculties { get; set; } = new();

        public List<ProgramRowDto> Programs { get; set; } = new();

        public List<ProgramHoursRowDto> ProgramHours { get; set; } = new();

        public List<StudyPlanComplianceRowDto> StudyPlanComplianceRows { get; set; } = new();

        public List<AccreditationBodyRowDto> AccreditationBodies { get; set; } = new();

        public AdmissionRequirementsDto AdmissionRequirements { get; set; } = new();

        public StudyDurationDto StudyDuration { get; set; } = new();

        public MedicineDentistryDto MedicineDentistry { get; set; } = new();

        public AdmissionStudyDurationReviewDto AdmissionStudyDurationReview { get; set; } = new();

        public GlobalRankingsDto GlobalRankings { get; set; } = new();

        public AttachmentDto Attachments { get; set; } = new();

        public PicturesDto Pictures { get; set; } = new();

        public LaboratoriesDto Laboratories { get; set; } = new();

        public InfrastructureDto Infrastructure { get; set; } = new();
        public HospitalsDto Hospitals { get; set; } = new();
        public LibraryDto Library { get; set; } = new();
        public UniRecAccDto UniRecAcc { get; set; } = new();
        public string AdditionalNote { get; set; } = "";
        public List<AdditionalFileDto> AdditionalFiles { get; set; } = new();

        public string FacultiesAssessment { get; set; } = string.Empty;

        public string FacultiesAssessmentNote { get; set; } = string.Empty;

        public string HospitalsAssessment { get; set; } = string.Empty;

        public string HospitalsAssessmentNote { get; set; } = string.Empty;

        public string HospitalEnvironmentAssessment { get; set; } = string.Empty;

        public string HospitalEnvironmentAssessmentNote { get; set; } = string.Empty;

        public string LaboratoriesFacilitiesAssessment { get; set; } = string.Empty;

        public string LaboratoriesFacilitiesAssessmentNote { get; set; } = string.Empty;

        public string LibraryAssessment { get; set; } = string.Empty;

        public string LibraryAssessmentNote { get; set; } = string.Empty;

        public string BasicInfoAssessmentDecision { get; set; } = string.Empty;

        public string BasicInfoAssessmentReason { get; set; } = string.Empty;

        public string AccreditationStatus { get; set; } = string.Empty;

        public string AccreditationNote { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;

        public string RecognitionType { get; set; } = string.Empty;

        public bool IsManual { get; set; } = false;
        public bool ManualDataFilled { get; set; } = false;

        // "Bachelor" | "Postgraduate" | "Online"
        public string ApplicationType { get; set; } = "Bachelor";
    }
}
