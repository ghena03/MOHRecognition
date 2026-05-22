using DTOs;

namespace MOHRecognition.Services
{
    public class InMemoryRecognitionRequestService : IRecognitionRequestService
    {
        private static readonly List<RecognitionRequestRecord> _requests = new();
        private static int _nextId = 1;
        private static readonly object _lock = new();

        public IReadOnlyList<RecognitionRequestRecord> GetAll()
        {
            lock (_lock)
            {
                return _requests
                    .OrderByDescending(x => x.SubmittedAt)
                    .ToList();
            }
        }

        public RecognitionRequestRecord? GetById(int id)
        {
            lock (_lock)
            {
                return _requests.FirstOrDefault(x => x.Id == id);
            }
        }

        public RecognitionRequestRecord Add(RecognitionRequestRecord request)
        {
            lock (_lock)
            {
                request.Id = _nextId++;

                if (string.IsNullOrWhiteSpace(request.ReferenceNumber))
                    request.ReferenceNumber = $"REQ-{DateTime.Now:yyyy}-{request.Id:D4}";

                if (request.SubmittedAt == default)
                    request.SubmittedAt = DateTime.Now;

                if (request.Year <= 0)
                    request.Year = request.SubmittedAt.Year;

                request.AssignedMember = NormalizeAssignedMember(request.AssignedMember);
                request.Status = NormalizeStatusForAssignment(request.Status, request.AssignedMember);

                _requests.Add(request);
                return request;
            }
        }

        public bool RequireAdminReview(int id, string submittedBy)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.Status = "Requires Admin Review";
                req.SubmittedToAdminBy = NormalizeAssignedMember(submittedBy);
                req.SubmittedToAdminAt = DateTime.Now;
                return true;
            }
        }

        public bool RequestMemberAssignment(int id, string memberEmail)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                if (!string.Equals(req.AssignedMember, "Unassigned", StringComparison.OrdinalIgnoreCase))
                    return false;

                var normalizedMember = NormalizeAssignedMember(memberEmail);
                if (string.Equals(normalizedMember, "Unassigned", StringComparison.OrdinalIgnoreCase))
                    return false;

                req.AssignmentRequestBy = normalizedMember;
                req.AssignmentRequestAt = DateTime.Now;
                req.Status = "Assignment Requested";
                return true;
            }
        }

        public bool SaveInfrastructureNotes(
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
            string libraryAssessmentNote)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.FacultiesAssessment = NormalizeAssessmentStatus(facultiesAssessment);
                req.HospitalsAssessment = NormalizeAssessmentStatus(hospitalsAssessment);
                req.HospitalEnvironmentAssessment = NormalizeAssessmentStatus(hospitalEnvironmentAssessment);
                req.LaboratoriesFacilitiesAssessment = NormalizeAssessmentStatus(laboratoriesFacilitiesAssessment);
                req.LibraryAssessment = NormalizeAssessmentStatus(libraryAssessment);

                req.FacultiesAssessmentNote = NormalizeAssessmentNote(req.FacultiesAssessment, facultiesAssessmentNote);
                req.HospitalsAssessmentNote = NormalizeAssessmentNote(req.HospitalsAssessment, hospitalsAssessmentNote);
                req.HospitalEnvironmentAssessmentNote = NormalizeAssessmentNote(req.HospitalEnvironmentAssessment, hospitalEnvironmentAssessmentNote);
                req.LaboratoriesFacilitiesAssessmentNote = NormalizeAssessmentNote(req.LaboratoriesFacilitiesAssessment, laboratoriesFacilitiesAssessmentNote);
                req.LibraryAssessmentNote = NormalizeAssessmentNote(req.LibraryAssessment, libraryAssessmentNote);
                return true;
            }
        }

        public bool SaveAdmissionStudyDurationReview(int id, AdmissionStudyDurationReviewDto review)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.AdmissionStudyDurationReview = review ?? new AdmissionStudyDurationReviewDto();
                return true;
            }
        }

        public bool SaveGlobalRankings(int id, GlobalRankingsDto rankings)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.GlobalRankings = rankings ?? new GlobalRankingsDto();
                return true;
            }
        }

        public bool SaveBasicInfoAssessment(int id, string decision, string reason, string accreditationStatus, string accreditationNote)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.BasicInfoAssessmentDecision = (decision ?? string.Empty).Trim();
                req.BasicInfoAssessmentReason = (reason ?? string.Empty).Trim();
                req.AccreditationStatus = (accreditationStatus ?? string.Empty).Trim();
                req.AccreditationNote = (accreditationNote ?? string.Empty).Trim();
                return true;
            }
        }

        public bool UpdateStatus(int id, string status)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;
                req.Status = status;
                return true;
            }
        }

        public bool SavePublicInfoSection(int id, PublicInfoDto publicInfo, AcademicInfoDto academicInfoPatch, string city, string country)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.PublicInfo = publicInfo ?? new PublicInfoDto();
                req.City = (city ?? string.Empty).Trim();
                req.Country = (country ?? string.Empty).Trim();
                req.UniversityName = (publicInfo?.InstitutionName ?? req.UniversityName ?? string.Empty).Trim();

                if (academicInfoPatch != null)
                {
                    req.AcademicInfo.TypeOfAcademicInstitution = academicInfoPatch.TypeOfAcademicInstitution;
                    req.AcademicInfo.TypeOfAcademicInstitutionOther = academicInfoPatch.TypeOfAcademicInstitutionOther;
                    req.AcademicInfo.DegreeDiploma = academicInfoPatch.DegreeDiploma;
                    req.AcademicInfo.DegreeBSC = academicInfoPatch.DegreeBSC;
                    req.AcademicInfo.DegreeHigherDiploma = academicInfoPatch.DegreeHigherDiploma;
                    req.AcademicInfo.DegreeMaster = academicInfoPatch.DegreeMaster;
                    req.AcademicInfo.DegreePhD = academicInfoPatch.DegreePhD;
                    req.AcademicInfo.SystemYearlyProgram = academicInfoPatch.SystemYearlyProgram;
                    req.AcademicInfo.SystemSemesterProgram = academicInfoPatch.SystemSemesterProgram;
                    req.AcademicInfo.SystemCreditHours = academicInfoPatch.SystemCreditHours;
                    req.AcademicInfo.SystemECTS = academicInfoPatch.SystemECTS;
                    req.AcademicInfo.CollegeCategoriesCsv = academicInfoPatch.CollegeCategoriesCsv;
                    req.AcademicInfo.CollegesCount = academicInfoPatch.CollegesCount;
                    req.AcademicInfo.CollegesNames = academicInfoPatch.CollegesNames;
                    req.AcademicInfo.OfficialRecognitionInHomeCountry = academicInfoPatch.OfficialRecognitionInHomeCountry;
                    req.AcademicInfo.OfficialAccreditationQualityInHomeCountry = academicInfoPatch.OfficialAccreditationQualityInHomeCountry;
                    req.AcademicInfo.LanguageForDomesticStudents = academicInfoPatch.LanguageForDomesticStudents;
                    req.AcademicInfo.LanguageForForeignStudents = academicInfoPatch.LanguageForForeignStudents;
                }

                return true;
            }
        }

        public bool SaveAcademicStaffSection(int id, AcademicInfoDto staffData)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null || staffData == null) return false;

                req.AcademicInfo.StaffProfessorFullTimeCount = staffData.StaffProfessorFullTimeCount;
                req.AcademicInfo.StaffProfessorPartTimeCount = staffData.StaffProfessorPartTimeCount;
                req.AcademicInfo.StaffAssociateProfessorFullTimeCount = staffData.StaffAssociateProfessorFullTimeCount;
                req.AcademicInfo.StaffAssociateProfessorPartTimeCount = staffData.StaffAssociateProfessorPartTimeCount;
                req.AcademicInfo.StaffAssistantProfessorFullTimeCount = staffData.StaffAssistantProfessorFullTimeCount;
                req.AcademicInfo.StaffAssistantProfessorPartTimeCount = staffData.StaffAssistantProfessorPartTimeCount;
                req.AcademicInfo.StaffResearcherFullTimeCount = staffData.StaffResearcherFullTimeCount;
                req.AcademicInfo.StaffResearcherPartTimeCount = staffData.StaffResearcherPartTimeCount;
                req.AcademicInfo.StaffTeacherFullTimeCount = staffData.StaffTeacherFullTimeCount;
                req.AcademicInfo.StaffTeacherPartTimeCount = staffData.StaffTeacherPartTimeCount;
                req.AcademicInfo.StaffAssistantTeacherFullTimeCount = staffData.StaffAssistantTeacherFullTimeCount;
                req.AcademicInfo.StaffAssistantTeacherPartTimeCount = staffData.StaffAssistantTeacherPartTimeCount;
                req.AcademicInfo.StaffOthersFullTimeCount = staffData.StaffOthersFullTimeCount;
                req.AcademicInfo.StaffOthersPartTimeCount = staffData.StaffOthersPartTimeCount;
                req.AcademicInfo.StaffPractitionerPscFullTimeCount = staffData.StaffPractitionerPscFullTimeCount;
                req.AcademicInfo.StaffPractitionerPscPartTimeCount = staffData.StaffPractitionerPscPartTimeCount;
                req.AcademicInfo.StaffPractitionerMscFullTimeCount = staffData.StaffPractitionerMscFullTimeCount;
                req.AcademicInfo.StaffPractitionerMscPartTimeCount = staffData.StaffPractitionerMscPartTimeCount;
                req.AcademicInfo.TotalStudentPopulation = staffData.TotalStudentPopulation;
                req.AcademicInfo.LocalStudentPopulation = staffData.LocalStudentPopulation;
                req.AcademicInfo.ForeignStudentPopulation = staffData.ForeignStudentPopulation;
                req.AcademicInfo.JordanianStudentPopulation = staffData.JordanianStudentPopulation;
                req.AcademicInfo.StudentsToFacultyRatio = staffData.StudentsToFacultyRatio;
                req.AcademicInfo.DoctorateHoldersPercentage = staffData.DoctorateHoldersPercentage;

                return true;
            }
        }

        public bool SaveStudyDurationSection(int id, StudyDurationDto studyDuration)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;
                req.StudyDuration = studyDuration ?? new StudyDurationDto();
                return true;
            }
        }

        public bool SetManualDataFilled(int id)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;
                req.ManualDataFilled = true;
                return true;
            }
        }

        public bool UpdateManualRequestData(int id, Action<RecognitionRequestRecord> updater)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;
                updater(req);
                return true;
            }
        }

        public bool AssignMember(int id, string memberName)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.AssignedMember = NormalizeAssignedMember(memberName);
                req.Status = NormalizeStatusForAssignment(req.Status, req.AssignedMember);
                req.AssignmentRequestBy = string.Empty;
                req.AssignmentRequestAt = null;

                return true;
            }
        }

        private static string NormalizeAssignedMember(string? memberName)
        {
            var value = (memberName ?? "").Trim();

            if (string.IsNullOrWhiteSpace(value) ||
                value.Equals("unassigned", StringComparison.OrdinalIgnoreCase))
                return "Unassigned";

            return value;
        }

        private static string NormalizeStatusForAssignment(string? currentStatus, string assignedMember)
        {
            if (assignedMember == "Unassigned")
                return "Pending";

            if (string.Equals(currentStatus, "Requires Admin Review", StringComparison.OrdinalIgnoreCase))
                return "Requires Admin Review";

            return "Assigned";
        }

        private static string NormalizeAssessmentStatus(string? value)
        {
            var normalized = (value ?? string.Empty).Trim();

            return normalized switch
            {
                "Meets Standards" => "Meets Standards",
                "Needs Improvement" => "Needs Improvement",
                _ => string.Empty
            };
        }

        private static string NormalizeAssessmentNote(string assessmentStatus, string? note)
        {
            if (!string.Equals(assessmentStatus, "Needs Improvement", StringComparison.Ordinal))
                return string.Empty;

            return (note ?? string.Empty).Trim();
        }
    }
}
