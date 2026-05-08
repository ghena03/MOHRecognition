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
    //kameliaaaa9 .
{
   
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _env;
        private readonly IRecognitionRequestService _recognitionRequestService;
        private Dictionary<string, List<string>>? _citiesCache;

        private static List<EmployeeDto> employees = new List<EmployeeDto>
{
    new EmployeeDto { Id = 1, Name = "Minister of Higher Education", Email = "minister@mohe.gov.jo" },
    new EmployeeDto { Id = 2, Name = "Director of Recognition", Email = "director.recognition@mohe.gov.jo" },

    new EmployeeDto { Id = 3, Name = "Ahmad Al-Khalil", Email = "ahmad.khalil@mohe.gov.jo" },
    new EmployeeDto { Id = 4, Name = "Sara Haddad", Email = "sara.haddad@mohe.gov.jo" },
    new EmployeeDto { Id = 5, Name = "Omar Nasser", Email = "omar.nasser@mohe.gov.jo" },
    new EmployeeDto { Id = 6, Name = "Lina Qasem", Email = "lina.qasem@mohe.gov.jo" },
    new EmployeeDto { Id = 7, Name = "Yousef Saleh", Email = "yousef.saleh@mohe.gov.jo" },
    new EmployeeDto { Id = 8, Name = "Rana Majed", Email = "rana.majed@mohe.gov.jo" }
};
        // Load cities from JSON file
        private Dictionary<string, List<string>> GetCitiesDictionary()
        {
            if (_citiesCache != null)
                return _citiesCache;

            try
            {
                var jsonPath = Path.Combine(_env.WebRootPath, "Data", "cities.json");
                var json = System.IO.File.ReadAllText(jsonPath);
                _citiesCache = JsonSerializer.Deserialize<Dictionary<string, List<string>>>(json) 
                    ?? new Dictionary<string, List<string>>();
            }
            catch
            {
                _citiesCache = new Dictionary<string, List<string>>();
            }

            return _citiesCache;
        }

        public HomeController(IWebHostEnvironment env, IRecognitionRequestService recognitionRequestService)
        {
            _env = env;
            _recognitionRequestService = recognitionRequestService;
        }
        [HttpPost]
        public IActionResult GetCitiesByCountry([FromBody] CountryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Country))
                return Json(new List<string>());

            var cities = GetCitiesDictionary();
            
            if (cities.TryGetValue(request.Country, out var cityList))
            {
                var result = cityList.ToList();
                result.Add("Other (Please specify)");
                return Json(result);
            }

            return Json(new List<string> { "Other (Please specify)" });
        }

        public class CountryRequest
        {
            public string Country { get; set; } = "";
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
        public IActionResult StaffLogIn(StaffLogInDto model, string GeneratedCaptcha, string role = "admin")
        {
            ViewBag.Role = role;

            if (!ModelState.IsValid)
                return View("~/Views/Home/StaffLogIn.cshtml", model);

            if (string.IsNullOrWhiteSpace(model.Captcha) ||
                string.IsNullOrWhiteSpace(GeneratedCaptcha) ||
                model.Captcha.ToUpper() != GeneratedCaptcha.ToUpper())
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
                    ModelState.AddModelError("", "Invalid member email.");
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

            return RedirectToAction("UniStatus", "Home");
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
            ViewBag.AcademicRankStaffFiles = BuildAcademicRankStaffFileNameMap(a);

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
            faculties.AvailableCollegeCategories = GetCollegeCategoriesFromSession();
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

            // ================== Infrastructure(section ) ==================
            var infrastructureJson = HttpContext.Session.GetString("Infrastructure");
            InfrastructureDto infrastructure = string.IsNullOrWhiteSpace(infrastructureJson)
                ? new InfrastructureDto()
                : (JsonSerializer.Deserialize<InfrastructureDto>(infrastructureJson) ?? new InfrastructureDto());

            ViewBag.Infrastructure = infrastructure;

            // ================== Librarye(section ) ==================
            ViewBag.Library = LoadLibrary();
            // ================== Pictures(section ) ==================
            ViewBag.Pictures = LoadPictures();
            ViewBag.Laboratories = LoadLaboratoriesData();
            // ================== Accreditation Bodies(section ) ==================
            ViewBag.AccreditationBodies = LoadAccreditationBodies();
            // ================== Submit(section ) ==================
            ViewBag.SubmitApplication = LoadSubmitApplication();
            return View("~/Views/uni/UniDashboard.cshtml");
        }

        [HttpGet]
        public IActionResult UniDashboardDoctors()
        {
            return Redirect(Url.Action("UniDashboard", "Home") + "#sec-med");
        }

        ///////////////////////PublicInfo/////////
        [HttpPost]
        public IActionResult SavePublicInfo(PublicInfoDto dto)
        {
            dto ??= new PublicInfoDto();
            if (string.IsNullOrWhiteSpace(dto.City))
            {
                dto.City = HttpContext.Session.GetString("SignupCity") ?? "";
            }

            if (string.Equals(dto.LanguageOfInstruction, "Others", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(dto.LanguageOfInstructionOther))
                    return BadRequest("LanguageOfInstructionOther is required.");

                dto.LanguageOfInstruction = dto.LanguageOfInstructionOther.Trim();
            }
            else
            {
                dto.LanguageOfInstructionOther = "";
            }

            // Required fields (must match input "name" attributes in Public Info section)
            var required = new[]
            {
"InstitutionName",
"FoundationDate",
"DateOfEstablishment",
"StartOfTeaching",
"ModeOfStudy",
"LanguageOfInstruction",
"MailingFullAddress",
"DirectPhoneNumber",
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
            dto ??= new PublicInfoDto();
            if (string.IsNullOrWhiteSpace(dto.City))
            {
                dto.City = HttpContext.Session.GetString("SignupCity") ?? "";
            }

            if (string.Equals(dto.LanguageOfInstruction, "Others", StringComparison.OrdinalIgnoreCase))
            {
                dto.LanguageOfInstruction = (dto.LanguageOfInstructionOther ?? "").Trim();
            }
            else
            {
                dto.LanguageOfInstructionOther = "";
            }

            var json = JsonSerializer.Serialize(dto ?? new PublicInfoDto());
            HttpContext.Session.SetString("PublicInfo", json);
            return Ok();
        }

        ///////////////////////AcademicInfo/////////
        [HttpPost]
        public IActionResult SaveAcademicInfo(AcademicInfoDto dto)
        {
            dto ??= new AcademicInfoDto();
            var existingAcademic = LoadAcademicInfoFromSession();
            CopyRankExcelFiles(existingAcademic, dto);

            int Safe(int? v) => Math.Max(0, v ?? 0);

            dto.StaffProfessor = Safe(dto.StaffProfessorFullTimeCount) + Safe(dto.StaffProfessorPartTimeCount);
            dto.StaffAssociateProfessor = Safe(dto.StaffAssociateProfessorFullTimeCount) + Safe(dto.StaffAssociateProfessorPartTimeCount);
            dto.StaffAssistantProfessor = Safe(dto.StaffAssistantProfessorFullTimeCount) + Safe(dto.StaffAssistantProfessorPartTimeCount);
            dto.StaffResearcher = Safe(dto.StaffResearcherFullTimeCount) + Safe(dto.StaffResearcherPartTimeCount);
            dto.StaffTeacher = Safe(dto.StaffTeacherFullTimeCount) + Safe(dto.StaffTeacherPartTimeCount);
            dto.StaffAssistantTeacher = Safe(dto.StaffAssistantTeacherFullTimeCount) + Safe(dto.StaffAssistantTeacherPartTimeCount);
            dto.StaffOthers = Safe(dto.StaffOthersFullTimeCount) + Safe(dto.StaffOthersPartTimeCount);
            dto.StaffPractitionerPsc = Safe(dto.StaffPractitionerPscFullTimeCount) + Safe(dto.StaffPractitionerPscPartTimeCount);
            dto.StaffPractitionerMsc = Safe(dto.StaffPractitionerMscFullTimeCount) + Safe(dto.StaffPractitionerMscPartTimeCount);
            dto.FullTimeFacultyCount =
                Safe(dto.StaffProfessorFullTimeCount) +
                Safe(dto.StaffAssociateProfessorFullTimeCount) +
                Safe(dto.StaffAssistantProfessorFullTimeCount) +
                Safe(dto.StaffResearcherFullTimeCount) +
                Safe(dto.StaffTeacherFullTimeCount) +
                Safe(dto.StaffAssistantTeacherFullTimeCount) +
                Safe(dto.StaffOthersFullTimeCount) +
                Safe(dto.StaffPractitionerPscFullTimeCount) +
                Safe(dto.StaffPractitionerMscFullTimeCount);
            dto.PartTimeFacultyCount =
                Safe(dto.StaffProfessorPartTimeCount) +
                Safe(dto.StaffAssociateProfessorPartTimeCount) +
                Safe(dto.StaffAssistantProfessorPartTimeCount) +
                Safe(dto.StaffResearcherPartTimeCount) +
                Safe(dto.StaffTeacherPartTimeCount) +
                Safe(dto.StaffAssistantTeacherPartTimeCount) +
                Safe(dto.StaffOthersPartTimeCount) +
                Safe(dto.StaffPractitionerPscPartTimeCount) +
                Safe(dto.StaffPractitionerMscPartTimeCount);

            var totalPhdHolders = (decimal)(
                Safe(dto.StaffProfessorFullTimeCount) +
                Safe(dto.StaffAssociateProfessorFullTimeCount) +
                Safe(dto.StaffAssistantProfessorFullTimeCount) +
                Safe(dto.StaffTeacherFullTimeCount));
            var allowedMscSupport = Math.Ceiling(totalPhdHolders * 0.20m);
            var actualMscSupport = (decimal)(
                Safe(dto.StaffAssistantTeacherFullTimeCount) +
                Safe(dto.StaffOthersFullTimeCount));
            var mscSupportUsed = Math.Min(allowedMscSupport, actualMscSupport);
            var totalFacultyForRatio = totalPhdHolders + (totalPhdHolders * 0.10m) + mscSupportUsed;
            var totalStudents = (decimal)Safe(dto.TotalStudentPopulation);
            dto.StudentsToFacultyRatio = totalFacultyForRatio > 0
                ? Math.Ceiling(totalStudents / totalFacultyForRatio)
                : 0m;

            if (string.Equals(dto.TypeOfAcademicInstitution, "Others", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(dto.TypeOfAcademicInstitutionOther))
                    return BadRequest("TypeOfAcademicInstitutionOther is required.");

                dto.TypeOfAcademicInstitution = dto.TypeOfAcademicInstitutionOther.Trim();
            }
            else
            {
                dto.TypeOfAcademicInstitutionOther = "";
            }

            // Required fields (must match the input "name" attributes in the Academic section)
            var required = new[]
            {
        "TypeOfAcademicInstitution",
        "OfficialRecognitionInHomeCountry",
        "OfficialAccreditationQualityInHomeCountry",
        "CollegeCategoriesCsv",
        "JordanianStudentPopulation",
        "TotalStudentPopulation"
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
            dto ??= new AcademicInfoDto();
            var existingAcademic = LoadAcademicInfoFromSession();
            CopyRankExcelFiles(existingAcademic, dto);

            if (string.Equals(dto.TypeOfAcademicInstitution, "Others", StringComparison.OrdinalIgnoreCase))
            {
                dto.TypeOfAcademicInstitution = (dto.TypeOfAcademicInstitutionOther ?? "").Trim();
            }
            else
            {
                dto.TypeOfAcademicInstitutionOther = "";
            }

            var json = JsonSerializer.Serialize(dto ?? new AcademicInfoDto());
            HttpContext.Session.SetString("AcademicInfo", json);
            return Ok();
        }

        private AcademicInfoDto LoadAcademicInfoFromSession()
        {
            var academicJson = HttpContext.Session.GetString("AcademicInfo");
            return string.IsNullOrWhiteSpace(academicJson)
                ? new AcademicInfoDto()
                : (JsonSerializer.Deserialize<AcademicInfoDto>(academicJson) ?? new AcademicInfoDto());
        }

        private List<string> GetCollegeCategoriesFromSession()
        {
            var academic = LoadAcademicInfoFromSession();
            return (academic.CollegeCategoriesCsv ?? "")
                .Split(';', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();
        }

        private void SaveAcademicInfoToSession(AcademicInfoDto dto)
        {
            HttpContext.Session.SetString("AcademicInfo", JsonSerializer.Serialize(dto ?? new AcademicInfoDto()));
        }

        private void CopyRankExcelFiles(AcademicInfoDto from, AcademicInfoDto to)
        {
            to.ProfessorFullTimeExcelFile = from.ProfessorFullTimeExcelFile;
            to.ProfessorFullTimeExcelFileName = from.ProfessorFullTimeExcelFileName;
            to.ProfessorPartTimeExcelFile = from.ProfessorPartTimeExcelFile;
            to.ProfessorPartTimeExcelFileName = from.ProfessorPartTimeExcelFileName;

            to.AssociateProfessorFullTimeExcelFile = from.AssociateProfessorFullTimeExcelFile;
            to.AssociateProfessorFullTimeExcelFileName = from.AssociateProfessorFullTimeExcelFileName;
            to.AssociateProfessorPartTimeExcelFile = from.AssociateProfessorPartTimeExcelFile;
            to.AssociateProfessorPartTimeExcelFileName = from.AssociateProfessorPartTimeExcelFileName;

            to.AssistantProfessorFullTimeExcelFile = from.AssistantProfessorFullTimeExcelFile;
            to.AssistantProfessorFullTimeExcelFileName = from.AssistantProfessorFullTimeExcelFileName;
            to.AssistantProfessorPartTimeExcelFile = from.AssistantProfessorPartTimeExcelFile;
            to.AssistantProfessorPartTimeExcelFileName = from.AssistantProfessorPartTimeExcelFileName;

            to.ResearcherFullTimeExcelFile = from.ResearcherFullTimeExcelFile;
            to.ResearcherFullTimeExcelFileName = from.ResearcherFullTimeExcelFileName;
            to.ResearcherPartTimeExcelFile = from.ResearcherPartTimeExcelFile;
            to.ResearcherPartTimeExcelFileName = from.ResearcherPartTimeExcelFileName;

            to.TeacherFullTimeExcelFile = from.TeacherFullTimeExcelFile;
            to.TeacherFullTimeExcelFileName = from.TeacherFullTimeExcelFileName;
            to.TeacherPartTimeExcelFile = from.TeacherPartTimeExcelFile;
            to.TeacherPartTimeExcelFileName = from.TeacherPartTimeExcelFileName;

            to.AssistantTeacherFullTimeExcelFile = from.AssistantTeacherFullTimeExcelFile;
            to.AssistantTeacherFullTimeExcelFileName = from.AssistantTeacherFullTimeExcelFileName;
            to.AssistantTeacherPartTimeExcelFile = from.AssistantTeacherPartTimeExcelFile;
            to.AssistantTeacherPartTimeExcelFileName = from.AssistantTeacherPartTimeExcelFileName;

            to.OthersFullTimeExcelFile = from.OthersFullTimeExcelFile;
            to.OthersFullTimeExcelFileName = from.OthersFullTimeExcelFileName;
            to.OthersPartTimeExcelFile = from.OthersPartTimeExcelFile;
            to.OthersPartTimeExcelFileName = from.OthersPartTimeExcelFileName;

            to.PractitionerPscFullTimeExcelFile = from.PractitionerPscFullTimeExcelFile;
            to.PractitionerPscFullTimeExcelFileName = from.PractitionerPscFullTimeExcelFileName;
            to.PractitionerPscPartTimeExcelFile = from.PractitionerPscPartTimeExcelFile;
            to.PractitionerPscPartTimeExcelFileName = from.PractitionerPscPartTimeExcelFileName;

            to.PractitionerMscFullTimeExcelFile = from.PractitionerMscFullTimeExcelFile;
            to.PractitionerMscFullTimeExcelFileName = from.PractitionerMscFullTimeExcelFileName;
            to.PractitionerMscPartTimeExcelFile = from.PractitionerMscPartTimeExcelFile;
            to.PractitionerMscPartTimeExcelFileName = from.PractitionerMscPartTimeExcelFileName;
        }

        private Dictionary<string, string> BuildAcademicRankStaffFileNameMap(AcademicInfoDto a)
        {
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Professor:fulltime"] = a.ProfessorFullTimeExcelFileName ?? "",
                ["Professor:parttime"] = a.ProfessorPartTimeExcelFileName ?? "",
                ["AssociateProfessor:fulltime"] = a.AssociateProfessorFullTimeExcelFileName ?? "",
                ["AssociateProfessor:parttime"] = a.AssociateProfessorPartTimeExcelFileName ?? "",
                ["AssistantProfessor:fulltime"] = a.AssistantProfessorFullTimeExcelFileName ?? "",
                ["AssistantProfessor:parttime"] = a.AssistantProfessorPartTimeExcelFileName ?? "",
                ["Researcher:fulltime"] = a.ResearcherFullTimeExcelFileName ?? "",
                ["Researcher:parttime"] = a.ResearcherPartTimeExcelFileName ?? "",
                ["Teacher:fulltime"] = a.TeacherFullTimeExcelFileName ?? "",
                ["Teacher:parttime"] = a.TeacherPartTimeExcelFileName ?? "",
                ["AssistantTeacher:fulltime"] = a.AssistantTeacherFullTimeExcelFileName ?? "",
                ["AssistantTeacher:parttime"] = a.AssistantTeacherPartTimeExcelFileName ?? "",
                ["Others:fulltime"] = a.OthersFullTimeExcelFileName ?? "",
                ["Others:parttime"] = a.OthersPartTimeExcelFileName ?? "",
                ["PractitionerPsc:fulltime"] = a.PractitionerPscFullTimeExcelFileName ?? "",
                ["PractitionerPsc:parttime"] = a.PractitionerPscPartTimeExcelFileName ?? "",
                ["PractitionerMsc:fulltime"] = a.PractitionerMscFullTimeExcelFileName ?? "",
                ["PractitionerMsc:parttime"] = a.PractitionerMscPartTimeExcelFileName ?? ""
            };
        }

        private void SetAcademicRankFile(AcademicInfoDto academic, string rankKey, string employmentType, string fileName, string fileContentBase64)
        {
            var fullTime = employmentType.Equals("fulltime", StringComparison.OrdinalIgnoreCase);

            switch (rankKey)
            {
                case "Professor":
                    if (fullTime)
                    {
                        academic.ProfessorFullTimeExcelFileName = fileName;
                        academic.ProfessorFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.ProfessorPartTimeExcelFileName = fileName;
                        academic.ProfessorPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "AssociateProfessor":
                    if (fullTime)
                    {
                        academic.AssociateProfessorFullTimeExcelFileName = fileName;
                        academic.AssociateProfessorFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.AssociateProfessorPartTimeExcelFileName = fileName;
                        academic.AssociateProfessorPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "AssistantProfessor":
                    if (fullTime)
                    {
                        academic.AssistantProfessorFullTimeExcelFileName = fileName;
                        academic.AssistantProfessorFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.AssistantProfessorPartTimeExcelFileName = fileName;
                        academic.AssistantProfessorPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "Researcher":
                    if (fullTime)
                    {
                        academic.ResearcherFullTimeExcelFileName = fileName;
                        academic.ResearcherFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.ResearcherPartTimeExcelFileName = fileName;
                        academic.ResearcherPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "Teacher":
                    if (fullTime)
                    {
                        academic.TeacherFullTimeExcelFileName = fileName;
                        academic.TeacherFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.TeacherPartTimeExcelFileName = fileName;
                        academic.TeacherPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "AssistantTeacher":
                    if (fullTime)
                    {
                        academic.AssistantTeacherFullTimeExcelFileName = fileName;
                        academic.AssistantTeacherFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.AssistantTeacherPartTimeExcelFileName = fileName;
                        academic.AssistantTeacherPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "Others":
                    if (fullTime)
                    {
                        academic.OthersFullTimeExcelFileName = fileName;
                        academic.OthersFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.OthersPartTimeExcelFileName = fileName;
                        academic.OthersPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "PractitionerPsc":
                    if (fullTime)
                    {
                        academic.PractitionerPscFullTimeExcelFileName = fileName;
                        academic.PractitionerPscFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.PractitionerPscPartTimeExcelFileName = fileName;
                        academic.PractitionerPscPartTimeExcelFile = fileContentBase64;
                    }
                    break;
                case "PractitionerMsc":
                    if (fullTime)
                    {
                        academic.PractitionerMscFullTimeExcelFileName = fileName;
                        academic.PractitionerMscFullTimeExcelFile = fileContentBase64;
                    }
                    else
                    {
                        academic.PractitionerMscPartTimeExcelFileName = fileName;
                        academic.PractitionerMscPartTimeExcelFile = fileContentBase64;
                    }
                    break;
            }
        }

        private (string fileName, string fileContentBase64) GetAcademicRankFile(AcademicInfoDto academic, string rankKey, string employmentType)
        {
            var fullTime = employmentType.Equals("fulltime", StringComparison.OrdinalIgnoreCase);

            return rankKey switch
            {
                "Professor" => fullTime
                    ? (academic.ProfessorFullTimeExcelFileName ?? "", academic.ProfessorFullTimeExcelFile ?? "")
                    : (academic.ProfessorPartTimeExcelFileName ?? "", academic.ProfessorPartTimeExcelFile ?? ""),
                "AssociateProfessor" => fullTime
                    ? (academic.AssociateProfessorFullTimeExcelFileName ?? "", academic.AssociateProfessorFullTimeExcelFile ?? "")
                    : (academic.AssociateProfessorPartTimeExcelFileName ?? "", academic.AssociateProfessorPartTimeExcelFile ?? ""),
                "AssistantProfessor" => fullTime
                    ? (academic.AssistantProfessorFullTimeExcelFileName ?? "", academic.AssistantProfessorFullTimeExcelFile ?? "")
                    : (academic.AssistantProfessorPartTimeExcelFileName ?? "", academic.AssistantProfessorPartTimeExcelFile ?? ""),
                "Researcher" => fullTime
                    ? (academic.ResearcherFullTimeExcelFileName ?? "", academic.ResearcherFullTimeExcelFile ?? "")
                    : (academic.ResearcherPartTimeExcelFileName ?? "", academic.ResearcherPartTimeExcelFile ?? ""),
                "Teacher" => fullTime
                    ? (academic.TeacherFullTimeExcelFileName ?? "", academic.TeacherFullTimeExcelFile ?? "")
                    : (academic.TeacherPartTimeExcelFileName ?? "", academic.TeacherPartTimeExcelFile ?? ""),
                "AssistantTeacher" => fullTime
                    ? (academic.AssistantTeacherFullTimeExcelFileName ?? "", academic.AssistantTeacherFullTimeExcelFile ?? "")
                    : (academic.AssistantTeacherPartTimeExcelFileName ?? "", academic.AssistantTeacherPartTimeExcelFile ?? ""),
                "Others" => fullTime
                    ? (academic.OthersFullTimeExcelFileName ?? "", academic.OthersFullTimeExcelFile ?? "")
                    : (academic.OthersPartTimeExcelFileName ?? "", academic.OthersPartTimeExcelFile ?? ""),
                "PractitionerPsc" => fullTime
                    ? (academic.PractitionerPscFullTimeExcelFileName ?? "", academic.PractitionerPscFullTimeExcelFile ?? "")
                    : (academic.PractitionerPscPartTimeExcelFileName ?? "", academic.PractitionerPscPartTimeExcelFile ?? ""),
                "PractitionerMsc" => fullTime
                    ? (academic.PractitionerMscFullTimeExcelFileName ?? "", academic.PractitionerMscFullTimeExcelFile ?? "")
                    : (academic.PractitionerMscPartTimeExcelFileName ?? "", academic.PractitionerMscPartTimeExcelFile ?? ""),
                _ => ("", "")
            };
        }

        private List<string> GetAcademicRankStaffRequiredColumns()
        {
            return new List<string>
            {
                "Name",
                "Program",
                "Major",
                "Degree Awarded",
                "Academic Rank",
                "Nationality",
                "Status"
            };
        }

        private string NormalizeCellText(string? value)
        {
            return Regex.Replace((value ?? string.Empty).Trim(), @"\s+", " ");
        }

        private string GetExpectedAcademicRankName(string rankKey)
        {
            return rankKey switch
            {
                "Professor" => "Professor",
                "AssociateProfessor" => "Associate Professor",
                "AssistantProfessor" => "Assistant Professor",
                "Researcher" => "Assistant Lecturer (PhD Holders)",
                "Teacher" => "Lecturer (PhD Holders)",
                "AssistantTeacher" => "Lecturer (MSc Holders)",
                "Others" => "Assistant Lecturer (MSc Holders)",
                "PractitionerPsc" => "Practitioner (BSc Holders)",
                "PractitionerMsc" => "Practitioner (MSc Holders)",
                _ => rankKey
            };
        }

        private List<string> GetAcademicRankTemplateValues()
        {
            return new List<string>
            {
                "Professor",
                "Associate Professor",
                "Assistant Professor",
                "Assistant Lecturer (PhD Holders)",
                "Lecturer (PhD Holders)",
                "Lecturer (MSc Holders)",
                "Assistant Lecturer (MSc Holders)",
                "Practitioner (MSc Holders)",
                "Practitioner (BSc Holders)"
            };
        }

        private List<string> GetAcademicStaffStatusTemplateValues()
        {
            return new List<string>
            {
                "Full Time",
                "Part Time"
            };
        }

        [HttpGet]
        public IActionResult DownloadAcademicRankExcelTemplate(string staffType = "")
        {
            staffType = (staffType ?? "").Trim().ToLowerInvariant();
            if (staffType != "fulltime" && staffType != "parttime")
                staffType = "fulltime";

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("AcademicStaffTemplate");

            var headers = GetAcademicRankStaffRequiredColumns();
            for (int i = 0; i < headers.Count; i++)
            {
                var cell = ws.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#F4EADC");
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            }

            ws.Row(1).Height = 24;
            ws.SheetView.FreezeRows(1);

            ws.Column(1).Width = 26; // Name
            ws.Column(2).Width = 24; // Program
            ws.Column(3).Width = 20; // Major
            ws.Column(4).Width = 22; // Degree Awarded
            ws.Column(5).Width = 24; // Academic Rank
            ws.Column(6).Width = 18; // Nationality
            ws.Column(7).Width = 14; // Status

            var rankValues = string.Join(",", GetAcademicRankTemplateValues());
            var statusValues = string.Join(",", GetAcademicStaffStatusTemplateValues());

            var rankValidation = ws.Range("E2:E1000").CreateDataValidation();
            rankValidation.List(rankValues, true);
            rankValidation.IgnoreBlanks = true;
            rankValidation.InCellDropdown = true;

            var statusValidation = ws.Range("G2:G1000").CreateDataValidation();
            statusValidation.List(statusValues, true);
            statusValidation.IgnoreBlanks = true;
            statusValidation.InCellDropdown = true;

            var defaultStatus = staffType == "parttime" ? "Part Time" : "Full Time";
            ws.Cell("G2").Value = defaultStatus;
            ws.Range("G2:G1000").Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F6FA");

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            var downloadName = staffType == "parttime" ? "AcademicStaffTemplate_PartTime.xlsx" : "AcademicStaffTemplate_FullTime.xlsx";

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                downloadName);
        }

        [HttpGet]
        public IActionResult DownloadAcademicRankStaffFile(int id, string rankKey, string employmentType, bool inline = false)
        {
            if (id <= 0)
                return NotFound();

            rankKey = (rankKey ?? "").Trim();
            employmentType = (employmentType ?? "").Trim().ToLowerInvariant();

            var allowedRanks = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Professor",
                "AssociateProfessor",
                "AssistantProfessor",
                "Researcher",
                "Teacher",
                "AssistantTeacher",
                "Others",
                "PractitionerPsc",
                "PractitionerMsc"
            };

            if (!allowedRanks.Contains(rankKey))
                return BadRequest("Invalid academic rank.");

            if (employmentType != "fulltime" && employmentType != "parttime")
                return BadRequest("Invalid employment type.");

            var request = _recognitionRequestService.GetById(id);
            if (request == null)
                return NotFound();

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return Forbid();

            var (fileName, fileContentBase64) = GetAcademicRankFile(request.AcademicInfo ?? new AcademicInfoDto(), rankKey, employmentType);

            if (string.IsNullOrWhiteSpace(fileName) || string.IsNullOrWhiteSpace(fileContentBase64))
                return NotFound("No file uploaded for this academic rank and employment type.");

            byte[] fileBytes;
            try
            {
                fileBytes = Convert.FromBase64String(fileContentBase64);
            }
            catch
            {
                return BadRequest("Stored file content is invalid.");
            }

            var safeName = Path.GetFileName(fileName);
            if (string.IsNullOrWhiteSpace(safeName))
            {
                safeName = $"{GetExpectedAcademicRankName(rankKey).Replace(" ", "")}_{employmentType}.xlsx";
            }

            if (inline)
            {
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{safeName}\"";
                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                safeName);
        }

        [HttpGet]
        public IActionResult AcademicRankFilePreview(int id, string rankKey, string employmentType)
        {
            if (id <= 0)
                return NotFound();

            rankKey = (rankKey ?? "").Trim();
            employmentType = (employmentType ?? "").Trim().ToLowerInvariant();

            var allowedRanks = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Professor",
                "AssociateProfessor",
                "AssistantProfessor",
                "Researcher",
                "Teacher",
                "AssistantTeacher",
                "Others",
                "PractitionerPsc",
                "PractitionerMsc"
            };

            if (!allowedRanks.Contains(rankKey))
                return BadRequest("Invalid academic rank.");

            if (employmentType != "fulltime" && employmentType != "parttime")
                return BadRequest("Invalid employment type.");

            var request = _recognitionRequestService.GetById(id);
            if (request == null)
                return NotFound();

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return Forbid();

            var (fileName, fileContentBase64) = GetAcademicRankFile(request.AcademicInfo ?? new AcademicInfoDto(), rankKey, employmentType);
            if (string.IsNullOrWhiteSpace(fileName) || string.IsNullOrWhiteSpace(fileContentBase64))
                return NotFound("No file uploaded for this academic rank and employment type.");

            byte[] fileBytes;
            try
            {
                fileBytes = Convert.FromBase64String(fileContentBase64);
            }
            catch
            {
                return BadRequest("Stored file content is invalid.");
            }

            var headers = new List<string>();
            var rows = new List<List<string>>();

            try
            {
                using var stream = new MemoryStream(fileBytes);
                using var workbook = new XLWorkbook(stream);
                var ws = workbook.Worksheets.FirstOrDefault();
                if (ws == null)
                    return BadRequest("The Excel file contains no worksheet.");

                var usedRange = ws.RangeUsed();
                if (usedRange != null)
                {
                    var firstRow = usedRange.FirstRow().RowNumber();
                    var firstCol = usedRange.FirstColumn().ColumnNumber();
                    var lastRow = usedRange.LastRow().RowNumber();
                    var lastCol = usedRange.LastColumn().ColumnNumber();

                    var maxCols = Math.Min(20, Math.Max(1, lastCol - firstCol + 1));
                    for (var c = 0; c < maxCols; c++)
                    {
                        var value = ws.Cell(firstRow, firstCol + c).GetString();
                        headers.Add(string.IsNullOrWhiteSpace(value) ? $"Column {c + 1}" : value);
                    }

                    var maxRows = Math.Min(lastRow, firstRow + 200);
                    for (var r = firstRow + 1; r <= maxRows; r++)
                    {
                        var row = new List<string>(maxCols);
                        for (var c = 0; c < maxCols; c++)
                        {
                            row.Add(ws.Cell(r, firstCol + c).GetFormattedString());
                        }
                        rows.Add(row);
                    }
                }
            }
            catch
            {
                return BadRequest("Unable to preview this Excel file.");
            }

            ViewBag.RequestId = id;
            ViewBag.RankTitle = GetExpectedAcademicRankName(rankKey);
            ViewBag.EmploymentType = employmentType == "fulltime" ? "Full-Time" : "Part-Time";
            ViewBag.FileName = Path.GetFileName(fileName);
            ViewBag.Headers = headers;
            ViewBag.Rows = rows;

            return View("~/Views/member/AcademicRankFilePreview.cshtml");
        }

        private string? ValidateAcademicRankExcelFile(byte[] fileBytes, string expectedRank, string expectedStatus)
        {
            using var ms = new MemoryStream(fileBytes);
            using var workbook = new XLWorkbook(ms);
            var worksheet = workbook.Worksheets.FirstOrDefault();
            if (worksheet == null)
                return "The Excel file must include at least one worksheet.";

            var headerRow = worksheet.FirstRowUsed();
            if (headerRow == null)
                return "The Excel file is empty.";

            var headerCells = headerRow.CellsUsed().ToList();
            var headerMap = headerCells
                .Select(c => new
                {
                    Name = NormalizeCellText(c.GetString()),
                    Column = c.Address.ColumnNumber
                })
                .Where(x => !string.IsNullOrWhiteSpace(x.Name))
                .GroupBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First().Column, StringComparer.OrdinalIgnoreCase);

            var requiredColumns = GetAcademicRankStaffRequiredColumns();
            var missingColumns = requiredColumns
                .Where(c => !headerMap.ContainsKey(c))
                .ToList();

            if (missingColumns.Any())
                return $"Missing required column(s): {string.Join(", ", missingColumns)}.";

            var statusColumn = headerMap["Status"];
            var rankColumn = headerMap["Academic Rank"];
            var allowedStatus = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Full Time",
                "Part Time"
            };

            var invalidStatusRows = new List<int>();
            var mismatchStatusRows = new List<int>();
            var mismatchRankRows = new List<int>();

            var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? headerRow.RowNumber();
            for (int row = headerRow.RowNumber() + 1; row <= lastRow; row++)
            {
                var hasData = requiredColumns.Any(col =>
                {
                    var colIndex = headerMap[col];
                    var v = NormalizeCellText(worksheet.Cell(row, colIndex).GetString());
                    return !string.IsNullOrWhiteSpace(v);
                });

                if (!hasData)
                    continue;

                var rowStatus = NormalizeCellText(worksheet.Cell(row, statusColumn).GetString());
                var rowRank = NormalizeCellText(worksheet.Cell(row, rankColumn).GetString());

                if (!allowedStatus.Contains(rowStatus))
                {
                    invalidStatusRows.Add(row);
                    continue;
                }

                if (!string.Equals(rowStatus, expectedStatus, StringComparison.OrdinalIgnoreCase))
                    mismatchStatusRows.Add(row);

                if (!string.Equals(rowRank, expectedRank, StringComparison.OrdinalIgnoreCase))
                    mismatchRankRows.Add(row);
            }

            if (invalidStatusRows.Any())
                return $"Invalid Status value in row(s): {string.Join(", ", invalidStatusRows.Take(10))}. Allowed values are: Full Time, Part Time.";

            if (mismatchStatusRows.Any())
                return $"Status mismatch in row(s): {string.Join(", ", mismatchStatusRows.Take(10))}. This file must contain '{expectedStatus}' only.";

            if (mismatchRankRows.Any())
                return $"Academic Rank mismatch in row(s): {string.Join(", ", mismatchRankRows.Take(10))}. This file must contain '{expectedRank}' only.";

            return null;
        }

        [HttpPost]
        public async Task<IActionResult> UploadAcademicRankStaffFile(IFormFile file, string rankKey, string employmentType)
        {
            rankKey = (rankKey ?? "").Trim();
            employmentType = (employmentType ?? "").Trim().ToLowerInvariant();

            var allowedRanks = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Professor",
                "AssociateProfessor",
                "AssistantProfessor",
                "Researcher",
                "Teacher",
                "AssistantTeacher",
                "Others",
                "PractitionerPsc",
                "PractitionerMsc"
            };

            if (!allowedRanks.Contains(rankKey))
                return BadRequest("Invalid academic rank.");

            if (employmentType != "fulltime" && employmentType != "parttime")
                return BadRequest("Invalid employment type.");

            if (file == null || file.Length == 0)
                return BadRequest("Please choose an Excel file.");

            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (ext != ".xlsx" && ext != ".xls")
                return BadRequest("Only Excel files (.xlsx, .xls) are allowed.");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileBytes = ms.ToArray();

            var academic = LoadAcademicInfoFromSession();
            var safeFileName = Path.GetFileName(file.FileName);
            var fileContentBase64 = Convert.ToBase64String(fileBytes);

            SetAcademicRankFile(academic, rankKey, employmentType, safeFileName, fileContentBase64);
            SaveAcademicInfoToSession(academic);

            return Json(new { fileName = safeFileName });
        }

        [HttpPost]
        public IActionResult DeleteAcademicRankStaffFile(string rankKey, string employmentType)
        {
            rankKey = (rankKey ?? "").Trim();
            employmentType = (employmentType ?? "").Trim().ToLowerInvariant();

            var allowedRanks = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Professor",
                "AssociateProfessor",
                "AssistantProfessor",
                "Researcher",
                "Teacher",
                "AssistantTeacher",
                "Others",
                "PractitionerPsc",
                "PractitionerMsc"
            };

            if (!allowedRanks.Contains(rankKey))
                return BadRequest("Invalid academic rank.");

            if (employmentType != "fulltime" && employmentType != "parttime")
                return BadRequest("Invalid employment type.");

            var academic = LoadAcademicInfoFromSession();
            SetAcademicRankFile(academic, rankKey, employmentType, "", "");
            SaveAcademicInfoToSession(academic);

            return Json(new { ok = true });
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
            return RedirectToAction("UniDashboardDoctors", "Home");
        }
        // to stay on the same page 
        [HttpPost]
        public IActionResult AutoSaveDuration([Bind(Prefix = "Duration")] StudyDurationDto dto)
        {
            var json = JsonSerializer.Serialize(dto ?? new StudyDurationDto());
            HttpContext.Session.SetString("StudyDuration", json);
            return Ok();
        }

        private const string ADMISSION_STUDY_REVIEW_KEY = "AdmissionStudyDurationReview";

        private AdmissionStudyDurationReviewDto LoadAdmissionStudyDurationReviewFromSession()
        {
            var json = HttpContext.Session.GetString(ADMISSION_STUDY_REVIEW_KEY);
            return string.IsNullOrWhiteSpace(json)
                ? new AdmissionStudyDurationReviewDto()
                : (JsonSerializer.Deserialize<AdmissionStudyDurationReviewDto>(json) ?? new AdmissionStudyDurationReviewDto());
        }

        private void SaveAdmissionStudyDurationReviewToSession(AdmissionStudyDurationReviewDto dto)
        {
            HttpContext.Session.SetString(ADMISSION_STUDY_REVIEW_KEY, JsonSerializer.Serialize(dto ?? new AdmissionStudyDurationReviewDto()));
        }

        [HttpPost]
        public IActionResult SaveAdmissionStudyFromUni(
            string diplomaDuration,
            string bScDuration,
            string higherDiplomaDuration,
            string masterDuration,
            string phdDuration,
            IFormFile? diplomaSamplePdf,
            IFormFile? bScSamplePdf,
            IFormFile? higherDiplomaSamplePdf,
            IFormFile? masterSamplePdf,
            IFormFile? phdSamplePdf)
        {
            var existing = LoadAdmissionStudyDurationReviewFromSession();

            var next = new AdmissionStudyDurationReviewDto
            {
                DiplomaDuration = (diplomaDuration ?? string.Empty).Trim(),
                BScDuration = (bScDuration ?? string.Empty).Trim(),
                HigherDiplomaDuration = (higherDiplomaDuration ?? string.Empty).Trim(),
                MasterDuration = (masterDuration ?? string.Empty).Trim(),
                PhdDuration = (phdDuration ?? string.Empty).Trim(),

                DiplomaSamplePdfFileName = existing.DiplomaSamplePdfFileName,
                DiplomaSamplePdfContentBase64 = existing.DiplomaSamplePdfContentBase64,
                BScSamplePdfFileName = existing.BScSamplePdfFileName,
                BScSamplePdfContentBase64 = existing.BScSamplePdfContentBase64,
                HigherDiplomaSamplePdfFileName = existing.HigherDiplomaSamplePdfFileName,
                HigherDiplomaSamplePdfContentBase64 = existing.HigherDiplomaSamplePdfContentBase64,
                MasterSamplePdfFileName = existing.MasterSamplePdfFileName,
                MasterSamplePdfContentBase64 = existing.MasterSamplePdfContentBase64,
                PhdSamplePdfFileName = existing.PhdSamplePdfFileName,
                PhdSamplePdfContentBase64 = existing.PhdSamplePdfContentBase64
            };

            var diplomaUpload = TryReadSamplePdfUpload(diplomaSamplePdf);
            if (!diplomaUpload.ok) return BadRequest(diplomaUpload.error);
            if (diplomaUpload.hasFile)
            {
                next.DiplomaSamplePdfFileName = diplomaUpload.fileName;
                next.DiplomaSamplePdfContentBase64 = diplomaUpload.fileContentBase64;
            }

            var bScUpload = TryReadSamplePdfUpload(bScSamplePdf);
            if (!bScUpload.ok) return BadRequest(bScUpload.error);
            if (bScUpload.hasFile)
            {
                next.BScSamplePdfFileName = bScUpload.fileName;
                next.BScSamplePdfContentBase64 = bScUpload.fileContentBase64;
            }

            var higherDiplomaUpload = TryReadSamplePdfUpload(higherDiplomaSamplePdf);
            if (!higherDiplomaUpload.ok) return BadRequest(higherDiplomaUpload.error);
            if (higherDiplomaUpload.hasFile)
            {
                next.HigherDiplomaSamplePdfFileName = higherDiplomaUpload.fileName;
                next.HigherDiplomaSamplePdfContentBase64 = higherDiplomaUpload.fileContentBase64;
            }

            var masterUpload = TryReadSamplePdfUpload(masterSamplePdf);
            if (!masterUpload.ok) return BadRequest(masterUpload.error);
            if (masterUpload.hasFile)
            {
                next.MasterSamplePdfFileName = masterUpload.fileName;
                next.MasterSamplePdfContentBase64 = masterUpload.fileContentBase64;
            }

            var phdUpload = TryReadSamplePdfUpload(phdSamplePdf);
            if (!phdUpload.ok) return BadRequest(phdUpload.error);
            if (phdUpload.hasFile)
            {
                next.PhdSamplePdfFileName = phdUpload.fileName;
                next.PhdSamplePdfContentBase64 = phdUpload.fileContentBase64;
            }

            SaveAdmissionStudyDurationReviewToSession(next);
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
        public IActionResult FacultiesAdd(string facultyName, int? studentsCount, string collegeType)
        {
            facultyName = (facultyName ?? "").Trim();
            collegeType = (collegeType ?? "").Trim();
            if (string.IsNullOrWhiteSpace(facultyName))
                return BadRequest("Faculty name is required");
            if (!studentsCount.HasValue || studentsCount.Value < 0)
                return BadRequest("Number of students is required");
            if (string.IsNullOrWhiteSpace(collegeType))
                return BadRequest("College type is required");

            var current = LoadFaculties();
            current.Rows.Add(new FacultyRowDto
            {
                FacultyName = facultyName,
                StudentsCount = studentsCount.Value,
                CollegeType = collegeType
            });
            current.AvailableCollegeCategories = GetCollegeCategoriesFromSession();

            SaveFaculties(current);

            // ✅ IMPORTANT: correct partial path
            return PartialView("Partial_Views/_Faculties", current);
        }

        [HttpPost]
        public IActionResult FacultiesDelete(string id)
        {
            var current = LoadFaculties();
            current.Rows.RemoveAll(r => r.Id == id);

            current.AvailableCollegeCategories = GetCollegeCategoriesFromSession();

            SaveFaculties(current);

            // ✅ IMPORTANT: correct partial path
            return PartialView("Partial_Views/_Faculties", current);
        }

        [HttpPost]
        public IActionResult FacultiesUpdate(string id, string facultyName, int? studentsCount, string collegeType)
        {
            id = (id ?? "").Trim();
            facultyName = (facultyName ?? "").Trim();
            collegeType = (collegeType ?? "").Trim();

            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid faculty id.");

            if (string.IsNullOrWhiteSpace(facultyName))
                return BadRequest("Faculty name is required.");
            if (!studentsCount.HasValue || studentsCount.Value < 0)
                return BadRequest("Number of students is required.");
            if (string.IsNullOrWhiteSpace(collegeType))
                return BadRequest("College type is required.");

            var current = LoadFaculties();
            var row = current.Rows.FirstOrDefault(r => r.Id == id);
            if (row == null)
                return BadRequest("Faculty not found.");

            row.FacultyName = facultyName;
            row.StudentsCount = studentsCount.Value;
            row.CollegeType = collegeType;

            current.AvailableCollegeCategories = GetCollegeCategoriesFromSession();

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
            string educationalSystem,
            DateTime? accreditationDate,
            DateTime? graduationDateOfLastRegiment
        )
        {
            program = (program ?? "").Trim();
            facultyId = (facultyId ?? "").Trim();
            degreeAwarded = (degreeAwarded ?? "").Trim();
            educationalSystem = (educationalSystem ?? "").Trim();

            if (string.IsNullOrWhiteSpace(program)) return BadRequest("Program is required");
            if (string.IsNullOrWhiteSpace(facultyId)) return BadRequest("Faculty is required");
            if (string.IsNullOrWhiteSpace(degreeAwarded)) return BadRequest("Degree Awarded is required");
            if (numberOfYears <= 0) return BadRequest("Number of Years is required");
            if (string.IsNullOrWhiteSpace(educationalSystem)) return BadRequest("Educational System is required");
            if (accreditationDate == null) return BadRequest("Accreditation Date is required");
            if (graduationDateOfLastRegiment == null) return BadRequest("Graduation date of last regiment is required");

            var faculties = LoadFaculties()?.Rows ?? new List<FacultyRowDto>();
            var selected = faculties.FirstOrDefault(f => f.Id == facultyId);
            if (selected == null) return BadRequest("Please select a valid college");

            var current = LoadPrograms();

            var row = new ProgramRowDto
            {
                Id = Guid.NewGuid().ToString("N"), // ✅ force stable id
                Program = program,
                FacultyId = facultyId,
                FacultyName = selected.FacultyName,

                DegreeAwarded = degreeAwarded,
                NumberOfYears = numberOfYears,
                EducationalSystem = educationalSystem,

                AccreditationDate = accreditationDate,
                GraduationDateOfLastRegiment = graduationDateOfLastRegiment
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
            string educationalSystem,
            DateTime? accreditationDate,
            DateTime? graduationDateOfLastRegiment
        )
        {
            id = (id ?? "").Trim();
            program = (program ?? "").Trim();
            facultyId = (facultyId ?? "").Trim();
            degreeAwarded = (degreeAwarded ?? "").Trim();
            educationalSystem = (educationalSystem ?? "").Trim();

            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Invalid row");
            if (string.IsNullOrWhiteSpace(program)) return BadRequest("Program is required");
            if (string.IsNullOrWhiteSpace(facultyId)) return BadRequest("Faculty is required");
            if (string.IsNullOrWhiteSpace(degreeAwarded)) return BadRequest("Degree Awarded is required");
            if (numberOfYears <= 0) return BadRequest("Number of Years is required");
            if (string.IsNullOrWhiteSpace(educationalSystem)) return BadRequest("Educational System is required");
            if (accreditationDate == null) return BadRequest("Accreditation Date is required");
            if (graduationDateOfLastRegiment == null) return BadRequest("Graduation date of last regiment is required");

            var faculties = LoadFaculties()?.Rows ?? new List<FacultyRowDto>();
            var selected = faculties.FirstOrDefault(f => f.Id == facultyId);
            if (selected == null) return BadRequest("Please select a valid college");

            var current = LoadPrograms();

            // ✅ DEBUG SAFE: if list empty, you'll know immediately
            if (current.Rows == null || current.Rows.Count == 0)
                return BadRequest("Programs session is empty. You may have duplicate Programs keys/methods.");

            var row = current.Rows.FirstOrDefault(r => r.Id == id);
            if (row == null)
                return BadRequest("Row not found (id mismatch). Make sure you don't have duplicated Programs methods/keys.");

            row.Program = program;
            row.FacultyId = facultyId;
            row.FacultyName = selected.FacultyName;

            row.DegreeAwarded = degreeAwarded;
            row.NumberOfYears = numberOfYears;
            row.EducationalSystem = educationalSystem;

            row.AccreditationDate = accreditationDate;
            row.GraduationDateOfLastRegiment = graduationDateOfLastRegiment;

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
                return BadRequest("Years values cannot be negative.");

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
            int? med_fullTimeProfessor,
            int? med_fullTimeAssociateProfessor,
            int? med_fullTimeAssistantProfessor,
            int? med_fullTimeLecturerPhd,
            int? med_fullTimeLecturerMsc,
            int? med_fullTimeAssistantLecturerMsc,
            int? med_fullTimeAssistantLecturerPsc,
            int? med_fullTimePractitionerPsc,
            int? med_fullTimePractitionerMsc,

            int? den_fullTimeProfessor,
            int? den_fullTimeAssociateProfessor,
            int? den_fullTimeAssistantProfessor,
            int? den_fullTimeLecturerPhd,
            int? den_fullTimeLecturerMsc,
            int? den_fullTimeAssistantLecturerMsc,
            int? den_fullTimeAssistantLecturerPsc,
            int? den_fullTimePractitionerPsc,
            int? den_fullTimePractitionerMsc,

            int? med_partTimeClinicalProfessor,
            int? med_partTimeClinicalAssociateProfessor,
            int? med_partTimeClinicalAssistantProfessor,
            int? med_partTimeClinicalLecturerPhd,
            int? med_partTimeClinicalAssistantLecturerPhd,
            int? med_partTimeClinicalLecturerMsc,
            int? med_partTimeClinicalAssistantLecturerMsc,
            int? med_partTimeClinicalPractitionerPsc,
            int? med_partTimeClinicalPractitionerMsc,

            int? den_partTimeClinicalProfessor,
            int? den_partTimeClinicalAssociateProfessor,
            int? den_partTimeClinicalAssistantProfessor,
            int? den_partTimeClinicalLecturerPhd,
            int? den_partTimeClinicalAssistantLecturerPhd,
            int? den_partTimeClinicalLecturerMsc,
            int? den_partTimeClinicalAssistantLecturerMsc,
            int? den_partTimeClinicalPractitionerPsc,
            int? den_partTimeClinicalPractitionerMsc,

            int? med_totalStudents,
            int? den_totalStudents
        )
        {
            bool hasNegative =
                (med_fullTimeProfessor ?? 0) < 0 ||
                (med_fullTimeAssociateProfessor ?? 0) < 0 ||
                (med_fullTimeAssistantProfessor ?? 0) < 0 ||
                (med_fullTimeLecturerPhd ?? 0) < 0 ||
                (med_fullTimeLecturerMsc ?? 0) < 0 ||
                (med_fullTimeAssistantLecturerMsc ?? 0) < 0 ||
                (med_fullTimeAssistantLecturerPsc ?? 0) < 0 ||
                (med_fullTimePractitionerPsc ?? 0) < 0 ||
                (med_fullTimePractitionerMsc ?? 0) < 0 ||
                (den_fullTimeProfessor ?? 0) < 0 ||
                (den_fullTimeAssociateProfessor ?? 0) < 0 ||
                (den_fullTimeAssistantProfessor ?? 0) < 0 ||
                (den_fullTimeLecturerPhd ?? 0) < 0 ||
                (den_fullTimeLecturerMsc ?? 0) < 0 ||
                (den_fullTimeAssistantLecturerMsc ?? 0) < 0 ||
                (den_fullTimeAssistantLecturerPsc ?? 0) < 0 ||
                (den_fullTimePractitionerPsc ?? 0) < 0 ||
                (den_fullTimePractitionerMsc ?? 0) < 0 ||
                (med_partTimeClinicalProfessor ?? 0) < 0 ||
                (med_partTimeClinicalAssociateProfessor ?? 0) < 0 ||
                (med_partTimeClinicalAssistantProfessor ?? 0) < 0 ||
                (med_partTimeClinicalLecturerPhd ?? 0) < 0 ||
                (med_partTimeClinicalAssistantLecturerPhd ?? 0) < 0 ||
                (med_partTimeClinicalLecturerMsc ?? 0) < 0 ||
                (med_partTimeClinicalAssistantLecturerMsc ?? 0) < 0 ||
                (med_partTimeClinicalPractitionerPsc ?? 0) < 0 ||
                (med_partTimeClinicalPractitionerMsc ?? 0) < 0 ||
                (den_partTimeClinicalProfessor ?? 0) < 0 ||
                (den_partTimeClinicalAssociateProfessor ?? 0) < 0 ||
                (den_partTimeClinicalAssistantProfessor ?? 0) < 0 ||
                (den_partTimeClinicalLecturerPhd ?? 0) < 0 ||
                (den_partTimeClinicalAssistantLecturerPhd ?? 0) < 0 ||
                (den_partTimeClinicalLecturerMsc ?? 0) < 0 ||
                (den_partTimeClinicalAssistantLecturerMsc ?? 0) < 0 ||
                (den_partTimeClinicalPractitionerPsc ?? 0) < 0 ||
                (den_partTimeClinicalPractitionerMsc ?? 0) < 0 ||
                (med_totalStudents ?? 0) < 0 ||
                (den_totalStudents ?? 0) < 0;

            if (hasNegative)
                return BadRequest("All fields must be non-negative numbers.");

            var dto = new MedicineDentistryDto
            {
                Med_FullTimeProfessor = med_fullTimeProfessor,
                Med_FullTimeAssociateProfessor = med_fullTimeAssociateProfessor,
                Med_FullTimeAssistantProfessor = med_fullTimeAssistantProfessor,
                Med_FullTimeLecturerPhd = med_fullTimeLecturerPhd,
                Med_FullTimeLecturerMsc = med_fullTimeLecturerMsc,
                Med_FullTimeAssistantLecturerMsc = med_fullTimeAssistantLecturerMsc,
                Med_FullTimeAssistantLecturerPsc = med_fullTimeAssistantLecturerPsc,
                Med_FullTimePractitionerPsc = med_fullTimePractitionerPsc,
                Med_FullTimePractitionerMsc = med_fullTimePractitionerMsc,

                Den_FullTimeProfessor = den_fullTimeProfessor,
                Den_FullTimeAssociateProfessor = den_fullTimeAssociateProfessor,
                Den_FullTimeAssistantProfessor = den_fullTimeAssistantProfessor,
                Den_FullTimeLecturerPhd = den_fullTimeLecturerPhd,
                Den_FullTimeLecturerMsc = den_fullTimeLecturerMsc,
                Den_FullTimeAssistantLecturerMsc = den_fullTimeAssistantLecturerMsc,
                Den_FullTimeAssistantLecturerPsc = den_fullTimeAssistantLecturerPsc,
                Den_FullTimePractitionerPsc = den_fullTimePractitionerPsc,
                Den_FullTimePractitionerMsc = den_fullTimePractitionerMsc,

                Med_PartTimeClinicalProfessor = med_partTimeClinicalProfessor,
                Med_PartTimeClinicalAssociateProfessor = med_partTimeClinicalAssociateProfessor,
                Med_PartTimeClinicalAssistantProfessor = med_partTimeClinicalAssistantProfessor,
                Med_PartTimeClinicalLecturerPhd = med_partTimeClinicalLecturerPhd,
                Med_PartTimeClinicalAssistantLecturerPhd = med_partTimeClinicalAssistantLecturerPhd,
                Med_PartTimeClinicalLecturerMsc = med_partTimeClinicalLecturerMsc,
                Med_PartTimeClinicalAssistantLecturerMsc = med_partTimeClinicalAssistantLecturerMsc,
                Med_PartTimeClinicalPractitionerPsc = med_partTimeClinicalPractitionerPsc,
                Med_PartTimeClinicalPractitionerMsc = med_partTimeClinicalPractitionerMsc,

                Den_PartTimeClinicalProfessor = den_partTimeClinicalProfessor,
                Den_PartTimeClinicalAssociateProfessor = den_partTimeClinicalAssociateProfessor,
                Den_PartTimeClinicalAssistantProfessor = den_partTimeClinicalAssistantProfessor,
                Den_PartTimeClinicalLecturerPhd = den_partTimeClinicalLecturerPhd,
                Den_PartTimeClinicalAssistantLecturerPhd = den_partTimeClinicalAssistantLecturerPhd,
                Den_PartTimeClinicalLecturerMsc = den_partTimeClinicalLecturerMsc,
                Den_PartTimeClinicalAssistantLecturerMsc = den_partTimeClinicalAssistantLecturerMsc,
                Den_PartTimeClinicalPractitionerPsc = den_partTimeClinicalPractitionerPsc,
                Den_PartTimeClinicalPractitionerMsc = den_partTimeClinicalPractitionerMsc,

                Med_TotalStudents = med_totalStudents,
                Den_TotalStudents = den_totalStudents
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
                    Facilities = new List<HospitalFacilityDto>(),
                    Fields = new List<HospitalFieldDto>(),
                    Documents = new List<HospitalFileDto>(),
                    Specializations = new List<string>(),
                    HospitalContracts = new List<HospitalFileDto>()
                };
            }

            var model = JsonSerializer.Deserialize<HospitalsDto>(json) ?? new HospitalsDto
            {
                Rows = new List<HospitalRowDto>(),
                Facilities = new List<HospitalFacilityDto>(),
                Fields = new List<HospitalFieldDto>(),
                Documents = new List<HospitalFileDto>(),
                Specializations = new List<string>(),
                HospitalContracts = new List<HospitalFileDto>()
            };

            return NormalizeHospitalsData(model);
        }

        private void SaveHospitalsData(HospitalsDto model)
        {
            if (model == null)
            {
                model = new HospitalsDto
                {
                    Rows = new List<HospitalRowDto>(),
                    Facilities = new List<HospitalFacilityDto>(),
                    Fields = new List<HospitalFieldDto>(),
                    Documents = new List<HospitalFileDto>(),
                    Specializations = new List<string>()
                };
            }

            model = NormalizeHospitalsData(model);

            var json = JsonSerializer.Serialize(model);
            HttpContext.Session.SetString(HOSPITALS_KEY, json);
        }

        private HospitalsDto NormalizeHospitalsData(HospitalsDto model)
        {
            model ??= new HospitalsDto();

            model.Rows ??= new List<HospitalRowDto>();
            model.Facilities ??= new List<HospitalFacilityDto>();
            model.Fields ??= new List<HospitalFieldDto>();
            model.Documents ??= new List<HospitalFileDto>();
            model.Specializations ??= new List<string>();
            model.HospitalContracts ??= new List<HospitalFileDto>();

            if (!model.Facilities.Any() && model.Rows.Any())
            {
                model.Facilities = model.Rows.Select(r => new HospitalFacilityDto
                {
                    Id = string.IsNullOrWhiteSpace(r.Id) ? Guid.NewGuid().ToString() : r.Id,
                    Specialization = r.Specialization ?? "",
                    Name = r.Name ?? "",
                    Major = r.Major ?? "",
                    BedCapacity = r.BedCapacity,
                    DentalChairCapacity = r.DentalChairCapacity
                }).ToList();
            }

            if (!model.Documents.Any() && model.HospitalContracts.Any())
            {
                model.Documents = model.HospitalContracts.Select(f => new HospitalFileDto
                {
                    OriginalFileName = f.OriginalFileName,
                    StoredFileName = f.StoredFileName,
                    FileUrl = f.FileUrl,
                    DocumentType = "University-Hospital Agreement"
                }).ToList();
            }

            return model;
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

            model.Facilities ??= new List<HospitalFacilityDto>();
            model.Fields ??= new List<HospitalFieldDto>();
            model.Documents ??= new List<HospitalFileDto>();
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

        public class HospitalFacilityRequest
        {
            public string Id { get; set; } = "";
            public string Specialization { get; set; } = "";
            public string Name { get; set; } = "";
            public string Major { get; set; } = "";
            public string BedCapacity { get; set; } = "";
            public string DentalChairCapacity { get; set; } = "";
        }

        public class HospitalCapacityRequest
        {
            public string Specialization { get; set; } = "";
            public string Capacity { get; set; } = "";
        }

        public class HospitalFieldRequest
        {
            public string Id { get; set; } = "";
            public string Specialization { get; set; } = "";
            public string FieldName { get; set; } = "";
            public string RelatedFacilityId { get; set; } = "";
        }

        public class HospitalDocumentsUploadRequest
        {
            public List<IFormFile>? AgreementDocuments { get; set; }
            public List<IFormFile>? AccreditationDocuments { get; set; }
        }

        public class HospFileDeleteReq
        {
            public string RowId { get; set; } = "";
            public string StoredFileName { get; set; } = "";
        }

        private static readonly string[] _hospAllowedExts =
            { ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx" };

        [HttpPost]
        public IActionResult SaveHospitalCapacity([FromForm] HospitalCapacityRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Specialization))
                return Json(new { success = false, message = "Please select specialization." });

            if (!int.TryParse(req.Capacity, out var cap) || cap < 0)
                return Json(new { success = false, message = "Please enter a valid capacity." });

            var model = GetHospitalsData();
            var isMed = req.Specialization.Contains("medicine", StringComparison.OrdinalIgnoreCase);
            var isDent = req.Specialization.Contains("dent", StringComparison.OrdinalIgnoreCase);

            if (isMed)
                model.MedicineCapacity = cap;
            else if (isDent)
                model.DentistryCapacity = cap;
            else
                return Json(new { success = false, message = "Capacity is only supported for Medicine or Dentistry." });

            SaveHospitalsData(model);
            return Json(new { success = true, message = "Capacity saved successfully." });
        }

        [HttpPost]
        public async Task<IActionResult> AddHospital([FromForm] HospitalFacilityRequest row)
        {
            if (row == null)
                return Json(new { success = false, message = "Invalid data." });

            if (string.IsNullOrWhiteSpace(row.Specialization) ||
                string.IsNullOrWhiteSpace(row.Name))
                return Json(new { success = false, message = "Please fill all required fields." });

            var model = GetHospitalsData();
            model.Facilities ??= new List<HospitalFacilityDto>();

            var newRow = new HospitalFacilityDto
            {
                Id = Guid.NewGuid().ToString(),
                Specialization = row.Specialization.Trim(),
                Name = row.Name.Trim(),
                Major = (row.Major ?? "").Trim(),
                BedCapacity = null,
                DentalChairCapacity = null
            };

            model.Facilities.Add(newRow);
            SaveHospitalsData(model);
            return Json(new { success = true, message = "Hospital added successfully." });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateHospital([FromForm] HospitalFacilityRequest row)
        {
            if (row == null || string.IsNullOrWhiteSpace(row.Id))
                return Json(new { success = false, message = "Invalid data." });

            if (string.IsNullOrWhiteSpace(row.Specialization) ||
                string.IsNullOrWhiteSpace(row.Name))
                return Json(new { success = false, message = "Please fill all required fields." });

            var model = GetHospitalsData();
            model.Facilities ??= new List<HospitalFacilityDto>();

            var existing = model.Facilities.FirstOrDefault(x => x.Id == row.Id);
            if (existing == null)
                return Json(new { success = false, message = "Row not found." });

            existing.Specialization = row.Specialization.Trim();
            existing.Name = row.Name.Trim();
            existing.Major = (row.Major ?? "").Trim();
            existing.BedCapacity = null;
            existing.DentalChairCapacity = null;

            SaveHospitalsData(model);
            return Json(new { success = true, message = "Hospital updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteHospital([FromBody] string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return Json(new { success = false, message = "Invalid id." });

            var model = GetHospitalsData();
            model.Facilities ??= new List<HospitalFacilityDto>();

            var existing = model.Facilities.FirstOrDefault(x => x.Id == id);

            if (existing == null)
                return Json(new { success = false, message = "Row not found." });

            model.Facilities.Remove(existing);

            if (model.Fields != null)
            {
                foreach (var field in model.Fields)
                {
                    if (string.Equals(field.RelatedFacilityId, id, StringComparison.OrdinalIgnoreCase))
                        field.RelatedFacilityId = "";
                }
            }
            SaveHospitalsData(model);

            return Json(new { success = true, message = "Hospital row deleted successfully." });
        }

        [HttpPost]
        public IActionResult AddHospitalField([FromForm] HospitalFieldRequest row)
        {
            if (row == null)
                return Json(new { success = false, message = "Invalid data." });

            row.Specialization = (row.Specialization ?? "").Trim();
            row.FieldName = (row.FieldName ?? "").Trim();
            row.RelatedFacilityId = (row.RelatedFacilityId ?? "").Trim();

            if (string.IsNullOrWhiteSpace(row.Specialization) || string.IsNullOrWhiteSpace(row.FieldName))
                return Json(new { success = false, message = "Please fill all required fields." });

            var model = GetHospitalsData();
            model.Fields ??= new List<HospitalFieldDto>();
            model.Facilities ??= new List<HospitalFacilityDto>();

            if (!string.IsNullOrWhiteSpace(row.RelatedFacilityId) &&
                !model.Facilities.Any(f => f.Id == row.RelatedFacilityId))
            {
                return Json(new { success = false, message = "Related hospital not found." });
            }

            model.Fields.Add(new HospitalFieldDto
            {
                Id = Guid.NewGuid().ToString(),
                Specialization = row.Specialization,
                FieldName = row.FieldName,
                RelatedFacilityId = row.RelatedFacilityId
            });

            SaveHospitalsData(model);
            return Json(new { success = true, message = "Clinical field added successfully." });
        }

        [HttpPost]
        public IActionResult UpdateHospitalField([FromForm] HospitalFieldRequest row)
        {
            if (row == null || string.IsNullOrWhiteSpace(row.Id))
                return Json(new { success = false, message = "Invalid data." });

            row.Specialization = (row.Specialization ?? "").Trim();
            row.FieldName = (row.FieldName ?? "").Trim();
            row.RelatedFacilityId = (row.RelatedFacilityId ?? "").Trim();

            if (string.IsNullOrWhiteSpace(row.Specialization) || string.IsNullOrWhiteSpace(row.FieldName))
                return Json(new { success = false, message = "Please fill all required fields." });

            var model = GetHospitalsData();
            model.Fields ??= new List<HospitalFieldDto>();
            model.Facilities ??= new List<HospitalFacilityDto>();

            var existing = model.Fields.FirstOrDefault(x => x.Id == row.Id);
            if (existing == null)
                return Json(new { success = false, message = "Row not found." });

            if (!string.IsNullOrWhiteSpace(row.RelatedFacilityId) &&
                !model.Facilities.Any(f => f.Id == row.RelatedFacilityId))
            {
                return Json(new { success = false, message = "Related hospital not found." });
            }

            existing.Specialization = row.Specialization;
            existing.FieldName = row.FieldName;
            existing.RelatedFacilityId = row.RelatedFacilityId;

            SaveHospitalsData(model);
            return Json(new { success = true, message = "Clinical field updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteHospitalField([FromBody] string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return Json(new { success = false, message = "Invalid id." });

            var model = GetHospitalsData();
            model.Fields ??= new List<HospitalFieldDto>();

            var existing = model.Fields.FirstOrDefault(x => x.Id == id);
            if (existing == null)
                return Json(new { success = false, message = "Row not found." });

            model.Fields.Remove(existing);
            SaveHospitalsData(model);

            return Json(new { success = true, message = "Clinical field deleted successfully." });
        }

        [HttpPost]
        public async Task<IActionResult> SaveHospitalDocuments([FromForm] HospitalDocumentsUploadRequest req)
        {
            var agreements = req?.AgreementDocuments ?? new List<IFormFile>();
            var accreditations = req?.AccreditationDocuments ?? new List<IFormFile>();

            if (!agreements.Any() && !accreditations.Any())
                return Json(new { success = false, message = "Please choose one or more files." });

            var uploadsFolder = EnsureHospitalUploadsFolder();

            var model = GetHospitalsData();
            model.Documents ??= new List<HospitalFileDto>();

            var hasAgreement = model.Documents.Any(d =>
                string.Equals(d.DocumentType, "University-Hospital Agreement", StringComparison.OrdinalIgnoreCase));
            if (!agreements.Any() && !hasAgreement)
                return Json(new { success = false, message = "Please upload at least one agreement document." });

            foreach (var file in agreements.Where(f => f != null && f.Length > 0))
            {
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (!_hospAllowedExts.Contains(ext)) continue;

                var stored = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(uploadsFolder, stored);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                model.Documents.Add(new HospitalFileDto
                {
                    OriginalFileName = Path.GetFileName(file.FileName),
                    StoredFileName = stored,
                    FileUrl = $"/uploads/hospitals/{stored}",
                    DocumentType = "University-Hospital Agreement"
                });
            }

            foreach (var file in accreditations.Where(f => f != null && f.Length > 0))
            {
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (!_hospAllowedExts.Contains(ext)) continue;

                var stored = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(uploadsFolder, stored);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                model.Documents.Add(new HospitalFileDto
                {
                    OriginalFileName = Path.GetFileName(file.FileName),
                    StoredFileName = stored,
                    FileUrl = $"/uploads/hospitals/{stored}",
                    DocumentType = "Hospital Accreditation"
                });
            }

            SaveHospitalsData(model);
            return Json(new { success = true, message = "Hospital documents uploaded successfully." });
        }

        [HttpPost]
        public IActionResult DeleteHospitalDocument([FromBody] string storedFileName)
        {
            if (string.IsNullOrWhiteSpace(storedFileName))
                return Json(new { success = false, message = "Invalid file." });

            var model = GetHospitalsData();
            model.Documents ??= new List<HospitalFileDto>();

            var row = model.Documents.FirstOrDefault(x =>
                string.Equals(x.StoredFileName, storedFileName, StringComparison.OrdinalIgnoreCase));

            if (row == null)
                return Json(new { success = false, message = "File not found." });

            var uploadsFolder = EnsureHospitalUploadsFolder();
            var path = Path.Combine(uploadsFolder, row.StoredFileName);
            if (System.IO.File.Exists(path))
                System.IO.File.Delete(path);

            model.Documents.Remove(row);
            SaveHospitalsData(model);

            return Json(new { success = true, message = "File removed successfully." });
        }

        [HttpPost]
        public async Task<IActionResult> SaveHospitalContracts(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return Json(new { success = false, message = "Please choose one or more files." });

            var allowedExts = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip" };
            var uploadsFolder = EnsureHospitalUploadsFolder();

            var model = GetHospitalsData();
            model.HospitalContracts ??= new List<HospitalFileDto>();
            model.Documents ??= new List<HospitalFileDto>();

            foreach (var file in files.Where(f => f != null && f.Length > 0))
            {
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();

                // Save each file as-is (including PDFs).
                var stored = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(uploadsFolder, stored);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var dto = new HospitalFileDto
                {
                    OriginalFileName = Path.GetFileName(file.FileName),
                    StoredFileName = stored,
                    FileUrl = $"/uploads/hospitals/{stored}",
                    DocumentType = "University-Hospital Agreement"
                };

                model.HospitalContracts.Add(dto);
                model.Documents.Add(dto);
            }

            SaveHospitalsData(model);
            return Json(new { success = true, message = "Training contracts/supporting documents uploaded successfully." });
        }

        [HttpPost]
        public IActionResult DeleteHospitalContract([FromBody] string storedFileName)
        {
            if (string.IsNullOrWhiteSpace(storedFileName))
                return Json(new { success = false, message = "Invalid file." });

            var model = GetHospitalsData();
            model.HospitalContracts ??= new List<HospitalFileDto>();
            model.Documents ??= new List<HospitalFileDto>();

            var row = model.HospitalContracts.FirstOrDefault(x =>
                string.Equals(x.StoredFileName, storedFileName, StringComparison.OrdinalIgnoreCase));

            if (row == null)
                return Json(new { success = false, message = "File not found." });

            var uploadsFolder = EnsureHospitalUploadsFolder();
            var path = Path.Combine(uploadsFolder, row.StoredFileName);
            if (System.IO.File.Exists(path))
                System.IO.File.Delete(path);

            model.HospitalContracts.Remove(row);
            var docRow = model.Documents.FirstOrDefault(x =>
                string.Equals(x.StoredFileName, storedFileName, StringComparison.OrdinalIgnoreCase));
            if (docRow != null) model.Documents.Remove(docRow);
            SaveHospitalsData(model);

            return Json(new { success = true, message = "File removed successfully." });
        }

        // ============================================================
        // Accreditation Bodies (Session Helpers + AJAX Endpoints)
        // ============================================================
        private const string ACCREDITATION_BODIES_KEY = "AccreditationBodies";

        private AccreditationBodiesDto LoadAccreditationBodies()
        {
            var json = HttpContext.Session.GetString(ACCREDITATION_BODIES_KEY);
            if (string.IsNullOrWhiteSpace(json))
                return new AccreditationBodiesDto();

            return JsonSerializer.Deserialize<AccreditationBodiesDto>(json) ?? new AccreditationBodiesDto();
        }

        private void SaveAccreditationBodies(AccreditationBodiesDto dto)
        {
            dto ??= new AccreditationBodiesDto();
            dto.Rows ??= new List<AccreditationBodyRowDto>();

            HttpContext.Session.SetString(ACCREDITATION_BODIES_KEY, JsonSerializer.Serialize(dto));
        }

        private string EnsureAccreditationBodiesUploadsFolder()
        {
            var folder = Path.Combine(_env.WebRootPath, "uploads", "accreditation-bodies");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            return folder;
        }

        public class AccreditationBodyUploadRequest
        {
            public string Id { get; set; } = "";
            public string AccreditationBodyName { get; set; } = "";
            public string AccreditationType { get; set; } = "";
            public IFormFile? PdfFile { get; set; }
        }

        [HttpGet]
        public IActionResult AccreditationBodiesPartial()
        {
            return PartialView("Partial_Views/_AccreditationBodies", LoadAccreditationBodies());
        }

        [HttpPost]
        public async Task<IActionResult> AccreditationBodiesAdd([FromForm] AccreditationBodyUploadRequest row)
        {
            if (row == null)
                return BadRequest("Invalid data.");

            row.AccreditationBodyName = (row.AccreditationBodyName ?? "").Trim();
            row.AccreditationType = (row.AccreditationType ?? "").Trim();

            if (string.IsNullOrWhiteSpace(row.AccreditationBodyName) ||
                string.IsNullOrWhiteSpace(row.AccreditationType))
            {
                return BadRequest("Please fill all required fields.");
            }

            if (row.PdfFile == null || row.PdfFile.Length == 0)
                return BadRequest("Please upload one PDF file for this row.");

            var ext = Path.GetExtension(row.PdfFile.FileName)?.ToLowerInvariant();
            if (!string.Equals(ext, ".pdf", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Only PDF files are allowed.");

            var uploadsFolder = EnsureAccreditationBodiesUploadsFolder();
            var stored = $"{Guid.NewGuid()}{ext}";
            var path = Path.Combine(uploadsFolder, stored);

            await using (var stream = new FileStream(path, FileMode.Create))
            {
                await row.PdfFile.CopyToAsync(stream);
            }

            var model = LoadAccreditationBodies();
            model.Rows ??= new List<AccreditationBodyRowDto>();

            model.Rows.Add(new AccreditationBodyRowDto
            {
                Id = Guid.NewGuid().ToString("N"),
                AccreditationBodyName = row.AccreditationBodyName,
                AccreditationType = row.AccreditationType,
                PdfOriginalFileName = Path.GetFileName(row.PdfFile.FileName),
                PdfStoredFileName = stored,
                PdfFileUrl = $"/uploads/accreditation-bodies/{stored}"
            });

            SaveAccreditationBodies(model);
            return PartialView("Partial_Views/_AccreditationBodies", model);
        }

        [HttpPost]
        public async Task<IActionResult> AccreditationBodiesUpdate([FromForm] AccreditationBodyUploadRequest row)
        {
            if (row == null || string.IsNullOrWhiteSpace(row.Id))
                return BadRequest("Invalid row.");

            row.AccreditationBodyName = (row.AccreditationBodyName ?? "").Trim();
            row.AccreditationType = (row.AccreditationType ?? "").Trim();

            if (string.IsNullOrWhiteSpace(row.AccreditationBodyName) ||
                string.IsNullOrWhiteSpace(row.AccreditationType))
            {
                return BadRequest("Please fill all required fields.");
            }

            var model = LoadAccreditationBodies();
            model.Rows ??= new List<AccreditationBodyRowDto>();

            var existing = model.Rows.FirstOrDefault(x => x.Id == row.Id);
            if (existing == null)
                return BadRequest("Row not found.");

            existing.AccreditationBodyName = row.AccreditationBodyName;
            existing.AccreditationType = row.AccreditationType;

            if (row.PdfFile != null && row.PdfFile.Length > 0)
            {
                var ext = Path.GetExtension(row.PdfFile.FileName)?.ToLowerInvariant();
                if (!string.Equals(ext, ".pdf", StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Only PDF files are allowed.");

                var uploadsFolder = EnsureAccreditationBodiesUploadsFolder();

                if (!string.IsNullOrWhiteSpace(existing.PdfStoredFileName))
                {
                    var oldPath = Path.Combine(uploadsFolder, existing.PdfStoredFileName);
                    if (System.IO.File.Exists(oldPath))
                        System.IO.File.Delete(oldPath);
                }

                var stored = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(uploadsFolder, stored);

                await using (var stream = new FileStream(path, FileMode.Create))
                {
                    await row.PdfFile.CopyToAsync(stream);
                }

                existing.PdfOriginalFileName = Path.GetFileName(row.PdfFile.FileName);
                existing.PdfStoredFileName = stored;
                existing.PdfFileUrl = $"/uploads/accreditation-bodies/{stored}";
            }

            SaveAccreditationBodies(model);
            return PartialView("Partial_Views/_AccreditationBodies", model);
        }

        [HttpPost]
        public IActionResult AccreditationBodiesDelete(string id)
        {
            id = (id ?? "").Trim();
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid row.");

            var model = LoadAccreditationBodies();
            model.Rows ??= new List<AccreditationBodyRowDto>();

            var row = model.Rows.FirstOrDefault(x => x.Id == id);
            if (row == null)
                return BadRequest("Row not found.");

            if (!string.IsNullOrWhiteSpace(row.PdfStoredFileName))
            {
                var uploadsFolder = EnsureAccreditationBodiesUploadsFolder();
                var path = Path.Combine(uploadsFolder, row.PdfStoredFileName);
                if (System.IO.File.Exists(path))
                    System.IO.File.Delete(path);
            }

            model.Rows.Remove(row);
            SaveAccreditationBodies(model);

            return PartialView("Partial_Views/_AccreditationBodies", model);
        }

        // ============================================================
        // INFASTRUCTURE (Session Helpers + AJAX Endpoints)
        // ============================================================
        private InfrastructureDto LoadInfrastructure()
        {
            var json = HttpContext.Session.GetString("Infrastructure");
            return string.IsNullOrWhiteSpace(json)
                ? new InfrastructureDto()
                : (JsonSerializer.Deserialize<InfrastructureDto>(json) ?? new InfrastructureDto());
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
        "LibrariesCount"
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
        private LaboratoriesDto LoadLaboratoriesData()
        {
            var json = HttpContext.Session.GetString("Laboratories");
            LaboratoriesDto model;

            if (string.IsNullOrWhiteSpace(json))
            {
                // Backward compatibility with old rows-only session key
                var legacyRowsJson = HttpContext.Session.GetString("LaboratoriesRows");
                var legacyRows = string.IsNullOrWhiteSpace(legacyRowsJson)
                    ? new List<LaboratoryRowDto>()
                    : (JsonSerializer.Deserialize<List<LaboratoryRowDto>>(legacyRowsJson) ?? new List<LaboratoryRowDto>());

                model = new LaboratoriesDto
                {
                    Rows = legacyRows
                };
            }
            else
            {
                model = JsonSerializer.Deserialize<LaboratoriesDto>(json) ?? new LaboratoriesDto();
            }

            model.Rows ??= new List<LaboratoryRowDto>();
            model.UploadedFiles ??= new List<LaboratoryFileDto>();
            return model;
        }

        private void SaveLaboratoriesData(LaboratoriesDto dto)
        {
            dto ??= new LaboratoriesDto();
            dto.Rows ??= new List<LaboratoryRowDto>();
            dto.UploadedFiles ??= new List<LaboratoryFileDto>();

            HttpContext.Session.SetString("Laboratories", JsonSerializer.Serialize(dto));
        }

        private LaboratoriesDto AttachFacultiesToLaboratories(LaboratoriesDto dto)
        {
            var fac = LoadFaculties();
            dto.Faculties = fac?.Rows ?? new List<FacultyRowDto>();
            dto.AvailableCollegeCategories = GetCollegeCategoriesFromSession();
            return dto;
        }
        [HttpGet]
        public IActionResult LaboratoriesPartial()
        {
            var model = LoadLaboratoriesData();

            return PartialView("Partial_Views/_Laboratories", AttachFacultiesToLaboratories(model));
        }

        [HttpPost]
        public IActionResult SaveLaboratoriesSummary(LaboratoriesDto dto)
        {
            if (dto == null)
                return BadRequest("No data was received.");

            if (!dto.TotalLaboratoriesCount.HasValue ||
                !dto.TotalFacilitiesCount.HasValue ||
                !dto.TeachingHallsCount.HasValue ||
                !dto.StadiumsCount.HasValue)
            {
                return BadRequest("Please fill all required summary fields.");
            }

            var model = LoadLaboratoriesData();
            model.TotalLaboratoriesCount = dto.TotalLaboratoriesCount;
            model.TotalFacilitiesCount = dto.TotalFacilitiesCount;
            model.TeachingHallsCount = dto.TeachingHallsCount;
            model.StadiumsCount = dto.StadiumsCount;

            SaveLaboratoriesData(model);

            return PartialView("Partial_Views/_Laboratories", AttachFacultiesToLaboratories(model));
        }

        private string EnsureLaboratoriesFolder()
        {
            var folder = Path.Combine(_env.WebRootPath, "uploads", "laboratories");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            return folder;
        }

        [HttpPost]
        public async Task<IActionResult> UploadLaboratoryFile(IFormFile file, string subject)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please choose a file.");

            if (string.IsNullOrWhiteSpace(subject))
                return BadRequest("Please enter the subject.");

            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            var allowedImageExtensions = new[]
            {
                ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tif", ".tiff", ".svg", ".heic", ".heif"
            };

            var isPdf = string.Equals(ext, ".pdf", StringComparison.OrdinalIgnoreCase);
            var isImage = (!string.IsNullOrWhiteSpace(file.ContentType) && file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                          || (!string.IsNullOrWhiteSpace(ext) && allowedImageExtensions.Contains(ext));

            if (!isPdf && !isImage)
                return BadRequest("Only PDF or image files are allowed.");

            var model = LoadLaboratoriesData();

            var folder = EnsureLaboratoriesFolder();
            var safeFileName = Path.GetFileName(file.FileName);
            var storedFileName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(folder, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            model.UploadedFiles.Add(new LaboratoryFileDto
            {
                Id = Guid.NewGuid().ToString("N"),
                Subject = subject.Trim(),
                OriginalFileName = safeFileName,
                StoredFileName = storedFileName,
                FileUrl = $"/uploads/laboratories/{storedFileName}",
                ContentType = file.ContentType ?? "application/octet-stream",
                UploadedAt = DateTime.UtcNow
            });

            SaveLaboratoriesData(model);

            return PartialView("Partial_Views/_Laboratories", AttachFacultiesToLaboratories(model));
        }

        [HttpPost]
        public IActionResult DeleteLaboratoryFile(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid file id.");

            var model = LoadLaboratoriesData();
            var row = model.UploadedFiles.FirstOrDefault(x => x.Id == id);

            if (row == null)
                return BadRequest("File was not found.");

            var folder = EnsureLaboratoriesFolder();
            var fullPath = Path.Combine(folder, row.StoredFileName ?? "");

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            model.UploadedFiles.Remove(row);
            SaveLaboratoriesData(model);

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
                !dto.Laboratories.HasValue)
            {
                return BadRequest("Please fill all required fields.");
            }

            var allowedCategories = GetCollegeCategoriesFromSession();
            if (!allowedCategories.Contains(dto.FacultyId))
                return BadRequest("Selected college category was not found.");

            var model = LoadLaboratoriesData();
            var rows = model.Rows;

            var existing = rows.FirstOrDefault(x => x.Id == dto.Id);

            if (existing == null)
            {
                dto.Id = string.IsNullOrWhiteSpace(dto.Id) ? Guid.NewGuid().ToString() : dto.Id;
                dto.FacultyName = dto.FacultyId;
                rows.Add(dto);
            }
            else
            {
                existing.FacultyId = dto.FacultyId;
                existing.FacultyName = dto.FacultyId;
                existing.Computers = dto.Computers;
                existing.Workshops = dto.Workshops;
                existing.Laboratories = dto.Laboratories;
            }

            model.Rows = rows;
            SaveLaboratoriesData(model);

            return PartialView("Partial_Views/_Laboratories", AttachFacultiesToLaboratories(model));
        }

        [HttpPost]
        public IActionResult DeleteLaboratory(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid row id.");

            var model = LoadLaboratoriesData();
            var rows = model.Rows;
            var target = rows.FirstOrDefault(x => x.Id == id);

            if (target == null)
                return NotFound("Row not found.");

            rows.Remove(target);
            model.Rows = rows;
            SaveLaboratoriesData(model);

            return PartialView("Partial_Views/_Laboratories", AttachFacultiesToLaboratories(model));
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

        private string EnsurePicturesFolder()
        {
            var folder = Path.Combine(_env.WebRootPath, "uploads", "pictures");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            return folder;
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
        // Hospital Contracts => request attachment payload mapper
        // ============================================================
        private AttachmentDto BuildHospitalContractsAttachments()
        {
            var hospitals = GetHospitalsData();
            hospitals.Documents ??= new List<HospitalFileDto>();
            hospitals.HospitalContracts ??= new List<HospitalFileDto>();

            var docs = hospitals.Documents.Any()
                ? hospitals.Documents
                : hospitals.HospitalContracts;

            var dto = new AttachmentDto
            {
                RequiredFiles = new List<string>(),
                Rows = docs.Select(x => new AttachmentRowDto
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Subject = string.IsNullOrWhiteSpace(x.DocumentType)
                        ? "Hospital Training Documents"
                        : x.DocumentType,
                    FileName = x.OriginalFileName,
                    StoredFileName = x.StoredFileName,
                    FileUrl = x.FileUrl,
                    ContentType = "application/octet-stream",
                    UploadedAt = DateTime.UtcNow
                }).ToList()
            };

            return dto;
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

        [HttpGet]
        public IActionResult PicturesPartial()
        {
            var model = LoadPictures();
            ViewBag.Laboratories = LoadLaboratoriesData();
            return PartialView("Partial_Views/_Pictures", model);
        }

        [HttpPost]
        public async Task<IActionResult> UploadPicture(IFormFile file, string subject)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please choose a file.");

            if (string.IsNullOrWhiteSpace(subject))
                return BadRequest("Please enter the subject.");

            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();

            var allowedImageExtensions = new[]
            {
                ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tif", ".tiff", ".svg", ".heic", ".heif"
            };

            var isPdf = string.Equals(ext, ".pdf", StringComparison.OrdinalIgnoreCase);
            var isImage = (!string.IsNullOrWhiteSpace(file.ContentType) && file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                          || (!string.IsNullOrWhiteSpace(ext) && allowedImageExtensions.Contains(ext));

            if (!isPdf && !isImage)
                return BadRequest("Only PDF or image files are allowed.");

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
                string.IsNullOrWhiteSpace(dto.WorkPlace))
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

            var fallbackUniversityEmail = HttpContext.Session.GetString("UniversityEmail") ?? "";
            var resolvedEmail = !string.IsNullOrWhiteSpace(publicInfo.EmailAddress)
                ? publicInfo.EmailAddress
                : (!string.IsNullOrWhiteSpace(dto.Email) ? dto.Email : fallbackUniversityEmail);

            dto.Email = resolvedEmail;

            if (string.IsNullOrWhiteSpace(publicInfo.City))
            {
                publicInfo.City = HttpContext.Session.GetString("SignupCity") ?? "";
            }

            AcademicInfoDto academicInfo = string.IsNullOrWhiteSpace(academicJson)
                ? new AcademicInfoDto()
                : (JsonSerializer.Deserialize<AcademicInfoDto>(academicJson) ?? new AcademicInfoDto());

           var submittedFaculties = LoadFaculties().Rows
    .Select(f => new FacultyRowDto
    {
        Id = f.Id,
        FacultyName = f.FacultyName,
        CollegeType = f.CollegeType,
        StudentsCount = f.StudentsCount
    })
    .ToList();

            var submittedAccreditationBodies = LoadAccreditationBodies().Rows
                .Select(a => new AccreditationBodyRowDto
                {
                    Id = a.Id,
                    AccreditationBodyName = a.AccreditationBodyName,
                    AccreditationType = a.AccreditationType,
                    PdfOriginalFileName = a.PdfOriginalFileName,
                    PdfStoredFileName = a.PdfStoredFileName,
                    PdfFileUrl = a.PdfFileUrl
                })
                .ToList();

            var submittedPrograms = LoadPrograms().Rows
                .Select(p => new ProgramRowDto
                {
                    Id = p.Id,
                    Program = p.Program,
                    FacultyId = p.FacultyId,
                    FacultyName = p.FacultyName,
                    DegreeAwarded = p.DegreeAwarded,
                    NumberOfYears = p.NumberOfYears,
                    EducationalSystem = p.EducationalSystem,
                    AccreditationDate = p.AccreditationDate,
                    GraduationDateOfLastRegiment = p.GraduationDateOfLastRegiment
                })
                .ToList();

            var submittedProgramHours = GetProgramHoursRows()
                .Select(h => new ProgramHoursRowDto
                {
                    Id = h.Id,
                    ProgramId = h.ProgramId,
                    ProgramName = h.ProgramName,
                    TheoreticalHours = h.TheoreticalHours,
                    PracticalHours = h.PracticalHours
                })
                .ToList();

            var submittedAdmission = LoadAdmission();
            var durationJson = HttpContext.Session.GetString("StudyDuration");
            var submittedStudyDuration = string.IsNullOrWhiteSpace(durationJson)
                ? new StudyDurationDto()
                : (JsonSerializer.Deserialize<StudyDurationDto>(durationJson) ?? new StudyDurationDto());

            var request = new RecognitionRequestRecord
            {
                RecognitionNumber = recognitionNumber,
                UniversityName = string.IsNullOrWhiteSpace(publicInfo.InstitutionName) ? "Unknown University" : publicInfo.InstitutionName,
                Country = string.IsNullOrWhiteSpace(signupCountry) ? "Unknown" : signupCountry,
                UniversityEmail = resolvedEmail,

                ApplicantName = dto.ApplicantName,
                WorkPlace = dto.WorkPlace,
                ApplicantEmail = resolvedEmail,

                AssignedMember = "Unassigned",
                Status = "Pending",
                Year = DateTime.Now.Year,
                SubmittedAt = DateTime.Now,

                PublicInfo = publicInfo,
                AcademicInfo = academicInfo,
                SubmitApplication = dto,
                Faculties = submittedFaculties,
                Programs = submittedPrograms,
                ProgramHours = submittedProgramHours,
                AccreditationBodies = submittedAccreditationBodies,
                AdmissionRequirements = submittedAdmission,
                StudyDuration = submittedStudyDuration,
                MedicineDentistry = LoadMedDen(),
                AdmissionStudyDurationReview = LoadAdmissionStudyDurationReviewFromSession(),
                Attachments = BuildHospitalContractsAttachments(),
                Pictures = LoadPictures(),
                Laboratories = LoadLaboratoriesData(),
                Infrastructure = LoadInfrastructure(),
                Hospitals = GetHospitalsData()
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
        public IActionResult NewUniAccount(string Institution, string Country, string City, string CityOther, string Email, string Password, string ConfirmPassword, bool Agree)
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
            var resolvedCity = City ?? "";
            if (!string.IsNullOrWhiteSpace(CityOther))
            {
                if (resolvedCity.Contains("Other", StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(resolvedCity))
                {
                    resolvedCity = CityOther.Trim();
                }
            }

            HttpContext.Session.SetString("SignupCountry", Country ?? "");
            HttpContext.Session.SetString("SignupCity", resolvedCity);

            return RedirectToAction("UniStatus", "Home");
        }

        ///////////////////////UniStatus/////////
        public IActionResult UniStatus()
        {
            var request = GetSubmittedRequestFromSession();

            ViewBag.HasRequest = request != null;
            ViewBag.RequestNumber = request?.ReferenceNumber ?? "";
            ViewBag.SubmittedOn = request?.SubmittedAt.ToString("yyyy/MM/dd") ?? "";
            ViewBag.StatusText = request?.Status ?? "New Account";
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

        [HttpGet]
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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AssignToMember(int id, string assignedMember)
        {
            if (id <= 0)
                return Redirect("/Home/AdminDashboard#assignments");

            _recognitionRequestService.AssignMember(id, assignedMember ?? "Unassigned");

            return Redirect("/Home/AdminDashboard#assignments");
        }

        public IActionResult Employees()
        {
            return View("~/Views/Admin/Employees.cshtml", employees);
        }
        public IActionResult Decisions()
        {
            var requests = _recognitionRequestService.GetAll();

            var decisions = requests
                .Where(r => !string.IsNullOrEmpty(r.BasicInfoAssessmentDecision))
                .ToList();

            return View("~/Views/Admin/Decisions.cshtml", decisions);
        }

        public IActionResult DecisionDetails(int id)
        {
            var request = _recognitionRequestService.GetById(id);

            if (request == null)
                return RedirectToAction("Decisions");

            var list = new List<RecognitionRequestRecord> { request };
            return View("~/Views/Admin/DecisionDetails.cshtml", list);
        }

        [HttpGet]
        public IActionResult RecognitionMemberDashboard(
            int? sessionNo,
            int? year,
            string? search,
            string? status,
            string? country,
            string? sort)
        {
            var currentMember = GetCurrentRecognitionMember();
            var assignedToCurrentMember = _recognitionRequestService
                .GetAll()
                .Where(x => string.Equals(x.AssignedMember, currentMember, StringComparison.OrdinalIgnoreCase))
                .ToList();

            var allItems = assignedToCurrentMember
                .Select(MapDashboardItem)
                .ToList();

            var selectedSession = sessionNo;
            var selectedYear = year ?? DateTime.Now.Year;
            var selectedSearch = (search ?? string.Empty).Trim();
            var selectedStatus = string.IsNullOrWhiteSpace(status) ? "All" : status.Trim();
            var selectedCountry = string.IsNullOrWhiteSpace(country) ? "All" : country.Trim();
            var selectedSort = string.IsNullOrWhiteSpace(sort) ? "NewestActivity" : sort.Trim();

            var availableSessions = allItems
                .Where(x => x.SessionNo.HasValue)
                .Select(x => x.SessionNo!.Value)
                .Distinct()
                .OrderByDescending(x => x)
                .ToList();

            if (!availableSessions.Any())
                availableSessions = new List<int> { 1, 2, 3 };

            if (selectedSession == null)
                selectedSession = availableSessions.FirstOrDefault();

            var availableYears = allItems
                .Select(x => x.Year)
                .Distinct()
                .OrderByDescending(x => x)
                .ToList();

            if (!availableYears.Any())
                availableYears = new List<int> { DateTime.Now.Year };

            if (!availableYears.Contains(selectedYear))
                selectedYear = availableYears.First();

            var scopedItems = allItems
                .Where(x => x.Year == selectedYear)
                .Where(x => !selectedSession.HasValue || x.SessionNo == selectedSession)
                .ToList();

            var availableCountries = scopedItems
                .Select(x => x.Country)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(x => x)
                .ToList();

            IEnumerable<RecognitionMemberDashboardApplicationItem> filtered = scopedItems;

            if (!string.IsNullOrWhiteSpace(selectedSearch))
            {
                filtered = filtered.Where(x =>
                    x.ReferenceNo.Contains(selectedSearch, StringComparison.OrdinalIgnoreCase) ||
                    x.UniversityName.Contains(selectedSearch, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.Equals(selectedStatus, "All", StringComparison.OrdinalIgnoreCase))
            {
                filtered = filtered.Where(x =>
                    string.Equals(x.ReviewStatus, selectedStatus, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.Equals(selectedCountry, "All", StringComparison.OrdinalIgnoreCase))
            {
                filtered = filtered.Where(x =>
                    string.Equals(x.Country, selectedCountry, StringComparison.OrdinalIgnoreCase));
            }

            filtered = selectedSort switch
            {
                "OldestActivity" => filtered.OrderBy(x => x.LastActivityDate).ThenBy(x => x.ReferenceNo),
                "UniversityAZ" => filtered.OrderBy(x => x.UniversityName).ThenByDescending(x => x.LastActivityDate),
                _ => filtered.OrderByDescending(x => x.LastActivityDate).ThenBy(x => x.ReferenceNo)
            };

            var filteredItems = filtered.ToList();

            var model = new RecognitionMemberDashboardViewModel
            {
                CurrentRecognitionMember = GetRecognitionMemberDisplayName(currentMember),
                SessionNo = selectedSession,
                Year = selectedYear,
                Search = selectedSearch,
                Status = selectedStatus,
                Country = selectedCountry,
                Sort = selectedSort,
                AvailableSessions = availableSessions,
                AvailableYears = availableYears,
                AvailableCountries = availableCountries,
                AssignedReviewsCount = scopedItems.Count,
                NotReviewedCount = scopedItems.Count(x => x.ReviewStatus == "Not Reviewed"),
                InProgressCount = scopedItems.Count(x => x.ReviewStatus == "In Progress"),
                SubmittedRecommendationsCount = scopedItems.Count(x => x.ReviewStatus == "Recommendation Submitted"),
                Applications = filteredItems,
                RecentActivities = filteredItems
                    .Where(x => x.LastActivityDate > DateTime.MinValue)
                    .OrderByDescending(x => x.LastActivityDate)
                    .Take(6)
                    .Select(x => new RecognitionMemberDashboardActivityItem
                    {
                        Description = $"{x.ReferenceNo} — {x.UniversityName}: {x.ReviewStatus}",
                        ActivityDate = x.LastActivityDate
                    })
                    .ToList(),
                Meetings = meetings
                    .OrderBy(m => m.MeetingDate)
                    .Select(m => new RecognitionMemberDashboardMeetingItem
                    {
                        Id = m.Id,
                        SessionNo = m.SessionNumber,
                        MeetingDate = m.MeetingDate,
                        Notes = m.Notes ?? string.Empty
                    })
                    .ToList()
            };

            return View("~/Views/member/RecognitionMemberDashboard.cshtml", model);
        }

        private static RecognitionMemberDashboardApplicationItem MapDashboardItem(RecognitionRequestRecord request)
        {
            var reviewStatus = ResolveReviewStatus(request);
            var actionLabel = reviewStatus switch
            {
                "In Progress" => "Continue",
                "Returned for Update" => "Comment",
                "Recommendation Submitted" => "View Recommendation",
                _ => "Review"
            };

            return new RecognitionMemberDashboardApplicationItem
            {
                Id = request.Id,
                SessionNo = ResolveSessionNo(request),
                Year = request.Year > 0 ? request.Year : request.SubmittedAt.Year,
                ReferenceNo = string.IsNullOrWhiteSpace(request.ReferenceNumber) ? $"REQ-{request.Id}" : request.ReferenceNumber,
                UniversityName = string.IsNullOrWhiteSpace(request.UniversityName) ? "Unknown University" : request.UniversityName,
                Country = string.IsNullOrWhiteSpace(request.Country) ? "Unknown" : request.Country,
                ReviewStatus = reviewStatus,
                LastActivityDate = request.SubmittedAt,
                ActionLabel = actionLabel
            };
        }

        private static int? ResolveSessionNo(RecognitionRequestRecord request)
        {
            if (!string.IsNullOrWhiteSpace(request.ReferenceNumber))
            {
                var parts = request.ReferenceNumber.Split('-', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length >= 4 && int.TryParse(parts[2], out var parsedSession) && parsedSession > 0)
                    return parsedSession;
            }

            if (request.SubmittedAt != default)
                return ((request.SubmittedAt.Month - 1) / 4) + 1;

            return null;
        }

        private static string ResolveReviewStatus(RecognitionRequestRecord request)
        {
            var status = (request.Status ?? string.Empty).Trim();
            var decision = (request.BasicInfoAssessmentDecision ?? string.Empty).Trim();

            if (!string.IsNullOrWhiteSpace(decision))
                return "Recommendation Submitted";

            if (string.Equals(status, "Returned for Update", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(status, "Requires Admin Review", StringComparison.OrdinalIgnoreCase))
                return "Returned for Update";

            var hasWorkStarted =
                !string.IsNullOrWhiteSpace(request.AccreditationStatus) ||
                !string.IsNullOrWhiteSpace(request.AccreditationNote) ||
                !string.IsNullOrWhiteSpace(request.BasicInfoAssessmentReason) ||
                !string.IsNullOrWhiteSpace(request.FacultiesAssessment) ||
                !string.IsNullOrWhiteSpace(request.HospitalsAssessment) ||
                !string.IsNullOrWhiteSpace(request.LaboratoriesFacilitiesAssessment) ||
                !string.IsNullOrWhiteSpace(request.LibraryAssessment);

            return hasWorkStarted ? "In Progress" : "Not Reviewed";
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
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            return View("~/Views/member/DetailsBasicInfo.cshtml", request);
        }

        [HttpGet]
        public IActionResult DetailsStatistics(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            ViewBag.RequestId = request.Id;
            ViewBag.InstitutionName = request.UniversityName;
            return View("~/Views/member/DetailsStatistics.cshtml", request);
        }

        [HttpGet]
        public IActionResult DetailsAdmissionDuration(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            request.AdmissionStudyDurationReview ??= new AdmissionStudyDurationReviewDto();
            request.StudyDuration ??= new StudyDurationDto();

            return View("~/Views/member/DetailsAdmissionDuration.cshtml", request);
        }

        [HttpGet]
        public IActionResult DetailsDoctors(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            return RedirectToAction("DetailsAcademicInfo", new { id = id.Value });
        }

        [HttpGet]
        public IActionResult DetailsAcademicInfo(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            ViewBag.RequestId = request.Id;
            ViewBag.InstitutionName = request.UniversityName;
            return View("~/Views/member/DetailsAcademicInfo.cshtml", request);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SaveAdmissionDurationReview(
            int id,
            string diplomaDuration,
            string bScDuration,
            string higherDiplomaDuration,
            string masterDuration,
            string phdDuration,
            IFormFile? diplomaSamplePdf,
            IFormFile? bScSamplePdf,
            IFormFile? higherDiplomaSamplePdf,
            IFormFile? masterSamplePdf,
            IFormFile? phdSamplePdf)
        {
            var request = _recognitionRequestService.GetById(id);
            if (!IsCurrentRecognitionMemberOwner(request))
            {
                TempData["ArchiveError"] = "You can only update data for requests assigned to you.";
                return RedirectToAction("ElectronicRequests");
            }

            var existing = request!.AdmissionStudyDurationReview ?? new AdmissionStudyDurationReviewDto();
            var next = new AdmissionStudyDurationReviewDto
            {
                DiplomaDuration = (diplomaDuration ?? string.Empty).Trim(),
                BScDuration = (bScDuration ?? string.Empty).Trim(),
                HigherDiplomaDuration = (higherDiplomaDuration ?? string.Empty).Trim(),
                MasterDuration = (masterDuration ?? string.Empty).Trim(),
                PhdDuration = (phdDuration ?? string.Empty).Trim(),

                DiplomaSamplePdfFileName = existing.DiplomaSamplePdfFileName,
                DiplomaSamplePdfContentBase64 = existing.DiplomaSamplePdfContentBase64,
                BScSamplePdfFileName = existing.BScSamplePdfFileName,
                BScSamplePdfContentBase64 = existing.BScSamplePdfContentBase64,
                HigherDiplomaSamplePdfFileName = existing.HigherDiplomaSamplePdfFileName,
                HigherDiplomaSamplePdfContentBase64 = existing.HigherDiplomaSamplePdfContentBase64,
                MasterSamplePdfFileName = existing.MasterSamplePdfFileName,
                MasterSamplePdfContentBase64 = existing.MasterSamplePdfContentBase64,
                PhdSamplePdfFileName = existing.PhdSamplePdfFileName,
                PhdSamplePdfContentBase64 = existing.PhdSamplePdfContentBase64
            };

            var diplomaUpload = TryReadSamplePdfUpload(diplomaSamplePdf);
            if (!diplomaUpload.ok)
            {
                TempData["AdmissionDurationError"] = diplomaUpload.error;
                return RedirectToAction("DetailsAdmissionDuration", new { id });
            }
            if (diplomaUpload.hasFile)
            {
                next.DiplomaSamplePdfFileName = diplomaUpload.fileName;
                next.DiplomaSamplePdfContentBase64 = diplomaUpload.fileContentBase64;
            }

            var bScUpload = TryReadSamplePdfUpload(bScSamplePdf);
            if (!bScUpload.ok)
            {
                TempData["AdmissionDurationError"] = bScUpload.error;
                return RedirectToAction("DetailsAdmissionDuration", new { id });
            }
            if (bScUpload.hasFile)
            {
                next.BScSamplePdfFileName = bScUpload.fileName;
                next.BScSamplePdfContentBase64 = bScUpload.fileContentBase64;
            }

            var higherDiplomaUpload = TryReadSamplePdfUpload(higherDiplomaSamplePdf);
            if (!higherDiplomaUpload.ok)
            {
                TempData["AdmissionDurationError"] = higherDiplomaUpload.error;
                return RedirectToAction("DetailsAdmissionDuration", new { id });
            }
            if (higherDiplomaUpload.hasFile)
            {
                next.HigherDiplomaSamplePdfFileName = higherDiplomaUpload.fileName;
                next.HigherDiplomaSamplePdfContentBase64 = higherDiplomaUpload.fileContentBase64;
            }

            var masterUpload = TryReadSamplePdfUpload(masterSamplePdf);
            if (!masterUpload.ok)
            {
                TempData["AdmissionDurationError"] = masterUpload.error;
                return RedirectToAction("DetailsAdmissionDuration", new { id });
            }
            if (masterUpload.hasFile)
            {
                next.MasterSamplePdfFileName = masterUpload.fileName;
                next.MasterSamplePdfContentBase64 = masterUpload.fileContentBase64;
            }

            var phdUpload = TryReadSamplePdfUpload(phdSamplePdf);
            if (!phdUpload.ok)
            {
                TempData["AdmissionDurationError"] = phdUpload.error;
                return RedirectToAction("DetailsAdmissionDuration", new { id });
            }
            if (phdUpload.hasFile)
            {
                next.PhdSamplePdfFileName = phdUpload.fileName;
                next.PhdSamplePdfContentBase64 = phdUpload.fileContentBase64;
            }

            var ok = _recognitionRequestService.SaveAdmissionStudyDurationReview(id, next);
            if (!ok)
            {
                TempData["AdmissionDurationError"] = "Unable to save Admission Requirements and Study Duration.";
                return RedirectToAction("DetailsAdmissionDuration", new { id });
            }

            TempData["AdmissionDurationSaved"] = "Admission Requirements and Study Duration saved successfully.";
            return RedirectToAction("DetailsAdmissionDuration", new { id });
        }

        [HttpGet]
        public IActionResult DownloadAdmissionSamplePdf(int id, string level, bool inline = false)
        {
            var request = _recognitionRequestService.GetById(id);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            var review = request.AdmissionStudyDurationReview ?? new AdmissionStudyDurationReviewDto();
            var normalizedLevel = (level ?? string.Empty).Trim();

            var file = normalizedLevel switch
            {
                "Diploma" => (review.DiplomaSamplePdfFileName, review.DiplomaSamplePdfContentBase64),
                "BSc" => (review.BScSamplePdfFileName, review.BScSamplePdfContentBase64),
                "HigherDiploma" => (review.HigherDiplomaSamplePdfFileName, review.HigherDiplomaSamplePdfContentBase64),
                "Master" => (review.MasterSamplePdfFileName, review.MasterSamplePdfContentBase64),
                "PhD" => (review.PhdSamplePdfFileName, review.PhdSamplePdfContentBase64),
                _ => (string.Empty, string.Empty)
            };

            if (string.IsNullOrWhiteSpace(file.Item1) || string.IsNullOrWhiteSpace(file.Item2))
                return NotFound("No sample PDF uploaded for this level.");

            byte[] bytes;
            try
            {
                var base64 = file.Item2.Trim();
                if (base64.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                {
                    var commaIndex = base64.IndexOf(',');
                    if (commaIndex >= 0 && commaIndex + 1 < base64.Length)
                        base64 = base64[(commaIndex + 1)..];
                }

                bytes = Convert.FromBase64String(base64);
            }
            catch
            {
                return BadRequest("Stored PDF content is invalid.");
            }

            var safeName = Path.GetFileName(file.Item1);
            if (inline)
            {
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{safeName}\"";
                return File(bytes, "application/pdf");
            }

            return File(bytes, "application/pdf", safeName);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SaveGlobalRankings(
            int id,
            string arwuValue,
            bool arwuIsNa,
            string qsValue,
            bool qsIsNa,
            string theValue,
            bool theIsNa,
            string scopusValue,
            bool scopusIsNa)
        {
            var request = _recognitionRequestService.GetById(id);
            if (!IsCurrentRecognitionMemberOwner(request))
            {
                TempData["ArchiveError"] = "You can only update data for requests assigned to you.";
                return RedirectToAction("ElectronicRequests");
            }

            var model = new GlobalRankingsDto
            {
                ArwuIsNa = arwuIsNa,
                ArwuValue = arwuIsNa ? string.Empty : (arwuValue ?? string.Empty).Trim(),
                QsIsNa = qsIsNa,
                QsValue = qsIsNa ? string.Empty : (qsValue ?? string.Empty).Trim(),
                TheIsNa = theIsNa,
                TheValue = theIsNa ? string.Empty : (theValue ?? string.Empty).Trim(),
                ScopusIsNa = scopusIsNa,
                ScopusValue = scopusIsNa ? string.Empty : (scopusValue ?? string.Empty).Trim()
            };

            var ok = _recognitionRequestService.SaveGlobalRankings(id, model);
            if (!ok)
            {
                TempData["RankingsError"] = "Unable to save rankings data.";
                return RedirectToAction("DetailsAccreditationBodies", new { id });
            }

            TempData["RankingsSaved"] = "Research & Global Rankings saved successfully.";
            return RedirectToAction("DetailsAccreditationBodies", new { id });
        }

        [HttpGet]
        public IActionResult DetailsAccreditationBodies(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            ViewBag.RequestId = request.Id;
            ViewBag.InstitutionName = request.UniversityName;
            return View("~/Views/member/DetailsAccreditationBodies.cshtml", request);
        }

        [HttpGet]
        public IActionResult DetailsRankings(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            return RedirectToAction("DetailsAccreditationBodies", new { id = request.Id });
        }

        [HttpGet]
        public IActionResult DetailsInfrastructure(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            return View("~/Views/member/DetailsInfrastructure.cshtml", request);
        }

        [HttpGet]
        public IActionResult DetailsRecommendation(int? id)
        {
            if (id == null)
                return RedirectToAction("ElectronicRequests");

            var request = _recognitionRequestService.GetById(id.Value);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRole = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRole, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
                return RedirectToAction("ElectronicRequests");

            return View("~/Views/member/DetailsRecommendation.cshtml", request);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SaveInfrastructureNotes(
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
            string libraryAssessmentNote,
            string? nextAction = null)
        {
            var request = _recognitionRequestService.GetById(id);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRoleInfra = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRoleInfra, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
            {
                TempData["ArchiveError"] = "You can only update notes for requests assigned to you.";
                return RedirectToAction("ElectronicRequests");
            }

            bool needsImprovementMissingNote =
                (string.Equals(facultiesAssessment, "Needs Improvement", StringComparison.Ordinal) && string.IsNullOrWhiteSpace(facultiesAssessmentNote)) ||
                (string.Equals(hospitalsAssessment, "Needs Improvement", StringComparison.Ordinal) && string.IsNullOrWhiteSpace(hospitalsAssessmentNote)) ||
                (string.Equals(hospitalEnvironmentAssessment, "Needs Improvement", StringComparison.Ordinal) && string.IsNullOrWhiteSpace(hospitalEnvironmentAssessmentNote)) ||
                (string.Equals(laboratoriesFacilitiesAssessment, "Needs Improvement", StringComparison.Ordinal) && string.IsNullOrWhiteSpace(laboratoriesFacilitiesAssessmentNote)) ||
                (string.Equals(libraryAssessment, "Needs Improvement", StringComparison.Ordinal) && string.IsNullOrWhiteSpace(libraryAssessmentNote));

            if (needsImprovementMissingNote)
            {
                TempData["InfraSaveError"] = "Please add a professional note for each section marked as Needs Improvement.";
                return RedirectToAction("DetailsInfrastructure", new { id });
            }

            var ok = _recognitionRequestService.SaveInfrastructureNotes(
                id,
                facultiesAssessment,
                hospitalsAssessment,
                hospitalEnvironmentAssessment,
                laboratoriesFacilitiesAssessment,
                libraryAssessment,
                facultiesAssessmentNote,
                hospitalsAssessmentNote,
                hospitalEnvironmentAssessmentNote,
                laboratoriesFacilitiesAssessmentNote,
                libraryAssessmentNote);
            if (!ok)
            {
                TempData["InfraSaveError"] = "Unable to save infrastructure assessments.";
                return RedirectToAction("DetailsInfrastructure", new { id });
            }

            if (string.Equals(nextAction, "continue", StringComparison.OrdinalIgnoreCase))
                return RedirectToAction("DetailsRecommendation", new { id });

            TempData["InfraSaved"] = "Infrastructure assessments saved successfully.";
            return RedirectToAction("DetailsInfrastructure", new { id });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SaveRecommendationDecision(int id, string accreditationStatus, string accreditationNote, string decision, string reason)
        {
            var request = _recognitionRequestService.GetById(id);
            if (request == null)
                return RedirectToAction("ElectronicRequests");

            var currentRoleRec = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            if (string.Equals(currentRoleRec, "recognition", StringComparison.OrdinalIgnoreCase) && !IsCurrentRecognitionMemberOwner(request))
            {
                TempData["ArchiveError"] = "You can only update decisions for requests assigned to you.";
                return RedirectToAction("ElectronicRequests");
            }

            var normalizedAccreditation = (accreditationStatus ?? string.Empty).Trim();
            var validStatuses = new[] { "Compliant", "Needs Review", "Not Compliant" };
            if (!validStatuses.Contains(normalizedAccreditation))
            {
                TempData["RecommendationError"] = "Please select a valid accreditation status for Point 1.";
                return RedirectToAction("DetailsRecommendation", new { id });
            }

            if (string.IsNullOrWhiteSpace(reason))
            {
                TempData["RecommendationError"] = "Please provide a final justification note.";
                return RedirectToAction("DetailsRecommendation", new { id });
            }

            var normalizedDecision = (decision ?? string.Empty).Trim();
            var validDecisions = new[] { "Approve", "Conditional Approval", "Reject / Committee Review" };
            if (!validDecisions.Contains(normalizedDecision))
                normalizedDecision = "Conditional Approval";

            var ok = _recognitionRequestService.SaveBasicInfoAssessment(
                id, normalizedDecision, (reason ?? string.Empty).Trim(),
                normalizedAccreditation, (accreditationNote ?? string.Empty).Trim());

            if (!ok)
            {
                TempData["RecommendationError"] = "Unable to save recommendation decision.";
            }
            else
            {
                TempData["RecommendationSaved"] = "Final assessment decision saved successfully.";
            }

            return RedirectToAction("DetailsRecommendation", new { id });
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

        public IActionResult Requests()
        {
            var requests = _recognitionRequestService.GetAll();
            return View("~/Views/Admin/Requests.cshtml", requests);
        }

        private static List<MeetingDto> meetings = new List<MeetingDto>();

        // ===================== MEETINGS LIST =====================
        public IActionResult Meetings()
        {
            return View("~/Views/Admin/Meetings.cshtml", meetings);
        }

        // ===================== CREATE (GET) =====================
        public IActionResult CreateMeeting()
        {
            var requests = _recognitionRequestService.GetAll();
            ViewBag.AvailableRequests = requests;
            ViewBag.NextSessionNumber = meetings.Count + 1;

            return View("~/Views/Admin/CreateMeeting.cshtml");
        }

        // ===================== CREATE (POST) =====================
        [HttpPost]
        public IActionResult CreateMeeting(MeetingDto model)
        {
            model.Id = meetings.Count + 1;
            model.SessionNumber = meetings.Count + 1;

            model.MeetingTitle = (model.MeetingTitle ?? string.Empty).Trim();
            model.MeetingTime = (model.MeetingTime ?? string.Empty).Trim();
            model.LocationOrPlatform = (model.LocationOrPlatform ?? string.Empty).Trim();
            model.Status = NormalizeMeetingStatus(model.Status);

            model.RequestIds ??= new List<int>();

            meetings.Add(model);

            return RedirectToAction("Meetings");
        }

        // ===================== DETAILS =====================
        public IActionResult MeetingDetails(int id, string? from)
        {
            var role = HttpContext.Session.GetString("CurrentStaffRole") ?? "";
            var isRecognitionMember = string.Equals(role, "recognition", StringComparison.OrdinalIgnoreCase)
                                      || string.Equals(from, "member", StringComparison.OrdinalIgnoreCase);

            var meeting = meetings.FirstOrDefault(m => m.Id == id);

            if (meeting == null)
            {
                if (isRecognitionMember)
                    return RedirectToAction("RecognitionMemberMeetings");
                return RedirectToAction("Meetings");
            }

            var allRequests = _recognitionRequestService.GetAll();

            var linked = allRequests
                .Where(r => meeting.RequestIds.Contains(r.Id))
                .ToList();

            ViewBag.LinkedRequests = linked;
            ViewBag.BackToMember = isRecognitionMember;

            return View("~/Views/Admin/MeetingDetails.cshtml", meeting);
        }
        public IActionResult MemberMeetings()
        {
            return View("~/Views/Member/MemberMeetings.cshtml", meetings);
        }

        [HttpGet]
        public IActionResult RecognitionMemberMeetings(int? sessionNo, int? year)
        {
            var currentMember = GetCurrentRecognitionMember();
            var assignedRequestIds = _recognitionRequestService
                .GetAll()
                .Where(x => string.Equals(x.AssignedMember, currentMember, StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id)
                .ToHashSet();

            var selectedSession = sessionNo;
            var selectedYear = year;

            var memberMeetings = meetings
                .Where(m =>
                    !(m.RequestIds?.Any() ?? false) || // general admin meetings (no request linking yet)
                    m.RequestIds.Any(id => assignedRequestIds.Contains(id))) // assigned to member through requests
                .Where(m => !selectedSession.HasValue || m.SessionNumber == selectedSession.Value)
                .Where(m => !selectedYear.HasValue || m.MeetingDate.Year == selectedYear.Value)
                .OrderBy(m => m.MeetingDate)
                .ThenBy(m => m.SessionNumber)
                .ToList();

            var model = new RecognitionMemberMeetingsViewModel
            {
                CurrentRecognitionMember = GetRecognitionMemberDisplayName(currentMember),
                SessionNo = selectedSession,
                Year = selectedYear,
                Meetings = memberMeetings
            };

            return View("~/Views/member/RecognitionMemberMeetings.cshtml", model);
        }
        
        public IActionResult UniPostgraduateInstructions()
        {
            return View("~/Views/uni/UniPostgraduateEntry.cshtml");
        }
        [HttpPost]
        public IActionResult SavePostgraduatePrograms(
    bool HasMaster,
    bool HasPhD,
    bool HasDiploma,
    IFormFile MasterFile,
    IFormFile PhDFile,
    IFormFile DiplomaFile)
        {
            // TODO: read according the degree

            return RedirectToAction("UniPostgraduateInstructions");
        }

        private static string NormalizeMeetingStatus(string? value)
        {
            var status = (value ?? string.Empty).Trim();
            return status switch
            {
                "Scheduled" => "Scheduled",
                "Completed" => "Completed",
                "Cancelled" => "Cancelled",
                "Pending Confirmation" => "Pending Confirmation",
                _ => "Scheduled"
            };
        }

        public IActionResult AdminRequestDetails(int id)
        {
            var request = _recognitionRequestService.GetById(id);

            if (request == null)
                return NotFound();

            return View("~/Views/Admin/AdminRequestDetails.cshtml", request);
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

        private static (bool ok, bool hasFile, string fileName, string fileContentBase64, string error) TryReadSamplePdfUpload(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return (true, false, string.Empty, string.Empty, string.Empty);

            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (ext != ".pdf")
                return (false, false, string.Empty, string.Empty, "Only PDF files are allowed for sample requirement upload.");

            const long maxSizeBytes = 10 * 1024 * 1024;
            if (file.Length > maxSizeBytes)
                return (false, false, string.Empty, string.Empty, "Sample requirement PDF must be 10 MB or smaller.");

            using var ms = new MemoryStream();
            file.CopyTo(ms);
            var bytes = ms.ToArray();

            return (
                true,
                true,
                Path.GetFileName(file.FileName),
                Convert.ToBase64String(bytes),
                string.Empty
            );
        }
    }
}
