using MOHRecognition.DTOs;

namespace MOHRecognition.Services
{
    public class InMemoryAdvisorService : IAdvisorService
    {
        private static readonly object _lock = new();
        private static int _nextId = 9;

        private static readonly List<AdvisorDto> _advisors = new()
        {
            new AdvisorDto { Id = 7, FullName = "H.E. Prof. Dr. Azmi Mahafzah",      FullNameAr = "الأستاذ الدكتور عزمي محافظة",          Position = "Minister of Higher Education and Scientific Research",                                  Email = null,                            Phone = "",           Specialization = "",                           Workplace = "Ministry of Higher Education and Scientific Research", Type = AdvisorType.MinistryAdvisor,   SortOrder = 10 },
            new AdvisorDto { Id = 8, FullName = "Mr. Shadi Al-Musa'adah",             FullNameAr = "السيد شادي المساعده",                   Position = "Acting Secretary General of the Ministry of Higher Education and Scientific Research",  Email = null,                            Phone = "",           Specialization = "",                           Workplace = "Ministry of Higher Education and Scientific Research", Type = AdvisorType.MinistryAdvisor,   SortOrder = 20 },
            new AdvisorDto { Id = 5, FullName = "Dr. Aseel Al-Muhaisen",              FullNameAr = "الدكتورة اسيل المحيسن",                 Position = "Director of University Recognition and Certificate Equivalency Directorate",            Email = "Aseel.Almuhaisen@mohe.gov.jo",  Phone = "0797285669", Specialization = "PhD Business Administration", Workplace = "Ministry of Higher Education and Scientific Research", Type = AdvisorType.MinistryAdvisor,   SortOrder = 30 },
            new AdvisorDto { Id = 6, FullName = "Dr. Basel Khader",                   FullNameAr = "الدكتور باسل خضر",                      Position = "Head of Recognition Department / Committee Secretary",                                  Email = "Basel.Khader@MOHE.GOV.JO",      Phone = "0798837574", Specialization = "PhD Value Chains",            Workplace = "Ministry of Higher Education and Scientific Research", Type = AdvisorType.MinistryAdvisor,   SortOrder = 40 },
            new AdvisorDto { Id = 1, FullName = "Prof. Dr. Khaled Ahmad Darabkeh",    FullNameAr = "الأستاذ الدكتور خالد احمد درابكه",     Position = "Recognition Committee Member",                                                         Email = "k.darabkeh@ju.edu.jo",          Phone = "0796969219", Specialization = "PhD Computer Science",       Workplace = "University of Jordan",                                  Type = AdvisorType.RecognitionMember, SortOrder = 60 },
            new AdvisorDto { Id = 3, FullName = "Prof. Dr. Qasem Ahmad Al-Rawaidah",  FullNameAr = "الأستاذ الدكتور قاسم احمد الردايده",   Position = "Recognition Committee Member",                                                         Email = "Qasemr@yu.edu.jo",              Phone = "0799906229", Specialization = "PhD Cybersecurity",          Workplace = "Yarmouk University",                                    Type = AdvisorType.RecognitionMember, SortOrder = 70 },
            new AdvisorDto { Id = 2, FullName = "Prof. Dr. Suhail Haitham Haddadin",  FullNameAr = "الأستاذ الدكتور سهيل هيثم حدادين",    Position = "Recognition Committee Member",                                                         Email = "suhail.Haddadin@ju.edu.jo",     Phone = "0797443736", Specialization = "PhD Law",                    Workplace = "University of Jordan",                                  Type = AdvisorType.RecognitionMember, SortOrder = 80 },
            new AdvisorDto { Id = 4, FullName = "Prof. Dr. Suzan Nobair Hattar",      FullNameAr = "الأستاذة الدكتورة سوزان نويصر حتر",   Position = "Recognition Committee Member",                                                         Email = "Susanhattar@yahoo.com",          Phone = "0795642613", Specialization = "PhD Dentistry",              Workplace = "University of Jordan",                                  Type = AdvisorType.RecognitionMember, SortOrder = 90 },
        };

        private static string NormalizeEmail(string? email)
            => (email ?? "").Trim().ToLowerInvariant();

        public Task<IReadOnlyList<AdvisorDto>> GetAll()
        {
            lock (_lock) return Task.FromResult<IReadOnlyList<AdvisorDto>>(_advisors.ToList());
        }

        public Task<AdvisorDto?> GetById(int id)
        {
            lock (_lock) return Task.FromResult(_advisors.FirstOrDefault(a => a.Id == id));
        }

        public Task<IReadOnlyList<AdvisorDto>> GetRecognitionMembers()
        {
            lock (_lock)
                return Task.FromResult<IReadOnlyList<AdvisorDto>>(
                    _advisors.Where(a => a.Type == AdvisorType.RecognitionMember).ToList());
        }

        public Task<IReadOnlyList<AdvisorDto>> GetMinistryAdvisors()
        {
            lock (_lock)
                return Task.FromResult<IReadOnlyList<AdvisorDto>>(
                    _advisors.Where(a => a.Type == AdvisorType.MinistryAdvisor).ToList());
        }

        public Task<AdvisorDto?> FindByEmail(string email)
        {
            var normalized = NormalizeEmail(email);
            lock (_lock)
                return Task.FromResult(_advisors.FirstOrDefault(a =>
                    a.Type == AdvisorType.RecognitionMember &&
                    NormalizeEmail(a.Email) == normalized));
        }

        public Task Add(AdvisorDto advisor)
        {
            lock (_lock)
            {
                advisor.Id = _nextId++;
                _advisors.Add(advisor);
            }
            return Task.CompletedTask;
        }

        public Task Update(AdvisorDto advisor)
        {
            lock (_lock)
            {
                var idx = _advisors.FindIndex(a => a.Id == advisor.Id);
                if (idx >= 0) _advisors[idx] = advisor;
            }
            return Task.CompletedTask;
        }

        public Task Remove(int id)
        {
            lock (_lock) _advisors.RemoveAll(a => a.Id == id);
            return Task.CompletedTask;
        }
    }
}
