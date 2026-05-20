using MOHRecognition.DTOs;

namespace MOHRecognition.Services
{
    public interface IAdvisorService
    {
        IReadOnlyList<AdvisorDto> GetAll();
        AdvisorDto?               GetById(int id);
        IReadOnlyList<AdvisorDto> GetRecognitionMembers();
        IReadOnlyList<AdvisorDto> GetMinistryAdvisors();
        AdvisorDto?               FindByEmail(string email);
        void Add(AdvisorDto advisor);
        void Update(AdvisorDto advisor);
        void Remove(int id);
    }
}
