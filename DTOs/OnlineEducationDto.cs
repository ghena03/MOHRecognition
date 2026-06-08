using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;

namespace MOHRecognition.DTOs
{
    // Stored permanently in RecognitionRequestRecord.OnlineEducationData (JSON column).
    // IFormFile properties are NOT serialized — only the resulting file-name strings are stored.
    public class OnlineEducationDto
    {
        // == APPLICANT ==
        public string? Name      { get; set; }
        public string? Email     { get; set; }
        public string? WorkPlace { get; set; }

        // == PUBLIC INFO (imported snapshot, read-only in form) ==
        public string? InstitutionName          { get; set; }
        public string? OversightRightsEntity    { get; set; }
        public string? FoundationDate           { get; set; }
        public string? DateOfEstablishment      { get; set; }
        public string? ModeOfStudy              { get; set; }
        public string? LanguageOfInstruction    { get; set; }
        public string? StartOfTeaching          { get; set; }
        public string? PresidentName            { get; set; }
        public string? MailingFullAddress       { get; set; }
        public string? DirectPhoneNumber        { get; set; }
        public string? EmailAddress             { get; set; }
        public string? InstitutionalWebAddress  { get; set; }
        public string? Country                  { get; set; }
        public string? Location                 { get; set; }

        // == SELECTED ONLINE PROGRAMS (JSON-serialised list) ==
        // Populated from Bachelor programs in session + Postgraduate levels.
        // Stored as a JSON string to survive the single-form POST.
        public string? ProgramsJson { get; set; }

        // == STUDENTS ==
        public int? TotalOnlineStudents { get; set; }

        // == ACADEMIC STAFF (imported totals + online-specific additions) ==
        public int? Professor              { get; set; }
        public int? AssociateProfessor     { get; set; }
        public int? AssistantProfessor     { get; set; }
        public int? OnlineTrainedStaff     { get; set; }
        public string? TrainingProvider    { get; set; }
        public string? TrainingNotes       { get; set; }
        public string? TrainingEvidenceFileName { get; set; }

        // == LEARNING MANAGEMENT PLATFORM ==
        public string? PlatformName            { get; set; }
        public string? PlatformType            { get; set; }
        public string? PlatformUrl             { get; set; }
        public bool    IsUniversityOwned       { get; set; }
        public bool    SupportsLiveLectures    { get; set; }
        public bool    SupportsRecordedLectures { get; set; }
        public bool    SupportsAssignments     { get; set; }
        public bool    SupportsQuizzes         { get; set; }
        public bool    SupportsOnlineExams     { get; set; }
        public bool    SupportsAttendanceTracking  { get; set; }
        public bool    SupportsProgressTracking    { get; set; }
        public bool    SupportsDiscussionForums    { get; set; }
        public bool    SupportsPlagiarismDetection { get; set; }
        public string? PlatformUsername        { get; set; }
        public string? PlatformEmail           { get; set; }
        public string? PlatformPassword        { get; set; }
        public string? LmsAccessNotes          { get; set; }
        public string? PlatformGuideFileName   { get; set; }

        // == TEACHING AND LEARNING DELIVERY ==
        public int?    SynchronousPercentage       { get; set; }
        public int?    AsynchronousPercentage      { get; set; }
        public string? AttendanceRecordingMethod   { get; set; }
        public string? StudentParticipationMethod  { get; set; }
        public string? InstructorInteractionMethod { get; set; }
        public string? SampleCourseEvidenceFileName { get; set; }
        // Shared evidence PDF for all programs' synchronous ratio (uploaded via AJAX)
        public string? SynchronousEvidenceFileName { get; set; }
        // Communication (kept from original OnlineSystem)
        public string? CommunicationType       { get; set; }
        public string? CommunicationMethodsCsv { get; set; }

        // == ONLINE EXAMINATION AND PROCTORING ==
        public string? ExamType                    { get; set; }
        public string? ExamLocations               { get; set; }
        public bool    IsProctored                 { get; set; }
        public string? ProctoringMethodsCsv        { get; set; }
        public string? IdentityVerificationMethod  { get; set; }
        public string? CheatingPreventionMethod    { get; set; }
        public string? ExamPolicyFileName          { get; set; }
        public string? AssessmentPolicyFileName    { get; set; }

        // == STUDENT SUPPORT SERVICES ==
        public bool    TechnicalSupportAvailable   { get; set; }
        public string? SupportWorkingHours         { get; set; }
        public string? SupportChannelsCsv          { get; set; }
        public bool    OnlineAcademicAdvising       { get; set; }
        public bool    OnlineLibraryAccess          { get; set; }
        public bool    AccessibilitySupport         { get; set; }
        public bool    OnlineOrientation            { get; set; }
        public string? SupportPolicyFileName        { get; set; }

        // == QUALITY ASSURANCE AND MONITORING ==
        public bool    HasOnlineQaPolicy        { get; set; }
        public string? CourseEvaluationMethod   { get; set; }
        public string? StudentSurveyMethod      { get; set; }
        public string? LectureMonitoringMethod  { get; set; }
        public bool    PeriodicProgramReview    { get; set; }
        public string? QaPolicyFileName         { get; set; }
        public string? LatestReviewReportFileName { get; set; }

        // == SECURITY, PRIVACY, AND DATA PROTECTION ==
        public bool    HasPrivacyPolicy                 { get; set; }
        public string? StudentAuthenticationMethod      { get; set; }
        public bool    HasTwoFactorAuthentication       { get; set; }
        public string? PasswordPolicy                   { get; set; }
        public string? BackupPolicy                     { get; set; }
        public string? CybersecurityPolicyFileName      { get; set; }
        public string? PrivacyPolicyFileName            { get; set; }

        // == STUDY DURATION (originally OnlineSystem) ==
        public string? BachelorDuration           { get; set; }
        public string? MasterDuration             { get; set; }
        public string? PhDDuration                { get; set; }
        public string? HigherDiplomaDuration      { get; set; }
        public string? IntermediateDiplomaDuration { get; set; }

        // == ONLINE-SPECIFIC FLAGS ==
        public bool OnlineExamsOfficiallyApproved { get; set; }
        public bool PlatformOfficiallyAdopted     { get; set; }

        // == LEARNING PLATFORM: responsible unit ==
        public string? ResponsibleUnit { get; set; }

        // == ACADEMIC LEVEL STAFF (stored once per level at submission; not repeated per program) ==
        public int BachelorOnlineStaffProf   { get; set; }
        public int BachelorOnlineStaffAssoc  { get; set; }
        public int BachelorOnlineStaffAsst   { get; set; }
        public int PostgraduateOnlineStaffProf   { get; set; }
        public int PostgraduateOnlineStaffAssoc  { get; set; }
        public int PostgraduateOnlineStaffAsst   { get; set; }

        // == READINESS SCORE (0-100) ==
        public int ReadinessScore { get; set; }

        // == FILE UPLOADS — only stored as file-name strings in DB ==
        [JsonIgnore] public IFormFile? ProgramFile             { get; set; }
        public string? ProgramFileName                         { get; set; }

        [JsonIgnore] public IFormFile? TrainingEvidenceFile    { get; set; }
        [JsonIgnore] public IFormFile? PlatformGuideFile       { get; set; }
        [JsonIgnore] public IFormFile? SampleCourseEvidenceFile { get; set; }
        [JsonIgnore] public IFormFile? ExamPolicyFile          { get; set; }
        [JsonIgnore] public IFormFile? AssessmentPolicyFile    { get; set; }
        [JsonIgnore] public IFormFile? SupportPolicyFile       { get; set; }
        [JsonIgnore] public IFormFile? QaPolicyFile            { get; set; }
        [JsonIgnore] public IFormFile? LatestReviewReportFile  { get; set; }
        [JsonIgnore] public IFormFile? CybersecurityPolicyFile { get; set; }
        [JsonIgnore] public IFormFile? PrivacyPolicyFile       { get; set; }
    }

    // One row in the "Programs Delivered Online" section.
    // The list is JSON-serialized into ProgramsJson before form submission.
    public class OnlineProgramDto
    {
        public string  ProgramName             { get; set; } = "";
        public string  DegreeLevel             { get; set; } = "";
        public string  Source                  { get; set; } = "";
        public string  CollegeOrFaculty        { get; set; } = "";
        public string  DeliveryMode            { get; set; } = "Totally Distance";
        public int?    OnlineStudents          { get; set; }
        public int?    OnlineDurationYears     { get; set; }
        public int?    TraditionalDurationYears { get; set; }
        public int?    Professor               { get; set; }
        public int?    AssociateProfessor      { get; set; }
        public int?    AssistantProfessor      { get; set; }
        public string? StudyPlanFileName       { get; set; }
        public string? AccreditationEvidenceFileName { get; set; }
        /* Synchronous learning ratio (per-program) */
        public int?     TotalContactHours            { get; set; }
        public int?     SynchronousHours             { get; set; }
        public decimal? SynchronousRatioPercent      { get; set; }
    }
}
