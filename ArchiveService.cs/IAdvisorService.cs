using MOHRecognition.DTOs;

namespace MOHRecognition.Services
{
    public interface IAdvisorService
    {
        Task<IReadOnlyList<AdvisorDto>> GetAll();
        Task<AdvisorDto?>               GetById(int id);
        Task<IReadOnlyList<AdvisorDto>> GetRecognitionMembers();
        Task<IReadOnlyList<AdvisorDto>> GetMinistryAdvisors();
        Task<AdvisorDto?>               FindByEmail(string email);
        Task Add(AdvisorDto advisor);
        Task Update(AdvisorDto advisor);
        Task Remove(int id);
    }
}
