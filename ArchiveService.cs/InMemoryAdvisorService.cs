using MOHRecognition.DTOs;

namespace MOHRecognition.Services
{
    public class InMemoryAdvisorService : IAdvisorService
    {
        private static readonly object _lock = new();
        private static int _nextId = 9;

        private static readonly List<AdvisorDto> _advisors = new()
        {
            new AdvisorDto { Id = 1, FullName = "Prof. Suhail Hadadeen",                          Email = "suhail.Haddadin@ju.edu.jo",    Phone = "0797443736", Specialization = "PhD in Law",                    Workplace = "The University of Jordan",     Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 2, FullName = "Prof. Khalid Draibekeh",                          Email = "k.darabkeh@ju.edu.jo",          Phone = "0796969219", Specialization = "PhD in Computer Science",      Workplace = "The University of Jordan",     Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 3, FullName = "Prof. Qasim Al-Rdaideh",                          Email = "Qasemr@yu.edu.jo",              Phone = "0799906229", Specialization = "PhD in Cybersecurity",         Workplace = "Yarmouk University",            Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 4, FullName = "Prof. Suzan Hatar",                               Email = "Susanhattar@yahoo.com",          Phone = "0795642613", Specialization = "PhD in Dentistry",             Workplace = "The University of Jordan",     Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 7, FullName = "H.E. Minister of Higher Education / Prof. Dr. Azmi Mahafzah",                  Email = "minister@mohe.gov.jo",         Phone = "", Specialization = "",                              Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor },
            new AdvisorDto { Id = 8, FullName = "Secretary General (Acting) / Mr. Shadi Al-Musa'idah",                          Email = "sg@mohe.gov.jo",               Phone = "", Specialization = "",                              Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor },
            new AdvisorDto { Id = 5, FullName = "Director of Recognition / Dr. Aseel Al-Muhaysen",                              Email = "Aseel.Almuhaisen@mohe.gov.jo", Phone = "0797285669", Specialization = "PhD in Business Administration", Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor },
            new AdvisorDto { Id = 6, FullName = "Head of Recognition Section / Dr. Basel Khudr",                                Email = "Basel.Khader@MOHE.GOV.JO",     Phone = "0798837574", Specialization = "PhD in Value Chain Management",  Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor },
        };

        private static string NormalizeEmail(string? email)
            => (email ?? "").Trim().ToLowerInvariant();

        public IReadOnlyList<AdvisorDto> GetAll()
        {
            lock (_lock) return _advisors.ToList();
        }

        public AdvisorDto? GetById(int id)
        {
            lock (_lock) return _advisors.FirstOrDefault(a => a.Id == id);
        }

        public IReadOnlyList<AdvisorDto> GetRecognitionMembers()
        {
            lock (_lock)
                return _advisors.Where(a => a.Type == AdvisorType.RecognitionMember).ToList();
        }

        public IReadOnlyList<AdvisorDto> GetMinistryAdvisors()
        {
            lock (_lock)
                return _advisors.Where(a => a.Type == AdvisorType.MinistryAdvisor).ToList();
        }

        public AdvisorDto? FindByEmail(string email)
        {
            var normalized = NormalizeEmail(email);
            lock (_lock)
                return _advisors.FirstOrDefault(a =>
                    a.Type == AdvisorType.RecognitionMember &&
                    NormalizeEmail(a.Email) == normalized);
        }

        public void Add(AdvisorDto advisor)
        {
            lock (_lock)
            {
                advisor.Id = _nextId++;
                _advisors.Add(advisor);
            }
        }

        public void Update(AdvisorDto advisor)
        {
            lock (_lock)
            {
                var idx = _advisors.FindIndex(a => a.Id == advisor.Id);
                if (idx >= 0) _advisors[idx] = advisor;
            }
        }

        public void Remove(int id)
        {
            lock (_lock) _advisors.RemoveAll(a => a.Id == id);
        }
    }
}
