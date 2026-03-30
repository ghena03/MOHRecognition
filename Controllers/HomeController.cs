using ClosedXML.Excel;
using DTOs;
using Microsoft.AspNetCore.Mvc;
using MOHRecognition.DTOs;
using MOHRecognition.Models;
using MOHRecognition.Services;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
namespace MOHRecognition.Controllers
{
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _env;
        private readonly IRecognitionRequestService _recognitionRequestService;

        public HomeController(IWebHostEnvironment env, IRecognitionRequestService recognitionRequestService)
        {
            _env = env;
            _recognitionRequestService = recognitionRequestService;
        }
        public IActionResult Index()
        {
            return View("~/Views/Home/Index.cshtml");
        }

        public IActionResult Privacy()
        {
            return View("~/Views/Home/Privacy.cshtml");
        }

        public IActionResult Role()
        {
            return View("~/Views/Home/Role.cshtml");
        }

        ///////////////////////StaffLOGIN/////////
        [HttpGet]
        public IActionResult StaffLogIn(string role = "admin")
        {
            ViewBag.Role = role; // "admin" or "recognition"
            return View("~/Views/Home/StaffLogIn.cshtml");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult StaffLogIn(StaffLogInDto model, string role = "admin")
        {
            ViewBag.Role = role;

            if (!ModelState.IsValid)
                return View("~/Views/Home/StaffLogIn.cshtml", model);

            if (model.Captcha != "817694")
            {
                ModelState.AddModelError("", "Captcha is incorrect.");
                return View("~/Views/Home/StaffLogIn.cshtml", model);
            }

            var normalizedRole = (role ?? "").Trim().ToLowerInvariant();

            if (normalizedRole == "recognition" || normalizedRole == "member")
            {
                var memberId = NormalizeRecognitionMemberIdentity(model.Email);

                if (string.IsNullOrWhiteSpace(memberId))
                {
                    ModelState.AddModelError("", "Use one of the test recognition member emails: member1@mohe.local, member2@mohe.local, member3@mohe.local");
                    return View("~/Views/Home/StaffLogIn.cshtml", model);
                }

                HttpContext.Session.SetString("CurrentStaffRole", "recognition");
                HttpContext.Session.SetString("CurrentRecognitionMember", memberId);

                return RedirectToAction("RecognitionMemberDashboard", "Home");
            }

            HttpContext.Session.SetString("CurrentStaffRole", "admin");
            HttpContext.Session.Remove("CurrentRecognitionMember");

            return RedirectToAction("AdminDashboard", "Home");
        }

        ///////////////////////FORGETPASSWORD/////////
        [HttpGet]
        public IActionResult ForgetPassword(string role = "admin")
        {
            ViewBag.Role = role;
            return View("~/Views/Home/ForgetPassword.cshtml");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ForgetPassword(ForgetPasswordDto model, string role = "admin")
        {
            ViewBag.Role = role;

            if (!ModelState.IsValid)
                return View("~/Views/Home/ForgetPassword.cshtml", model);

            return RedirectToAction("ResetPassword", new { role });
        }

        ///////////////////////RESETPASSWORD/////////
        [HttpGet]
        public IActionResult ResetPassword(string role = "admin")
        {
            ViewBag.Role = role;
            return View("~/Views/Home/ResetPassword.cshtml");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ResetPassword(ResetPasswordDto model, string role = "admin")
        {
            ViewBag.Role = role;

            if (!ModelState.IsValid)
                return View("~/Views/Home/ResetPassword.cshtml", model);

            return RedirectToAction("StaffLogIn", new { role });
        }

        ///////////////////////UniversityEntry/////////
        [HttpGet]
        public IActionResult UniversityEntry()
        {
            return View("~/Views/uni/UniversityEntry.cshtml");
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult UniversityEntry(string Email, string Password, string RecognitionNumber)
        {
            if (string.IsNullOrWhiteSpace(Email) ||
                string.IsNullOrWhiteSpace(Password) ||
                string.IsNullOrWhiteSpace(RecognitionNumber))
            {
                ViewBag.ErrorMessage = "Please fill all required fields.";
                return View("~/Views/uni/UniversityEntry.cshtml");
            }

            HttpContext.Session.SetString("UniversityEmail", Email ?? "");
            HttpContext.Session.SetString("RecognitionNumber", RecognitionNumber ?? "");

            return RedirectToAction("UniDashboard", "Home");
        }

        ///////////////////////UniversityRecoverAccess/////////
        [HttpGet]
        public IActionResult UniversityRecoverAccess()
        {
            return View("~/Views/uni/UniversityRecoverAccess.cshtml");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult UniversityRecoverAccess(string Email, string RecoverType)
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(RecoverType))
            {
                ViewBag.ErrorMessage = "Please enter your university email and choose one option.";
                return View("~/Views/uni/UniversityRecoverAccess.cshtml");
            }

            ViewBag.SuccessMessage = "Your request has been received. The requested information would be sent to the university email in the completed system.";
            return View("~/Views/uni/UniversityRecoverAccess.cshtml");
        }

        ///////////////////////UniDashBoard/////////
        public IActionResult UniDashboard()
        {
            // ================== Public Info(section 1) ==================
            var publicJson = HttpContext.Session.GetString("PublicInfo");
            PublicInfoDto p = string.IsNullOrWhiteSpace(publicJson)
                ? new PublicInfoDto()
                : (JsonSerializer.Deserialize<PublicInfoDto>(publicJson) ?? new PublicInfoDto());

            ViewBag.Public = p;


            // ================== Academic Info(section 2) ==================
            var academicJson = HttpContext.Session.GetString("AcademicInfo");
            AcademicInfoDto a = string.IsNullOrWhiteSpace(academicJson)
                ? new AcademicInfoDto()
                : (JsonSerializer.Deserialize<AcademicInfoDto>(academicJson) ?? new AcademicInfoDto());

            ViewBag.Academic = a;

            // ================== Admission Requirements(section 3) ==================
            ViewBag.Admission = LoadAdmission();

            // ================== Study Duration(section 4) ==================
            var durationJson = HttpContext.Session.GetString("StudyDuration");
            StudyDurationDto d = string.IsNullOrWhiteSpace(durationJson)
                ? new StudyDurationDto()
                : (JsonSerializer.Deserialize<StudyDurationDto>(durationJson) ?? new StudyDurationDto());

            ViewBag.Duration = d;

            // Faculties
            var faculties = LoadFaculties();
            ViewBag.Faculties = faculties;

            // Programs
            var programs = AttachFaculties(LoadPrograms());
            ViewBag.Programs = programs;

            // ✅ Hours model (this feeds the dropdown + table on first load)
            ViewBag.ProgramHours = new ProgramHoursDto
            {
                Programs = programs.Rows,
                Rows = GetProgramHoursRows()
            };

            // ================== Ratios / Percentages(section 9) ==================
            var ratiosJson = HttpContext.Session.GetString("Ratios");
            RatiosDto r = string.IsNullOrWhiteSpace(ratiosJson)
                ? new RatiosDto()
                : (JsonSerializer.Deserialize<RatiosDto>(ratiosJson) ?? new RatiosDto());

            ViewBag.Ratios = r;


            // ================== Infrastructure(section ) ==================
            var infrastructureJson = HttpContext.Session.GetString("Infrastructure");
            InfrastructureDto infrastructure = string.IsNullOrWhiteSpace(infrastructureJson)
                ? new InfrastructureDto()
                : (JsonSerializer.Deserialize<InfrastructureDto>(infrastructureJson) ?? new InfrastructureDto());

            ViewBag.Infrastructure = infrastructure;

            // ================== Librarye(section ) ==================
            ViewBag.Library = LoadLibrary();
            // ================== Attachments(section ) ==================
            ViewBag.Attachments = LoadAttachments();
            // ================== Pictures(section ) ==================
            ViewBag.Pictures = LoadPictures();
            // ================== Submit(section ) ==================
            ViewBag.SubmitApplication = LoadSubmitApplication();
            return View("~/Views/uni/UniDashboard.cshtml");
        }

        ///////////////////////PublicInfo/////////
        [HttpPost]
        public IActionResult SavePublicInfo(PublicInfoDto dto)
        {
            // Required fields (must match input "name" attributes in Public Info section)
            var required = new[]
            {
        "InstitutionName",
        "PartyForwardingForm",
        "FoundationDate",
        "MailingFullAddress",
        "DirectPhoneNumber",
        "FaxNumber",
        "EmailAddress",
        "InstitutionalWebAddress"
    };

            // 1) Required check
            foreach (var key in required)
            {
                var val = Request.Form[key].ToString();
                if (string.IsNullOrWhiteSpace(val))
                    return BadRequest($"{key} is required.");
            }

            // 2) Save to Session
            var json = JsonSerializer.Serialize(dto ?? new PublicInfoDto());
            HttpContext.Session.SetString("PublicInfo", json);

            // 3) No success message
            return Ok();
        }
        //to stay on the same page 
        [HttpPost]
        public IActionResult AutoSavePublicInfo(PublicInfoDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new PublicInfoDto());
            HttpContext.Session.SetString("PublicInfo", json);
            return Ok();
        }

        ///////////////////////AcademicInfo/////////
        [HttpPost]
        public IActionResult SaveAcademicInfo(AcademicInfoDto dto)
        {
            // Required fields (must match the input "name" attributes in the Academic section)
            var required = new[]
            {
        "TypeOfAcademicInstitution",
        "OfficialRecognitionInHomeCountry",
        "OfficialAccreditationQualityInHomeCountry",
        "LanguageForDomesticStudents",
        "LanguageForForeignStudents",
        "ForeignStudentsJointClassroomsWithLocal",

        "JordanianStudentPopulation",
        "TotalStudentPopulation",

        "StaffProfessor",
        "StaffAssociateProfessor",
        "StaffAssistantProfessor",
        "StaffLabAssistant",
        "StaffResearcher",
        "StaffTeacher",
        "StaffAssistantTeacher",

        "ResearchItemsScopus",
        "ResearchItemsOtherSearchEngines"
    };

            // 1) Required check
            foreach (var key in required)
            {
                var val = Request.Form[key].ToString();
                if (string.IsNullOrWhiteSpace(val))
                    return BadRequest($"{key} is required.");
            }

            // 2) Degrees: at least one must be checked
            var degreeNames = new[]
            {
        "DegreeDiploma",
        "DegreeBSC",
        "DegreeHigherDiploma",
        "DegreeMaster",
        "DegreePhD"
    };

            bool anyDegree = degreeNames.Any(n =>
                string.Equals(Request.Form[n].ToString(), "true", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(Request.Form[n].ToString(), "on", StringComparison.OrdinalIgnoreCase)
            );

            if (!anyDegree)
                return BadRequest("Degrees is required.");

            // 3) Save to Session
            var json = JsonSerializer.Serialize(dto ?? new AcademicInfoDto());
            HttpContext.Session.SetString("AcademicInfo", json);

            // No success message — just OK
            return Ok();
        }
        // to stay on the same page 
        [HttpPost]
        public IActionResult AutoSaveAcademicInfo(AcademicInfoDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new AcademicInfoDto());
            HttpContext.Session.SetString("AcademicInfo", json);
            return Ok();
        }



        // ============================================================
        // Admission Requirements (Session Helpers + AJAX Endpoints)
        // ============================================================

        private const string ADMISSION_KEY = "AdmissionInfo";

        private AdmissionRequirementsDto LoadAdmission()
        {
            var json = HttpContext.Session.GetString(ADMISSION_KEY);
            if (string.IsNullOrWhiteSpace(json))
                return new AdmissionRequirementsDto();

            return JsonSerializer.Deserialize<AdmissionRequirementsDto>(json) ?? new AdmissionRequirementsDto();
        }

        private void SaveAdmission(AdmissionRequirementsDto dto)
        {
            HttpContext.Session.SetString(ADMISSION_KEY, JsonSerializer.Serialize(dto ?? new AdmissionRequirementsDto()));
        }

        private List<AdmissionRequirementRowDto> GetAdmissionList(AdmissionRequirementsDto dto, string degree)
        {
            degree = (degree ?? "").Trim();

            return degree switch
            {
                "Diploma" => dto.Diploma,
                "BSc" => dto.BSC,
                "HigherDiploma" => dto.HigherDiploma,
                "Master" => dto.Master,
                "PhD" => dto.PhD,
                _ => dto.Diploma
            };
        }

        // ✅ IMPORTANT: your partial is inside Views/Home/Partial_Views/
        private const string ADMISSION_PARTIAL = "Partial_Views/_AdmissionRequirements";

        // 1) Return ONLY the admission section HTML (partial)
        [HttpGet]
        public IActionResult AdmissionSection()
        {
            var ad = LoadAdmission();
            return PartialView(ADMISSION_PARTIAL, ad);
        }

        // 2) AJAX Add (no redirect)
        [HttpPost]
        public IActionResult AdmissionAdd(string degree, string requirement)
        {
            degree = (degree ?? "").Trim();
            requirement = (requirement ?? "").Trim();

            // ✅ validate degree
            var allowed = new[] { "Diploma", "BSc", "HigherDiploma", "Master", "PhD" };
            if (!allowed.Contains(degree))
                return BadRequest("Invalid degree.");

            // ✅ required
            if (string.IsNullOrWhiteSpace(requirement))
                return BadRequest($"{degree}: Requirement is required.");

            // ✅ length limit (professional guard)
            if (requirement.Length > 300)
                return BadRequest($"{degree}: Requirement is too long (max 300 characters).");

            var dto = LoadAdmission();

            // ✅ ensure lists exist (safety)
            dto.Diploma ??= new List<AdmissionRequirementRowDto>();
            dto.BSC ??= new List<AdmissionRequirementRowDto>();
            dto.HigherDiploma ??= new List<AdmissionRequirementRowDto>();
            dto.Master ??= new List<AdmissionRequirementRowDto>();
            dto.PhD ??= new List<AdmissionRequirementRowDto>();

            var list = GetAdmissionList(dto, degree);

            // ✅ prevent duplicates (case-insensitive)
            bool exists = list.Any(x =>
                (x.Requirement ?? "").Trim().Equals(requirement, StringComparison.OrdinalIgnoreCase)
            );
            if (exists)
                return BadRequest($"{degree}: Requirement already exists.");

            int nextId = (list.Count == 0) ? 1 : list.Max(x => x.Id) + 1;

            list.Add(new AdmissionRequirementRowDto
            {
                Id = nextId,
                Requirement = requirement
            });

            SaveAdmission(dto);

            // return updated partial
            return PartialView(ADMISSION_PARTIAL, LoadAdmission());
        }

        // 3) AJAX Delete (no redirect)
        [HttpPost]
        public IActionResult AdmissionDelete(string degree, int id)
        {
            degree = (degree ?? "").Trim();

            // ✅ validate degree
            var allowed = new[] { "Diploma", "BSc", "HigherDiploma", "Master", "PhD" };
            if (!allowed.Contains(degree))
                return BadRequest("Invalid degree.");

            // ✅ validate id
            if (id <= 0)
                return BadRequest("Invalid row id.");

            var dto = LoadAdmission();

            // ✅ ensure lists exist (safety)
            dto.Diploma ??= new List<AdmissionRequirementRowDto>();
            dto.BSC ??= new List<AdmissionRequirementRowDto>();
            dto.HigherDiploma ??= new List<AdmissionRequirementRowDto>();
            dto.Master ??= new List<AdmissionRequirementRowDto>();
            dto.PhD ??= new List<AdmissionRequirementRowDto>();

            var list = GetAdmissionList(dto, degree);

            var row = list.FirstOrDefault(x => x.Id == id);
            if (row == null)
                return BadRequest($"{degree}: Row not found.");

            list.Remove(row);

            SaveAdmission(dto);

            // return updated partial
            return PartialView(ADMISSION_PARTIAL, LoadAdmission());
        }


        /// ///////////////////////Study duratin//////////
        [HttpPost]
        public IActionResult SaveDuration([Bind(Prefix = "Duration")] StudyDurationDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new StudyDurationDto());
            HttpContext.Session.SetString("StudyDuration", json);

            TempData["SavedBanner"] = "✅ Study Duration saved successfully!";
            return Redirect(Url.Action("UniDashboard", "Home") + "#sec-duration");
        }
        // to stay on the same page 
        [HttpPost]
        public IActionResult AutoSaveDuration([Bind(Prefix = "Duration")] StudyDurationDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new StudyDurationDto());
            HttpContext.Session.SetString("StudyDuration", json);
            return Ok();
        }
        // ============================================================
        // Faculties (Session Helpers + AJAX Endpoints)
        // ============================================================
        private const string FACULTIES_KEY = "Faculties";

        private FacultiesDto LoadFaculties()
        {
            var json = HttpContext.Session.GetString(FACULTIES_KEY);
            if (string.IsNullOrWhiteSpace(json))
                return new FacultiesDto();

            return JsonSerializer.Deserialize<FacultiesDto>(json) ?? new FacultiesDto();
        }

        private void SaveFaculties(FacultiesDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new FacultiesDto());
            HttpContext.Session.SetString(FACULTIES_KEY, json);
        }
        [HttpPost]
        public IActionResult FacultiesAdd(string facultyName)
        {
            facultyName = (facultyName ?? "").Trim();
            if (string.IsNullOrWhiteSpace(facultyName))
                return BadRequest("Faculty name is required");

            var current = LoadFaculties();
            current.Rows.Add(new FacultyRowDto { FacultyName = facultyName });

            SaveFaculties(current);

            // ✅ IMPORTANT: correct partial path
            return PartialView("Partial_Views/_Faculties", current);
        }

        [HttpPost]
        public IActionResult FacultiesDelete(string id)
        {
            var current = LoadFaculties();
            current.Rows.RemoveAll(r => r.Id == id);

            SaveFaculties(current);

            // ✅ IMPORTANT: correct partial path
            return PartialView("Partial_Views/_Faculties", current);
        }

        [HttpPost]
        public IActionResult FacultiesUpdate(string id, string facultyName)
        {
            id = (id ?? "").Trim();
            facultyName = (facultyName ?? "").Trim();

            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid faculty id.");

            if (string.IsNullOrWhiteSpace(facultyName))
                return BadRequest("Faculty name is required.");

            var current = LoadFaculties();
            var row = current.Rows.FirstOrDefault(r => r.Id == id);
            if (row == null)
                return BadRequest("Faculty not found.");

            row.FacultyName = facultyName;

            SaveFaculties(current);

            return PartialView("Partial_Views/_Faculties", current);
        }


        // ============================================================
        // Programs (Session Helpers + AJAX Endpoints)
        // ============================================================
        private const string PROGRAMS_KEY = "Programs"; // ✅ ONE KEY ONLY

        private ProgramsDto LoadPrograms()
        {
            var json = HttpContext.Session.GetString(PROGRAMS_KEY);
            if (string.IsNullOrWhiteSpace(json))
                return new ProgramsDto();

            return JsonSerializer.Deserialize<ProgramsDto>(json) ?? new ProgramsDto();
        }

        private void SavePrograms(ProgramsDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new ProgramsDto());
            HttpContext.Session.SetString(PROGRAMS_KEY, json);
        }

        private ProgramsDto AttachFaculties(ProgramsDto programs)
        {
            var fac = LoadFaculties();
            programs.Faculties = fac?.Rows ?? new List<FacultyRowDto>();
            return programs;
        }

        [HttpGet]
        public IActionResult ProgramsPartial()
        {
            var programs = LoadPrograms();
            return PartialView("Partial_Views/_Programs", AttachFaculties(programs));
        }

        [HttpPost]
        public IActionResult ProgramsAdd(
            string program,
            string facultyId,
            string degreeAwarded,
            int numberOfYears,
            int creditHours,
            string educationalSystem,
            string language,
            DateTime? accreditationDate,
            DateTime? creationDate,
            DateTime? graduationDateOfLastRegiment,
            int graduatesTotalLast3Years
        )
        {
            program = (program ?? "").Trim();
            facultyId = (facultyId ?? "").Trim();
            degreeAwarded = (degreeAwarded ?? "").Trim();
            educationalSystem = (educationalSystem ?? "").Trim();
            language = (language ?? "").Trim();

            if (string.IsNullOrWhiteSpace(program)) return BadRequest("Program is required");
            if (string.IsNullOrWhiteSpace(facultyId)) return BadRequest("Faculty is required");
            if (string.IsNullOrWhiteSpace(degreeAwarded)) return BadRequest("Degree Awarded is required");
            if (numberOfYears <= 0) return BadRequest("Number of Years is required");
            if (creditHours <= 0) return BadRequest("Credit Hours is required");
            if (string.IsNullOrWhiteSpace(educationalSystem)) return BadRequest("Educational System is required");
            if (string.IsNullOrWhiteSpace(language)) return BadRequest("Language is required");
            if (accreditationDate == null) return BadRequest("Accreditation Date is required");
            if (creationDate == null) return BadRequest("Creation Date is required");
            if (graduationDateOfLastRegiment == null) return BadRequest("Graduation date of last regiment is required");
            if (graduatesTotalLast3Years < 0) return BadRequest("Graduates total for the last 3 years is required");

            var faculties = LoadFaculties()?.Rows ?? new List<FacultyRowDto>();
            var selectedFaculty = faculties.FirstOrDefault(f => f.Id == facultyId);
            if (selectedFaculty == null) return BadRequest("Please select a valid faculty");

            var current = LoadPrograms();

            var row = new ProgramRowDto
            {
                Id = Guid.NewGuid().ToString("N"), // ✅ force stable id
                Program = program,
                FacultyId = facultyId,
                FacultyName = selectedFaculty.FacultyName,

                DegreeAwarded = degreeAwarded,
                NumberOfYears = numberOfYears,
                CreditHours = creditHours,
                EducationalSystem = educationalSystem,
                Language = language,

                AccreditationDate = accreditationDate,
                CreationDate = creationDate,
                GraduationDateOfLastRegiment = graduationDateOfLastRegiment,
                GraduatesTotalLast3Years = graduatesTotalLast3Years
            };

            current.Rows.Add(row);
            SavePrograms(current);

            return PartialView("Partial_Views/_Programs", AttachFaculties(current));
        }

        [HttpPost]
        public IActionResult ProgramsUpdate(
            string id,
            string program,
            string facultyId,
            string degreeAwarded,
            int numberOfYears,
            int creditHours,
            string educationalSystem,
            string language,
            DateTime? accreditationDate,
            DateTime? creationDate,
            DateTime? graduationDateOfLastRegiment,
            int graduatesTotalLast3Years
        )
        {
            id = (id ?? "").Trim();
            program = (program ?? "").Trim();
            facultyId = (facultyId ?? "").Trim();
            degreeAwarded = (degreeAwarded ?? "").Trim();
            educationalSystem = (educationalSystem ?? "").Trim();
            language = (language ?? "").Trim();

            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Invalid row");

            var faculties = LoadFaculties()?.Rows ?? new List<FacultyRowDto>();
            var selectedFaculty = faculties.FirstOrDefault(f => f.Id == facultyId);
            if (selectedFaculty == null) return BadRequest("Please select a valid faculty");

            var current = LoadPrograms();

            // ✅ DEBUG SAFE: if list empty, you'll know immediately
            if (current.Rows == null || current.Rows.Count == 0)
                return BadRequest("Programs session is empty. You may have duplicate Programs keys/methods.");

            var row = current.Rows.FirstOrDefault(r => r.Id == id);
            if (row == null)
                return BadRequest("Row not found (id mismatch). Make sure you don't have duplicated Programs methods/keys.");

            row.Program = program;
            row.FacultyId = facultyId;
            row.FacultyName = selectedFaculty.FacultyName;

            row.DegreeAwarded = degreeAwarded;
            row.NumberOfYears = numberOfYears;
            row.CreditHours = creditHours;
            row.EducationalSystem = educationalSystem;
            row.Language = language;

            row.AccreditationDate = accreditationDate;
            row.CreationDate = creationDate;
            row.GraduationDateOfLastRegiment = graduationDateOfLastRegiment;
            row.GraduatesTotalLast3Years = graduatesTotalLast3Years;

            SavePrograms(current);

            return PartialView("Partial_Views/_Programs", AttachFaculties(current));
        }

        [HttpPost]
        public IActionResult ProgramsDelete(string id)
        {
            id = (id ?? "").Trim();

            var current = LoadPrograms();
            current.Rows.RemoveAll(r => r.Id == id);

            SavePrograms(current);

            return PartialView("Partial_Views/_Programs", AttachFaculties(current));
        }


        // ============================================================
        // Number of Students (Session Helpers + AJAX Endpoints)
        // ============================================================
        private const string STUDENTS_NUMBERS_KEY = "StudentsNumbers";

        private StudentsNumbersDto LoadStudentsNumbers()
        {
            var json = HttpContext.Session.GetString(STUDENTS_NUMBERS_KEY);
            if (string.IsNullOrWhiteSpace(json))
                return new StudentsNumbersDto();

            return JsonSerializer.Deserialize<StudentsNumbersDto>(json) ?? new StudentsNumbersDto();
        }

        private void SaveStudentsNumbers(StudentsNumbersDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new StudentsNumbersDto());
            HttpContext.Session.SetString(STUDENTS_NUMBERS_KEY, json);
        }

        // ✅ Attach Programs list from Programs section (Session)
        private StudentsNumbersDto AttachPrograms(StudentsNumbersDto dto)
        {
            var programsDto = LoadPrograms(); // uses PROGRAMS_KEY = "Programs"
            dto.Programs = programsDto?.Rows ?? new List<ProgramRowDto>();
            return dto;
        }

        [HttpGet]
        public IActionResult StudentsNumbersPartial()
        {
            var dto = LoadStudentsNumbers();
            dto = AttachPrograms(dto);
            return PartialView("Partial_Views/_StudentsNumbers", dto);
        }

        [HttpPost]
        public IActionResult StudentsNumbersAdd(
            string programId,
            int? year1,
            int? year2,
            int? year3,
            int? year4,
            int? year5,
            int? year6
        )
        {
            programId = (programId ?? "").Trim();

            if (string.IsNullOrWhiteSpace(programId)) return BadRequest("Program is required");
            if (year1 == null || year2 == null || year3 == null || year4 == null || year5 == null || year6 == null)
                return BadRequest("All years are required");

            if (year1 < 0 || year2 < 0 || year3 < 0 || year4 < 0 || year5 < 0 || year6 < 0)
                return BadRequest("Years values cannot be negative");

            // ✅ program must exist in Programs session
            var programs = LoadPrograms()?.Rows ?? new List<ProgramRowDto>();
            var selectedProgram = programs.FirstOrDefault(p => p.Id == programId);
            if (selectedProgram == null) return BadRequest("Please add Programs first, then select a Program");

            var current = LoadStudentsNumbers();

            current.Rows.Add(new StudentNumbersRowDto
            {
                Id = Guid.NewGuid().ToString("N"),
                ProgramId = selectedProgram.Id,
                ProgramName = selectedProgram.Program,
                Year1 = year1.Value,
                Year2 = year2.Value,
                Year3 = year3.Value,
                Year4 = year4.Value,
                Year5 = year5.Value,
                Year6 = year6.Value
            });

            SaveStudentsNumbers(current);

            current = AttachPrograms(current);
            return PartialView("Partial_Views/_StudentsNumbers", current);
        }

        [HttpPost]
        public IActionResult StudentsNumbersDelete(string id)
        {
            id = (id ?? "").Trim();
            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Invalid row");

            var current = LoadStudentsNumbers();
            current.Rows.RemoveAll(r => r.Id == id);

            SaveStudentsNumbers(current);

            current = AttachPrograms(current);
            return PartialView("Partial_Views/_StudentsNumbers", current);
        }

        // ✅ UPDATE ONLY YEARS (Program stays the same)
        [HttpPost]
        public IActionResult StudentsNumbersUpdateYears(
            string id,
            int? year1,
            int? year2,
            int? year3,
            int? year4,
            int? year5,
            int? year6
        )
        {
            id = (id ?? "").Trim();
            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Invalid row");

            if (year1 == null || year2 == null || year3 == null || year4 == null || year5 == null || year6 == null)
                return BadRequest("All years are required");

            if (year1 < 0 || year2 < 0 || year3 < 0 || year4 < 0 || year5 < 0 || year6 < 0)
                return BadRequest("Years values cannot be negative");

            var current = LoadStudentsNumbers();
            var row = current.Rows.FirstOrDefault(r => r.Id == id);
            if (row == null) return BadRequest("Row not found");

            row.Year1 = year1.Value;
            row.Year2 = year2.Value;
            row.Year3 = year3.Value;
            row.Year4 = year4.Value;
            row.Year5 = year5.Value;
            row.Year6 = year6.Value;

            SaveStudentsNumbers(current);

            current = AttachPrograms(current);
            return PartialView("Partial_Views/_StudentsNumbers", current);
        }
        [HttpPost]
        public IActionResult StudentsNumbersUpdate(
    string id,
    int? year1,
    int? year2,
    int? year3,
    int? year4,
    int? year5,
    int? year6
)
        {
            // Just call the existing method so URLs match the new JS
            return StudentsNumbersUpdateYears(id, year1, year2, year3, year4, year5, year6);
        }
        // ============================================================
        // Program Hours (Theoretical/Practical per Program)
        // ============================================================
        private const string PROGRAM_HOURS_KEY = "PROGRAM_HOURS_ROWS";

        private List<ProgramHoursRowDto> GetProgramHoursRows()
        {
            var json = HttpContext.Session.GetString(PROGRAM_HOURS_KEY);
            return string.IsNullOrWhiteSpace(json)
                ? new List<ProgramHoursRowDto>()
                : (JsonSerializer.Deserialize<List<ProgramHoursRowDto>>(json) ?? new List<ProgramHoursRowDto>());
        }

        private void SaveProgramHoursRows(List<ProgramHoursRowDto> rows)
        {
            HttpContext.Session.SetString(PROGRAM_HOURS_KEY, JsonSerializer.Serialize(rows));
        }

        [HttpGet]
        public IActionResult GetProgramHours()
        {
            return Json(GetProgramHoursRows());
        }
        // =============================
        // Program Hours (Partial Endpoints)
        // =============================

        private ProgramHoursDto BuildProgramHoursDto()
        {
            var programs = AttachFaculties(LoadPrograms());
            return new ProgramHoursDto
            {
                Programs = programs.Rows,
                Rows = GetProgramHoursRows()
            };
        }

        [HttpGet]
        public IActionResult ProgramHoursPartial()
        {
            return PartialView("Partial_Views/_ProgramHours", BuildProgramHoursDto());
        }

        [HttpPost]
        public IActionResult ProgramHoursAdd(string programId, int? theoreticalHours, int? practicalHours)
        {
            programId = (programId ?? "").Trim();

            if (string.IsNullOrWhiteSpace(programId))
                return BadRequest("Program is required.");

            if (theoreticalHours == null)
                return BadRequest("Theoretical Hours is required.");

            if (practicalHours == null)
                return BadRequest("Practical Hours is required.");

            if (theoreticalHours < 0 || practicalHours < 0)
                return BadRequest("Hours cannot be negative.");

            var programs = LoadPrograms();
            var program = programs?.Rows?.FirstOrDefault(p => p.Id == programId);
            if (program == null)
                return BadRequest("Program not found.");

            var rows = GetProgramHoursRows();

            // Prevent duplicates per program (professional)
            if (rows.Any(r => r.ProgramId == programId))
                return BadRequest("This program already has hours saved. Use Edit.");

            rows.Add(new ProgramHoursRowDto
            {
                Id = Guid.NewGuid().ToString("N"),
                ProgramId = programId,
                ProgramName = program.Program,
                TheoreticalHours = theoreticalHours.Value,
                PracticalHours = practicalHours.Value
            });

            SaveProgramHoursRows(rows);

            return PartialView("Partial_Views/_ProgramHours", BuildProgramHoursDto());
        }

        [HttpPost]
        public IActionResult ProgramHoursUpdate(string id, int? theoreticalHours, int? practicalHours)
        {
            id = (id ?? "").Trim();

            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid row.");

            if (theoreticalHours == null)
                return BadRequest("Theoretical Hours is required.");

            if (practicalHours == null)
                return BadRequest("Practical Hours is required.");

            if (theoreticalHours < 0 || practicalHours < 0)
                return BadRequest("Hours cannot be negative.");

            var rows = GetProgramHoursRows();
            var row = rows.FirstOrDefault(r => r.Id == id);
            if (row == null)
                return BadRequest("Row not found.");

            row.TheoreticalHours = theoreticalHours.Value;
            row.PracticalHours = practicalHours.Value;

            SaveProgramHoursRows(rows);

            return PartialView("Partial_Views/_ProgramHours", BuildProgramHoursDto());
        }

        [HttpPost]
        public IActionResult ProgramHoursDelete(string id)
        {
            id = (id ?? "").Trim();
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid row.");

            var rows = GetProgramHoursRows();
            rows.RemoveAll(r => r.Id == id);
            SaveProgramHoursRows(rows);

            return PartialView("Partial_Views/_ProgramHours", BuildProgramHoursDto());
        }

        public class SaveProgramHoursRequest
        {
            public string? Id { get; set; }
            public string ProgramId { get; set; } = "";
            public int TheoreticalHours { get; set; }
            public int PracticalHours { get; set; }
        }

        [HttpPost]
        public IActionResult SaveProgramHours([FromBody] SaveProgramHoursRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.ProgramId))
                return BadRequest("Missing program.");

            // IMPORTANT: this must exist in your project from previous section
            // It should return ProgramsDto that has Rows containing ProgramRowDto {Id, Program}
            var programsDto = LoadPrograms();
            var program = programsDto?.Rows?.FirstOrDefault(p => p.Id == req.ProgramId);

            if (program == null)
                return BadRequest("Program not found.");

            var rows = GetProgramHoursRows();

            if (!string.IsNullOrWhiteSpace(req.Id))
            {
                // UPDATE
                var existing = rows.FirstOrDefault(x => x.Id == req.Id);
                if (existing == null) return NotFound();

                existing.ProgramId = req.ProgramId;
                existing.ProgramName = program.Program;
                existing.TheoreticalHours = req.TheoreticalHours;
                existing.PracticalHours = req.PracticalHours;
            }
            else
            {
                // ADD
                rows.Add(new ProgramHoursRowDto
                {
                    Id = Guid.NewGuid().ToString("N"),
                    ProgramId = req.ProgramId,
                    ProgramName = program.Program,
                    TheoreticalHours = req.TheoreticalHours,
                    PracticalHours = req.PracticalHours
                });
            }

            SaveProgramHoursRows(rows);
            return Ok();
        }

        [HttpPost]
        public IActionResult DeleteProgramHours(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Missing id.");

            var rows = GetProgramHoursRows();
            rows.RemoveAll(x => x.Id == id);
            SaveProgramHoursRows(rows);

            return Ok();
        }
        [HttpGet]
        public IActionResult GetProgramsForHours()
        {
            var programs = AttachFaculties(LoadPrograms());
            var list = programs.Rows.Select(p => new { id = p.Id, program = p.Program }).ToList();
            return Json(list);
        }

        // ============================================================
        // Percenteges(Session Helpers + AJAX Endpoints)
        // ============================================================

        [HttpPost]
        public IActionResult SaveRatios([Bind(Prefix = "Ratios")] RatiosDto dto)
        {
            // Must be like: 1:25 (digits : digits)
            var ratioRegex = new Regex(@"^\s*\d+\s*:\s*\d+\s*$");

            var ratioKeys = Request.Form.Keys
                .Where(k => !string.IsNullOrWhiteSpace(k) && k.StartsWith("Ratios."))
                .ToList();

            if (ratioKeys.Count == 0)
                return BadRequest("No ratios data received.");

            foreach (var key in ratioKeys)
            {
                var val = Request.Form[key].ToString();

                // Required
                if (string.IsNullOrWhiteSpace(val))
                    return BadRequest($"{key} is required.");

                // Format
                if (!ratioRegex.IsMatch(val))
                    return BadRequest($"{key} has invalid format. Use 1:25.");
            }

            var json = JsonSerializer.Serialize(dto ?? new RatiosDto());
            HttpContext.Session.SetString("Ratios", json);

            return Ok();
        }


        // ============================================================
        // Teaching Staff Excel Upload (Session Helpers + AJAX Endpoints)
        // ============================================================
        private const string TEACHING_STAFF_EXCEL_KEY = "TeachingStaffExcel";

        private List<string> GetTeachingStaffRequiredColumns()
        {
            return new List<string>
    {
        "Name",
        "Program",
        "Major",
        "Degree Awarded",
        "Date of Obtaining Highest Academic Degree",
        "Academic Rank",
        "Status",
        "Nationality",
        "Name of the University for the Highest Degree"
    };
        }

        private AttachmentDto LoadTeachingStaffExcel()
        {
            var json = HttpContext.Session.GetString(TEACHING_STAFF_EXCEL_KEY);

            var model = string.IsNullOrWhiteSpace(json)
                ? new AttachmentDto()
                : (JsonSerializer.Deserialize<AttachmentDto>(json) ?? new AttachmentDto());

            model.Rows ??= new List<AttachmentRowDto>();
            model.RequiredFiles = GetTeachingStaffRequiredColumns();

            return model;
        }

        private void SaveTeachingStaffExcel(AttachmentDto dto)
        {
            HttpContext.Session.SetString(
                TEACHING_STAFF_EXCEL_KEY,
                JsonSerializer.Serialize(dto ?? new AttachmentDto())
            );
        }

        private string EnsureTeachingStaffExcelFolder()
        {
            var folder = Path.Combine(_env.WebRootPath, "uploads", "teachingstaff");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            return folder;
        }

        [HttpGet]
        public IActionResult TeachingStaffPartial()
        {
            var model = LoadTeachingStaffExcel();
            return PartialView("Partial_Views/_TeachingStaff", model);
        }

        [HttpPost]
        public async Task<IActionResult> UploadTeachingStaffExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please choose the Teaching Staff Excel file.");

            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (ext != ".xlsx")
                return BadRequest("Only .xlsx Excel files are allowed.");

            int validRowCount = 0;

            var model = LoadTeachingStaffExcel();
            var folder = EnsureTeachingStaffExcelFolder();

            foreach (var oldRow in model.Rows)
            {
                var oldPath = Path.Combine(folder, oldRow.StoredFileName ?? "");
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            model.Rows.Clear();

            var safeFileName = Path.GetFileName(file.FileName);
            var storedFileName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(folder, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            model.Rows.Add(new AttachmentRowDto
            {
                Id = Guid.NewGuid().ToString("N"),
                Subject = "Teaching Staff Excel File",
                FileName = safeFileName,
                StoredFileName = storedFileName,
                FileUrl = $"/uploads/teachingstaff/{storedFileName}",
                ContentType = file.ContentType ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                UploadedAt = DateTime.UtcNow
            });

            SaveTeachingStaffExcel(model);

            return PartialView("Partial_Views/_TeachingStaff", model);
        }

        [HttpPost]
        public IActionResult DeleteTeachingStaffExcel(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid file id.");

            var model = LoadTeachingStaffExcel();
            var row = model.Rows.FirstOrDefault(x => x.Id == id);

            if (row == null)
                return BadRequest("File was not found.");

            var folder = EnsureTeachingStaffExcelFolder();
            var fullPath = Path.Combine(folder, row.StoredFileName ?? "");

            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);

            model.Rows.Remove(row);
            SaveTeachingStaffExcel(model);

            return PartialView("Partial_Views/_TeachingStaff", model);
        }



        // ============================================================
        // Staff \ PhD Holders (Session Helpers + AJAX Endpoints)
        // ============================================================
        private const string PHD_HOLDERS_KEY = "PhdHolders";

        private PhdHoldersDto LoadPhdHolders()
        {
            var json = HttpContext.Session.GetString(PHD_HOLDERS_KEY);
            if (string.IsNullOrWhiteSpace(json))
                return new PhdHoldersDto();

            return JsonSerializer.Deserialize<PhdHoldersDto>(json) ?? new PhdHoldersDto();
        }

        private void SavePhdHolders(PhdHoldersDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new PhdHoldersDto());
            HttpContext.Session.SetString(PHD_HOLDERS_KEY, json);
        }

        // Attach Programs from Programs section (Session)
        private PhdHoldersDto AttachProgramsToPhd(PhdHoldersDto dto)
        {
            // Use the SAME programs loader as Teaching Staff
            var programsDto = LoadPrograms();

            // Some projects name the list "Programs" not "Rows" — so handle both safely
            if (programsDto != null)
            {
                // If your LoadPrograms() returns ProgramsDto with Rows
                dto.Programs = programsDto.Rows ?? new List<ProgramRowDto>();

                // In case your ProgramsDto uses a different property name, keep this fallback:
                if (dto.Programs == null || dto.Programs.Count == 0)
                {
                    var prop = programsDto.GetType().GetProperty("Programs");
                    if (prop != null)
                    {
                        var val = prop.GetValue(programsDto) as List<ProgramRowDto>;
                        if (val != null) dto.Programs = val;
                    }
                }
            }
            else
            {
                dto.Programs = new List<ProgramRowDto>();
            }

            return dto;
        }

        [HttpGet]
        public IActionResult PhdHoldersPartial()
        {
            var dto = LoadPhdHolders();
            dto = AttachProgramsToPhd(dto);
            return PartialView("Partial_Views/_PhdHolders", dto);
        }

        [HttpPost]
        public IActionResult PhdHoldersAdd(string name, string programId, string majorAreaOfStudy, string status)
        {
            name = (name ?? "").Trim();
            programId = (programId ?? "").Trim();
            majorAreaOfStudy = (majorAreaOfStudy ?? "").Trim();
            status = (status ?? "").Trim();

            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required.");
            if (string.IsNullOrWhiteSpace(programId)) return BadRequest("Program is required.");
            if (string.IsNullOrWhiteSpace(majorAreaOfStudy)) return BadRequest("Major Area of Study is required.");
            if (string.IsNullOrWhiteSpace(status)) return BadRequest("Status is required.");

            var programs = LoadPrograms()?.Rows ?? new List<ProgramRowDto>();
            var selected = programs.FirstOrDefault(p => p.Id == programId);
            if (selected == null) return BadRequest("Please add Programs first, then select a Program.");

            var current = LoadPhdHolders();

            current.Rows.Add(new PhdHolderRowDto
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = name,
                ProgramId = selected.Id,
                ProgramName = selected.Program,
                MajorAreaOfStudy = majorAreaOfStudy,
                Status = status
            });

            SavePhdHolders(current);

            current = AttachProgramsToPhd(current);
            return PartialView("Partial_Views/_PhdHolders", current);
        }

        [HttpPost]
        public IActionResult PhdHoldersDelete(string id)
        {
            id = (id ?? "").Trim();
            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Invalid row.");

            var current = LoadPhdHolders();
            current.Rows.RemoveAll(r => r.Id == id);

            SavePhdHolders(current);

            current = AttachProgramsToPhd(current);
            return PartialView("Partial_Views/_PhdHolders", current);
        }

        // Update (Program stays fixed like TeachingStaff)
        [HttpPost]
        public IActionResult PhdHoldersUpdate(string id, string name, string majorAreaOfStudy, string status)
        {
            id = (id ?? "").Trim();
            name = (name ?? "").Trim();
            majorAreaOfStudy = (majorAreaOfStudy ?? "").Trim();
            status = (status ?? "").Trim();

            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Invalid row.");
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required.");
            if (string.IsNullOrWhiteSpace(majorAreaOfStudy)) return BadRequest("Major Area of Study is required.");
            if (string.IsNullOrWhiteSpace(status)) return BadRequest("Status is required.");

            var current = LoadPhdHolders();
            var row = current.Rows.FirstOrDefault(r => r.Id == id);
            if (row == null) return BadRequest("Row not found.");

            row.Name = name;
            row.MajorAreaOfStudy = majorAreaOfStudy;
            row.Status = status;

            SavePhdHolders(current);

            current = AttachProgramsToPhd(current);
            return PartialView("Partial_Views/_PhdHolders", current);
        }

        // ============================================================
        // Faculties of Medicine and Dentistry Information (Numbers Only)
        // ============================================================
        private const string MED_DEN_KEY = "MedicineDentistry";

        private MedicineDentistryDto LoadMedDen()
        {
            var json = HttpContext.Session.GetString(MED_DEN_KEY);
            if (string.IsNullOrWhiteSpace(json))
                return new MedicineDentistryDto();

            return JsonSerializer.Deserialize<MedicineDentistryDto>(json) ?? new MedicineDentistryDto();
        }

        private void SaveMedDen(MedicineDentistryDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new MedicineDentistryDto());
            HttpContext.Session.SetString(MED_DEN_KEY, json);
        }

        [HttpGet]
        public IActionResult MedicineDentistryPartial()
        {
            var dto = LoadMedDen();
            return PartialView("Partial_Views/_MedicineDentistry", dto);
        }

        // ✅ Numbers-only: all params are int? (cannot accept text)
        [HttpPost]
        public IActionResult MedicineDentistrySave(
            int? med_students,
            int? med_teachingStaff,
            int? med_professor,
            int? med_associateProfessor,
            int? med_assistantProfessor,
            int? med_lecturer,
            int? med_teacher,
            int? med_assistantTeacher,
            int? med_fullTimeLecturer,

            int? den_students,
            int? den_teachingStaff,
            int? den_professor,
            int? den_associateProfessor,
            int? den_assistantProfessor,
            int? den_lecturer,
            int? den_teacher,
            int? den_assistantTeacher,
            int? den_fullTimeLecturer
        )
        {
            // Optional: block negative numbers (professional)
            bool hasNegative =
                (med_students ?? 0) < 0 ||
                (med_teachingStaff ?? 0) < 0 ||
                (med_professor ?? 0) < 0 ||
                (med_associateProfessor ?? 0) < 0 ||
                (med_assistantProfessor ?? 0) < 0 ||
                (med_lecturer ?? 0) < 0 ||
                (med_teacher ?? 0) < 0 ||
                (med_assistantTeacher ?? 0) < 0 ||
                (med_fullTimeLecturer ?? 0) < 0 ||
                (den_students ?? 0) < 0 ||
                (den_teachingStaff ?? 0) < 0 ||
                (den_professor ?? 0) < 0 ||
                (den_associateProfessor ?? 0) < 0 ||
                (den_assistantProfessor ?? 0) < 0 ||
                (den_lecturer ?? 0) < 0 ||
                (den_teacher ?? 0) < 0 ||
                (den_assistantTeacher ?? 0) < 0 ||
                (den_fullTimeLecturer ?? 0) < 0;

            if (hasNegative)
                return BadRequest("All fields must be non-negative numbers.");

            var dto = new MedicineDentistryDto
            {
                Med_Students = med_students,
                Med_TeachingStaff = med_teachingStaff,
                Med_Professor = med_professor,
                Med_AssociateProfessor = med_associateProfessor,
                Med_AssistantProfessor = med_assistantProfessor,
                Med_Lecturer = med_lecturer,
                Med_Teacher = med_teacher,
                Med_AssistantTeacher = med_assistantTeacher,
                Med_FullTimeLecturer = med_fullTimeLecturer,

                Den_Students = den_students,
                Den_TeachingStaff = den_teachingStaff,
                Den_Professor = den_professor,
                Den_AssociateProfessor = den_associateProfessor,
                Den_AssistantProfessor = den_assistantProfessor,
                Den_Lecturer = den_lecturer,
                Den_Teacher = den_teacher,
                Den_AssistantTeacher = den_assistantTeacher,
                Den_FullTimeLecturer = den_fullTimeLecturer
            };

            SaveMedDen(dto);

            return PartialView("Partial_Views/_MedicineDentistry", dto);
        }



        // ============================================================
        // Hospitals (Session Helpers + AJAX Endpoints)
        // ============================================================
        private const string HOSPITALS_KEY = "Hospitals";

        private HospitalsDto GetHospitalsData()
        {
            var json = HttpContext.Session.GetString(HOSPITALS_KEY);

            if (string.IsNullOrWhiteSpace(json))
            {
                return new HospitalsDto
                {
                    Rows = new List<HospitalRowDto>(),
                    Specializations = new List<string>()
                };
            }

            return JsonSerializer.Deserialize<HospitalsDto>(json) ?? new HospitalsDto
            {
                Rows = new List<HospitalRowDto>(),
                Specializations = new List<string>()
            };
        }

        private void SaveHospitalsData(HospitalsDto model)
        {
            if (model == null)
            {
                model = new HospitalsDto
                {
                    Rows = new List<HospitalRowDto>(),
                    Specializations = new List<string>()
                };
            }

            if (model.Rows == null)
                model.Rows = new List<HospitalRowDto>();

            if (model.Specializations == null)
                model.Specializations = new List<string>();

            var json = JsonSerializer.Serialize(model);
            HttpContext.Session.SetString(HOSPITALS_KEY, json);
        }

        private List<string> GetHospitalSpecializations()
        {
            var faculties = LoadFaculties()?.Rows ?? new List<FacultyRowDto>();

            var list = faculties
                .Where(f => !string.IsNullOrWhiteSpace(f.FacultyName))
                .Select(f => f.FacultyName.Trim())
                .Where(name =>
                    name.Contains("medicine", StringComparison.OrdinalIgnoreCase) ||
                    name.Contains("dental", StringComparison.OrdinalIgnoreCase) ||
                    name.Contains("dentistry", StringComparison.OrdinalIgnoreCase))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (!list.Any())
            {
                list = new List<string>
        {
            "Medicine",
            "Dentistry"
        };
            }

            return list;
        }

        [HttpGet]
        public IActionResult HospitalsPartial()
        {
            var model = GetHospitalsData();

            model.Rows ??= new List<HospitalRowDto>();
            model.Specializations = GetHospitalSpecializations();

            return PartialView("Partial_Views/_Hospitals", model);
        }

        private string EnsureHospitalUploadsFolder()
        {
            var folder = Path.Combine(_env.WebRootPath, "uploads", "hospitals");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            return folder;
        }

        public class HospitalUploadRequest
        {
            public string Id { get; set; } = "";
            public string Specialization { get; set; } = "";
            public string Name { get; set; } = "";
            public string Major { get; set; } = "";

            public List<IFormFile> RecognitionFiles { get; set; } = new();
            public List<IFormFile> ContractFiles { get; set; } = new();
        }

        [HttpPost]
        public async Task<IActionResult> AddHospital([FromForm] HospitalUploadRequest row)
        {
            if (row == null)
                return Json(new { success = false, message = "Invalid data." });

            if (string.IsNullOrWhiteSpace(row.Specialization) ||
                string.IsNullOrWhiteSpace(row.Name) ||
                string.IsNullOrWhiteSpace(row.Major))
            {
                return Json(new { success = false, message = "Please fill all required fields." });
            }

            if (row.RecognitionFiles == null || !row.RecognitionFiles.Any())
                return Json(new { success = false, message = "Please upload the hospital recognition/accreditation file." });

            if (row.ContractFiles == null || !row.ContractFiles.Any())
                return Json(new { success = false, message = "Please upload the hospital training contract or supporting file." });

            var allowedExts = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx" };
            var uploadsFolder = EnsureHospitalUploadsFolder();

            var model = GetHospitalsData();
            model.Rows ??= new List<HospitalRowDto>();

            var newRow = new HospitalRowDto
            {
                Id = Guid.NewGuid().ToString(),
                Specialization = row.Specialization.Trim(),
                Name = row.Name.Trim(),
                Major = row.Major.Trim(),
                RecognitionFiles = new List<HospitalFileDto>(),
                ContractFiles = new List<HospitalFileDto>()
            };

            foreach (var file in row.RecognitionFiles.Where(f => f != null && f.Length > 0))
            {
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(ext) || !allowedExts.Contains(ext))
                    return Json(new { success = false, message = $"Recognition file type is not allowed: {file.FileName}" });

                var stored = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(uploadsFolder, stored);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                newRow.RecognitionFiles.Add(new HospitalFileDto
                {
                    OriginalFileName = Path.GetFileName(file.FileName),
                    StoredFileName = stored,
                    FileUrl = $"/uploads/hospitals/{stored}"
                });
            }

            foreach (var file in row.ContractFiles.Where(f => f != null && f.Length > 0))
            {
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(ext) || !allowedExts.Contains(ext))
                    return Json(new { success = false, message = $"Contract/supporting file type is not allowed: {file.FileName}" });

                var stored = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(uploadsFolder, stored);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                newRow.ContractFiles.Add(new HospitalFileDto
                {
                    OriginalFileName = Path.GetFileName(file.FileName),
                    StoredFileName = stored,
                    FileUrl = $"/uploads/hospitals/{stored}"
                });
            }

            model.Rows.Add(newRow);
            SaveHospitalsData(model);

            return Json(new { success = true, message = "Hospital row added successfully." });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateHospital([FromForm] HospitalUploadRequest row)
        {
            if (row == null || string.IsNullOrWhiteSpace(row.Id))
                return Json(new { success = false, message = "Invalid data." });

            if (string.IsNullOrWhiteSpace(row.Specialization) ||
                string.IsNullOrWhiteSpace(row.Name) ||
                string.IsNullOrWhiteSpace(row.Major))
            {
                return Json(new { success = false, message = "Please fill all required fields." });
            }

            var model = GetHospitalsData();
            model.Rows ??= new List<HospitalRowDto>();

            var existing = model.Rows.FirstOrDefault(x => x.Id == row.Id);

            if (existing == null)
                return Json(new { success = false, message = "Row not found." });

            var allowedExts = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx" };
            var uploadsFolder = EnsureHospitalUploadsFolder();

            existing.Specialization = row.Specialization.Trim();
            existing.Name = row.Name.Trim();
            existing.Major = row.Major.Trim();

            existing.RecognitionFiles ??= new List<HospitalFileDto>();
            existing.ContractFiles ??= new List<HospitalFileDto>();

            if (row.RecognitionFiles != null && row.RecognitionFiles.Any(f => f != null && f.Length > 0))
            {
                foreach (var oldFile in existing.RecognitionFiles)
                {
                    if (!string.IsNullOrWhiteSpace(oldFile.StoredFileName))
                    {
                        var oldPath = Path.Combine(uploadsFolder, oldFile.StoredFileName);
                        if (System.IO.File.Exists(oldPath))
                            System.IO.File.Delete(oldPath);
                    }
                }

                existing.RecognitionFiles.Clear();

                foreach (var file in row.RecognitionFiles.Where(f => f != null && f.Length > 0))
                {
                    var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                    if (string.IsNullOrWhiteSpace(ext) || !allowedExts.Contains(ext))
                        return Json(new { success = false, message = $"Recognition file type is not allowed: {file.FileName}" });

                    var stored = $"{Guid.NewGuid()}{ext}";
                    var path = Path.Combine(uploadsFolder, stored);

                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    existing.RecognitionFiles.Add(new HospitalFileDto
                    {
                        OriginalFileName = Path.GetFileName(file.FileName),
                        StoredFileName = stored,
                        FileUrl = $"/uploads/hospitals/{stored}"
                    });
                }
            }

            if (row.ContractFiles != null && row.ContractFiles.Any(f => f != null && f.Length > 0))
            {
                foreach (var oldFile in existing.ContractFiles)
                {
                    if (!string.IsNullOrWhiteSpace(oldFile.StoredFileName))
                    {
                        var oldPath = Path.Combine(uploadsFolder, oldFile.StoredFileName);
                        if (System.IO.File.Exists(oldPath))
                            System.IO.File.Delete(oldPath);
                    }
                }

                existing.ContractFiles.Clear();

                foreach (var file in row.ContractFiles.Where(f => f != null && f.Length > 0))
                {
                    var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                    if (string.IsNullOrWhiteSpace(ext) || !allowedExts.Contains(ext))
                        return Json(new { success = false, message = $"Contract/supporting file type is not allowed: {file.FileName}" });

                    var stored = $"{Guid.NewGuid()}{ext}";
                    var path = Path.Combine(uploadsFolder, stored);

                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    existing.ContractFiles.Add(new HospitalFileDto
                    {
                        OriginalFileName = Path.GetFileName(file.FileName),
                        StoredFileName = stored,
                        FileUrl = $"/uploads/hospitals/{stored}"
                    });
                }
            }

            SaveHospitalsData(model);

            return Json(new { success = true, message = "Hospital row updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteHospital([FromBody] string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return Json(new { success = false, message = "Invalid id." });

            var model = GetHospitalsData();
            model.Rows ??= new List<HospitalRowDto>();

            var existing = model.Rows.FirstOrDefault(x => x.Id == id);

            if (existing == null)
                return Json(new { success = false, message = "Row not found." });

            var uploadsFolder = EnsureHospitalUploadsFolder();

            if (existing.RecognitionFiles != null)
            {
                foreach (var file in existing.RecognitionFiles)
                {
                    if (!string.IsNullOrWhiteSpace(file.StoredFileName))
                    {
                        var path = Path.Combine(uploadsFolder, file.StoredFileName);
                        if (System.IO.File.Exists(path))
                            System.IO.File.Delete(path);
                    }
                }
            }

            if (existing.ContractFiles != null)
            {
                foreach (var file in existing.ContractFiles)
                {
                    if (!string.IsNullOrWhiteSpace(file.StoredFileName))
                    {
                        var path = Path.Combine(uploadsFolder, file.StoredFileName);
                        if (System.IO.File.Exists(path))
                            System.IO.File.Delete(path);
                    }
                }
            }

            model.Rows.Remove(existing);
            SaveHospitalsData(model);

            return Json(new { success = true, message = "Hospital row deleted successfully." });
        }

        // ============================================================
        // INFASTRUCTURE (Session Helpers + AJAX Endpoints)
        // ============================================================
        private InfrastructureDto LoadInfrastructure()
        {
            var json = HttpContext.Session.GetString("Infrastructure");
            if (string.IsNullOrWhiteSpace(json))
                return new InfrastructureDto();

            return JsonSerializer.Deserialize<InfrastructureDto>(json) ?? new InfrastructureDto();
        }

        [HttpGet]
        public IActionResult InfrastructurePartial()
        {
            var model = LoadInfrastructure();
            return PartialView("Partial_Views/_Infrastructure", model);
        }

        [HttpPost]
        public IActionResult SaveInfrastructure(InfrastructureDto dto)
        {
            var required = new[]
            {
        "AreaKm2",
        "CampusesCount",
        "StadiumsCount",
        "ClassroomsAndLectureHallsCount",
        "LibrariesCount",
        "LaboratoriesDetails",
        "StudentServicingBuildingsDetails"
    };

            foreach (var key in required)
            {
                var val = Request.Form[key].ToString();
                if (string.IsNullOrWhiteSpace(val))
                    return BadRequest($"{key} is required.");
            }

            var json = JsonSerializer.Serialize(dto ?? new InfrastructureDto());
            HttpContext.Session.SetString("Infrastructure", json);

            return Ok();
        }

        // ============================================================
        // Laboratories (Session Helpers + AJAX Endpoints)
        // ============================================================
        private List<LaboratoryRowDto> LoadLaboratoryRows()
        {
            var json = HttpContext.Session.GetString("LaboratoriesRows");
            if (string.IsNullOrWhiteSpace(json))
                return new List<LaboratoryRowDto>();

            return JsonSerializer.Deserialize<List<LaboratoryRowDto>>(json) ?? new List<LaboratoryRowDto>();
        }

        private void SaveLaboratoryRows(List<LaboratoryRowDto> rows)
        {
            HttpContext.Session.SetString("LaboratoriesRows", JsonSerializer.Serialize(rows));
        }

        private LaboratoriesDto AttachFacultiesToLaboratories(LaboratoriesDto dto)
        {
            var fac = LoadFaculties();
            dto.Faculties = fac?.Rows ?? new List<FacultyRowDto>();
            return dto;
        }
        [HttpGet]
        public IActionResult LaboratoriesPartial()
        {
            var model = new LaboratoriesDto
            {
                Rows = LoadLaboratoryRows()
            };

            return PartialView("Partial_Views/_Laboratories", AttachFacultiesToLaboratories(model));
        }

        [HttpPost]

        public IActionResult AddOrUpdateLaboratory(LaboratoryRowDto dto)
        {
            if (dto == null)
                return BadRequest("No data was received.");

            if (string.IsNullOrWhiteSpace(dto.FacultyId))
                return BadRequest("Faculty is required.");

            if (!dto.Computers.HasValue ||
                !dto.Workshops.HasValue ||
                !dto.Laboratories.HasValue ||
                !dto.PersonalComputers.HasValue)
            {
                return BadRequest("Please fill all required fields.");
            }

            var faculties = LoadFaculties()?.Rows ?? new List<FacultyRowDto>();
            var faculty = faculties.FirstOrDefault(f => f.Id == dto.FacultyId);

            if (faculty == null)
                return BadRequest("Selected faculty was not found.");

            var rows = LoadLaboratoryRows();

            var existing = rows.FirstOrDefault(x => x.Id == dto.Id);

            if (existing == null)
            {
                dto.Id = string.IsNullOrWhiteSpace(dto.Id) ? Guid.NewGuid().ToString() : dto.Id;
                dto.FacultyName = faculty.FacultyName;
                rows.Add(dto);
            }
            else
            {
                existing.FacultyId = dto.FacultyId;
                existing.FacultyName = faculty.FacultyName;
                existing.Computers = dto.Computers;
                existing.Workshops = dto.Workshops;
                existing.Laboratories = dto.Laboratories;
                existing.PersonalComputers = dto.PersonalComputers;
            }

            SaveLaboratoryRows(rows);

            var model = new LaboratoriesDto
            {
                Rows = rows,
                Faculties = faculties
            };

            return PartialView("Partial_Views/_Laboratories", model);
        }

        [HttpPost]
        public IActionResult DeleteLaboratory(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid row id.");

            var rows = LoadLaboratoryRows();
            var target = rows.FirstOrDefault(x => x.Id == id);

            if (target == null)
                return NotFound("Row not found.");

            rows.Remove(target);
            SaveLaboratoryRows(rows);

            var model = new LaboratoriesDto
            {
                Rows = rows,
                Faculties = LoadFaculties()?.Rows ?? new List<FacultyRowDto>()
            };

            return PartialView("Partial_Views/_Laboratories", model);
        }

        // ================== Library(section ) ==================
        private LibraryDto LoadLibrary()
        {
            var json = HttpContext.Session.GetString("Library");
            return string.IsNullOrWhiteSpace(json)
                ? new LibraryDto()
                : (JsonSerializer.Deserialize<LibraryDto>(json) ?? new LibraryDto());
        }

        private void SaveLibraryToSession(LibraryDto dto)
        {
            HttpContext.Session.SetString("Library", JsonSerializer.Serialize(dto));
        }
        [HttpGet]
        public IActionResult LibraryPartial()
        {
            var model = LoadLibrary();
            return PartialView("Partial_Views/_Library", model);
        }

        [HttpPost]
        public IActionResult SaveLibrary(LibraryDto dto)
        {
            if (dto == null)
                return BadRequest("No data was received.");

            if (!dto.Area.HasValue ||
                !dto.TotalStudentCapacity.HasValue ||
                !dto.NumberOfArabicBooks.HasValue ||
                !dto.NumberOfEnglishBooks.HasValue ||
                !dto.NumberOfPaperJournals.HasValue ||
                !dto.NumberOfElectronicBooks.HasValue ||
                !dto.NumberOfElectronicJournals.HasValue)
            {
                return BadRequest("Please fill all required fields.");
            }

            SaveLibraryToSession(dto);

            var model = LoadLibrary();
            return PartialView("Partial_Views/_Library", model);
        }




        // ============================================================
        // Attachments (Session Helpers + AJAX Endpoints)
        // ============================================================
        private AttachmentDto LoadAttachments()
        {
            var json = HttpContext.Session.GetString("Attachments");
            var model = string.IsNullOrWhiteSpace(json)
                ? new AttachmentDto()
                : (JsonSerializer.Deserialize<AttachmentDto>(json) ?? new AttachmentDto());

            model.RequiredFiles ??= new List<string>
    {
      "University establishment document (such as royal decree, law, official decision, or establishment resolution).",
    "Official certified local accreditation document of the institution by the overseeing authority in the home country of the applying institution.",
    "International accreditation document of the institution, if applicable.",
    "Official program(s) accreditation document(s) by entrusted authorities in the institution's home country.",
    "Official certified accreditation documents of all fostered degree programs by the institution by the overseeing authority in the home country of the applying institution.",
    "A detailed curriculum for each program offering.",
    "International academic standing, in terms of institutional rank, of the applying institution, including the name of the ranking organization.",
    "Student guide as pertains to the institution.",
    "Course descriptions for academic programs.",
    "Authenticated (notarized/certified) copies of signed agreements and/or MoUs.",
    "Training contracts for hospitals.",
    "Other supporting documents, if any."
    };

            model.Rows ??= new List<AttachmentRowDto>();
            return model;
        }

        private void SaveAttachmentsToSession(AttachmentDto dto)
        {
            HttpContext.Session.SetString("Attachments", JsonSerializer.Serialize(dto));
        }

        private string EnsureAttachmentFolder()
        {
            var folder = Path.Combine(_env.WebRootPath, "uploads", "attachments");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            return folder;
        }

        [HttpGet]
        public IActionResult AttachmentsPartial()
        {
            var model = LoadAttachments();
            return PartialView("Partial_Views/_Attachments", model);
        }


        [HttpPost]
        public async Task<IActionResult> UploadAttachment(IFormFile file, string subject)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please choose a file.");

            if (string.IsNullOrWhiteSpace(subject))
                return BadRequest("Please enter the subject.");

            var model = LoadAttachments();

            var folder = EnsureAttachmentFolder();
            var ext = Path.GetExtension(file.FileName);
            var safeFileName = Path.GetFileName(file.FileName);
            var storedFileName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(folder, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            model.Rows.Add(new AttachmentRowDto
            {
                Id = Guid.NewGuid().ToString(),
                Subject = subject.Trim(),
                FileName = safeFileName,
                StoredFileName = storedFileName,
                FileUrl = $"/uploads/attachments/{storedFileName}",
                ContentType = file.ContentType ?? "application/octet-stream",
                UploadedAt = DateTime.UtcNow
            });

            SaveAttachmentsToSession(model);

            return PartialView("Partial_Views/_Attachments", model);
        }

        [HttpPost]
        public IActionResult DeleteAttachment(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid attachment id.");

            var model = LoadAttachments();
            var row = model.Rows.FirstOrDefault(x => x.Id == id);

            if (row == null)
                return BadRequest("Attachment was not found.");

            var folder = EnsureAttachmentFolder();
            var fullPath = Path.Combine(folder, row.StoredFileName ?? "");

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            model.Rows.Remove(row);
            SaveAttachmentsToSession(model);

            return PartialView("Partial_Views/_Attachments", model);
        }


        // ============================================================
        // Pictures(Session Helpers + AJAX Endpoints)
        // ============================================================
        private PicturesDto LoadPictures()
        {
            var json = HttpContext.Session.GetString("Pictures");
            var model = string.IsNullOrWhiteSpace(json)
                ? new PicturesDto()
                : (JsonSerializer.Deserialize<PicturesDto>(json) ?? new PicturesDto());

            model.Rows ??= new List<PictureRowDto>();
            return model;
        }

        private void SavePicturesToSession(PicturesDto dto)
        {
            HttpContext.Session.SetString("Pictures", JsonSerializer.Serialize(dto));
        }

        private string EnsurePicturesFolder()
        {
            var folder = Path.Combine(_env.WebRootPath, "uploads", "pictures");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            return folder;
        }


        [HttpGet]
        public IActionResult PicturesPartial()
        {
            var model = LoadPictures();
            return PartialView("Partial_Views/_Pictures", model);
        }

        [HttpPost]
        public async Task<IActionResult> UploadPicture(IFormFile file, string subject)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please choose a picture.");

            if (string.IsNullOrWhiteSpace(subject))
                return BadRequest("Please enter the subject.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(ext) || !allowedExtensions.Contains(ext))
                return BadRequest("Only image files are allowed.");

            var model = LoadPictures();

            var folder = EnsurePicturesFolder();
            var safeFileName = Path.GetFileName(file.FileName);
            var storedFileName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(folder, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            model.Rows.Add(new PictureRowDto
            {
                Id = Guid.NewGuid().ToString(),
                Subject = subject.Trim(),
                FileName = safeFileName,
                StoredFileName = storedFileName,
                FileUrl = $"/uploads/pictures/{storedFileName}",
                ContentType = file.ContentType ?? "application/octet-stream",
                UploadedAt = DateTime.UtcNow
            });

            SavePicturesToSession(model);

            return PartialView("Partial_Views/_Pictures", model);
        }

        [HttpPost]
        public IActionResult DeletePicture(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid picture id.");

            var model = LoadPictures();
            var row = model.Rows.FirstOrDefault(x => x.Id == id);

            if (row == null)
                return BadRequest("Picture was not found.");

            var folder = EnsurePicturesFolder();
            var fullPath = Path.Combine(folder, row.StoredFileName ?? "");

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            model.Rows.Remove(row);
            SavePicturesToSession(model);

            return PartialView("Partial_Views/_Pictures", model);
        }


        // ============================================================
        // Submit(Session Helpers + AJAX Endpoints)
        // ============================================================

        private SubmitApplicationDto LoadSubmitApplication()
        {
            var json = HttpContext.Session.GetString("SubmitApplication");
            return string.IsNullOrWhiteSpace(json)
                ? new SubmitApplicationDto()
                : (JsonSerializer.Deserialize<SubmitApplicationDto>(json) ?? new SubmitApplicationDto());
        }

        private void SaveSubmitApplicationToSession(SubmitApplicationDto dto)
        {
            HttpContext.Session.SetString("SubmitApplication", JsonSerializer.Serialize(dto));
        }

        [HttpGet]
        public IActionResult SubmitApplicationPartial()
        {
            var model = LoadSubmitApplication();
            return PartialView("Partial_Views/_SubmitApplication", model);
        }

        [HttpPost]
        public IActionResult SaveSubmitApplication(SubmitApplicationDto dto)
        {
            if (dto == null)
                return BadRequest("No data was received.");

            if (string.IsNullOrWhiteSpace(dto.ApplicantName) ||
                string.IsNullOrWhiteSpace(dto.WorkPlace) ||
                string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest("Please fill all required fields.");
            }

            if (!dto.IsAcknowledged)
                return BadRequest("Please confirm that all data are correct.");

            // If already submitted in this session, do not create duplicates
            var existingRequest = GetSubmittedRequestFromSession();
            if (existingRequest != null)
            {
                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("UniStatus", "Home")
                });
            }

            SaveSubmitApplicationToSession(dto);

            HttpContext.Session.SetString("ApplicationSubmitted", "true");

            var publicJson = HttpContext.Session.GetString("PublicInfo");
            var academicJson = HttpContext.Session.GetString("AcademicInfo");
            var signupCountry = HttpContext.Session.GetString("SignupCountry") ?? "";
            var recognitionNumber = HttpContext.Session.GetString("RecognitionNumber") ?? "";

            PublicInfoDto publicInfo = string.IsNullOrWhiteSpace(publicJson)
                ? new PublicInfoDto()
                : (JsonSerializer.Deserialize<PublicInfoDto>(publicJson) ?? new PublicInfoDto());

            AcademicInfoDto academicInfo = string.IsNullOrWhiteSpace(academicJson)
                ? new AcademicInfoDto()
                : (JsonSerializer.Deserialize<AcademicInfoDto>(academicJson) ?? new AcademicInfoDto());

            var request = new RecognitionRequestRecord
            {
                RecognitionNumber = recognitionNumber,
                UniversityName = string.IsNullOrWhiteSpace(publicInfo.InstitutionName) ? "Unknown University" : publicInfo.InstitutionName,
                Country = string.IsNullOrWhiteSpace(signupCountry) ? "Unknown" : signupCountry,
                UniversityEmail = string.IsNullOrWhiteSpace(publicInfo.EmailAddress) ? dto.Email : publicInfo.EmailAddress,

                ApplicantName = dto.ApplicantName,
                WorkPlace = dto.WorkPlace,
                ApplicantEmail = dto.Email,

                AssignedMember = "Unassigned",
                Status = "Pending",
                Year = DateTime.Now.Year,
                SubmittedAt = DateTime.Now,

                PublicInfo = publicInfo,
                AcademicInfo = academicInfo,
                SubmitApplication = dto
            };

            var saved = _recognitionRequestService.Add(request);

            HttpContext.Session.SetString("SubmittedRequestId", saved.Id.ToString());
            HttpContext.Session.SetString("SubmittedReferenceNumber", saved.ReferenceNumber);

            return Json(new
            {
                success = true,
                redirectUrl = Url.Action("UniStatus", "Home")
            });
        }
        // ============================================================
        // LogOut
        // ============================================================

        [HttpGet]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Role");
        }
        //###################################################





        ///////////////////////NewUniAccount/////////
        [HttpGet]
        public IActionResult NewUniAccount()
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "countries.json");

            var countries = new List<string>();

            if (System.IO.File.Exists(path))
            {
                var json = System.IO.File.ReadAllText(path);
                countries = JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }

            ViewBag.Countries = countries;
            return View("~/Views/Home/NewUniAccount.cshtml");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult NewUniAccount(string Institution, string Country, string Email, string Password, string ConfirmPassword, bool Agree)
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "countries.json");
            var countries = new List<string>();

            if (System.IO.File.Exists(path))
            {
                var json = System.IO.File.ReadAllText(path);
                countries = JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }

            ViewBag.Countries = countries;

            if (!Agree)
            {
                ViewBag.ErrorMessage = "You must agree that the information is valid.";
                return View("~/Views/Home/NewUniAccount.cshtml");
            }

            if (Password != ConfirmPassword)
            {
                ViewBag.ErrorMessage = "Passwords do not match. Please re-enter them.";
                return View("~/Views/Home/NewUniAccount.cshtml");
            }

            var passwordOk = Regex.IsMatch(Password ?? "", @"^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$");

            if (!passwordOk)
            {
                ViewBag.ErrorMessage = "Password must be at least 8 characters and include 1 uppercase letter and 1 special character.";
                return View("~/Views/Home/NewUniAccount.cshtml");
            }
            HttpContext.Session.SetString("SignupCountry", Country ?? "");
            return RedirectToAction("UniDashboard", "Home");
        }

        ///////////////////////UniStatus/////////
        public IActionResult UniStatus()
        {
            var request = GetSubmittedRequestFromSession();

            ViewBag.HasRequest = request != null;
            ViewBag.RequestNumber = request?.ReferenceNumber ?? "";
            ViewBag.SubmittedOn = request?.SubmittedAt.ToString("yyyy/MM/dd") ?? "";
            ViewBag.StatusText = request?.Status ?? "No Request";
            ViewBag.UniversityName = request?.UniversityName ?? "University Account";
            ViewBag.UniversityEmail = request?.UniversityEmail ?? (HttpContext.Session.GetString("UniversityEmail") ?? "");

            return View("~/Views/uni/UniStatus.cshtml");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }



        /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///  /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///  INMemory helper methods
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////



        private int? GetSubmittedRequestIdFromSession()
        {
            var raw = HttpContext.Session.GetString("SubmittedRequestId");
            if (int.TryParse(raw, out var id))
                return id;

            return null;
        }

        private RecognitionRequestRecord? GetSubmittedRequestFromSession()
        {
            var id = GetSubmittedRequestIdFromSession();
            if (id == null) return null;

            return _recognitionRequestService.GetById(id.Value);
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult RequireAdminReview(int id)
        {
            var request = _recognitionRequestService.GetById(id);

            if (!IsCurrentRecognitionMemberOwner(request))
            {
                TempData["ArchiveError"] = "You can only request admin review for requests assigned to you.";
                return RedirectToAction("Archive");
            }

            _recognitionRequestService.RequireAdminReview(id);
            TempData["ArchiveSuccess"] = "The request was successfully sent to admin for review.";

            return RedirectToAction("Archive");
        }


        private string GetCurrentRecognitionMember()
        {
            var raw = HttpContext.Session.GetString("CurrentRecognitionMember") ?? "";
            return NormalizeRecognitionMemberIdentity(raw);
        }

        private bool IsCurrentRecognitionMemberOwner(RecognitionRequestRecord? request)
        {
            if (request == null) return false;

            var currentMember = GetCurrentRecognitionMember();
            if (string.IsNullOrWhiteSpace(currentMember)) return false;

            return string.Equals(
                request.AssignedMember ?? "",
                currentMember,
                StringComparison.OrdinalIgnoreCase
            );
        }

        private static string NormalizeRecognitionMemberIdentity(string? value)
        {
            var normalized = (value ?? "").Trim().ToLowerInvariant();

            return normalized switch
            {
                "member1@mohe.local" => "member1@mohe.local",
                "member2@mohe.local" => "member2@mohe.local",
                "member3@mohe.local" => "member3@mohe.local",
                _ => ""
            };
        }

        private static string GetRecognitionMemberDisplayName(string? value)
        {
            var normalized = NormalizeRecognitionMemberIdentity(value);

            return normalized switch
            {
                "member1@mohe.local" => "Recognition Member 1",
                "member2@mohe.local" => "Recognition Member 2",
                "member3@mohe.local" => "Recognition Member 3",
                _ => "Recognition Member"
            };
        }


        /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///  /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///  Doctorssssssssssssssssssssss
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////
        public IActionResult AdminDashboard()
        {
            var model = _recognitionRequestService.GetAll();
            return View("~/Views/admin/AdminDashboard.cshtml", model);
        }
        [HttpGet]
        public IActionResult Archive()
        {
            var model = _recognitionRequestService.GetAll();

            ViewBag.CurrentRecognitionMember = GetRecognitionMemberDisplayName(GetCurrentRecognitionMember());

            return View("~/Views/member/Archive.cshtml", model);
        }


        [HttpGet]
        public IActionResult RecognitionMemberDashboard()
        {
            var currentMember = GetCurrentRecognitionMember();

            var assignedToCurrentMember = _recognitionRequestService
                .GetAll()
                .Where(x => string.Equals(x.AssignedMember, currentMember, StringComparison.OrdinalIgnoreCase))
                .ToList();

            ViewBag.CurrentRecognitionMember = GetRecognitionMemberDisplayName(currentMember);

            ViewBag.TotalRequests = assignedToCurrentMember.Count;
            ViewBag.PendingCount = assignedToCurrentMember.Count(x =>
                x.Status == "Pending" || x.Status == "Assigned");
            ViewBag.ApprovedCount = assignedToCurrentMember.Count(x => x.Status == "Approved");
            ViewBag.RejectedCount = assignedToCurrentMember.Count(x => x.Status == "Rejected");
            ViewBag.MissingDocsCount = assignedToCurrentMember.Count(x => x.Status == "Missing Docs");

            return View("~/Views/member/RecognitionMemberDashboard.cshtml", assignedToCurrentMember);
        }

        [HttpGet]
        public IActionResult ElectronicRequests()
        {
            var currentMember = GetCurrentRecognitionMember();

            var model = _recognitionRequestService
                .GetAll()
                .Where(x => string.Equals(x.AssignedMember, currentMember, StringComparison.OrdinalIgnoreCase))
                .ToList();

            ViewBag.CurrentRecognitionMember = GetRecognitionMemberDisplayName(currentMember);

            return View("~/Views/member/ElectronicRequests.cshtml", model);
        }

        [HttpGet]
        public IActionResult DetailsBasicInfo(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";

            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase))
            {
                if (!IsCurrentRecognitionMemberOwner(request))
                    return RedirectToAction("ElectronicRequests");
            }

            return View("~/Views/member/DetailsBasicInfo.cshtml", request);
        }

        [HttpGet]
        public IActionResult DetailsInfrastructure(int? id)
        {
            ViewBag.RequestId = id ?? 0;
            ViewBag.InstitutionName = "University Request";
            return View("~/Views/member/DetailsInfrastructure.cshtml");
        }

        [HttpGet]
        public IActionResult DetailsRankings(int? id)
        {
            ViewBag.RequestId = id ?? 0;
            ViewBag.InstitutionName = "University Request";
            return View("~/Views/member/DetailsRankings.cshtml");
        }

        [HttpGet]
        public IActionResult DetailsRecommendation(int? id)
        {
            ViewBag.RequestId = id ?? 0;
            ViewBag.InstitutionName = "University Request";
            return View("~/Views/member/DetailsRecommendation.cshtml");
        }

        [HttpGet]
        public IActionResult DetailsStatistics(int? id)
        {
            ViewBag.RequestId = id ?? 0;
            ViewBag.InstitutionName = "University Request";
            return View("~/Views/member/DetailsStatistics.cshtml");
        }

        /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///  /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///  DataFLowwwww
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///   /// ///////////////////////////////////////////////////////////////////////////////////////////
        ///   /// /////////////////////////////////////////////////////////////////////////////////////////// 
        ///   

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AssignToMember(int id, string assignedMember)
        {
            if (id <= 0)
                return RedirectToAction("AdminDashboard");

            var normalizedMember = NormalizeRecognitionMemberIdentity(assignedMember);
            var valueToStore = string.IsNullOrWhiteSpace(normalizedMember) ? "Unassigned" : normalizedMember;

            _recognitionRequestService.AssignMember(id, valueToStore);

            return RedirectToAction("AdminDashboard");
        }











    }
}