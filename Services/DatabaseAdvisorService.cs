using Microsoft.EntityFrameworkCore;
using MOHRecognition.Data;
using MOHRecognition.DTOs;

namespace MOHRecognition.Services;

public sealed class DatabaseAdvisorService : IAdvisorService
{
    private readonly AppDbContext _db;

    public DatabaseAdvisorService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<AdvisorDto>> GetAll() =>
        await _db.Advisors.AsNoTracking().OrderBy(a => a.Id).ToListAsync();

    public async Task<AdvisorDto?> GetById(int id) =>
        await _db.Advisors.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IReadOnlyList<AdvisorDto>> GetRecognitionMembers() =>
        await _db.Advisors.AsNoTracking()
                 .Where(a => a.Type == AdvisorType.RecognitionMember)
                 .OrderBy(a => a.Id)
                 .ToListAsync();

    public async Task<IReadOnlyList<AdvisorDto>> GetMinistryAdvisors() =>
        await _db.Advisors.AsNoTracking()
                 .Where(a => a.Type == AdvisorType.MinistryAdvisor)
                 .OrderBy(a => a.Id)
                 .ToListAsync();

    public async Task<AdvisorDto?> FindByEmail(string email)
    {
        var normalized = (email ?? "").Trim().ToLowerInvariant();
        // ToList first — SQLite/Npgsql default collation is case-sensitive
        var members = await _db.Advisors.AsNoTracking()
                               .Where(a => a.Type == AdvisorType.RecognitionMember)
                               .ToListAsync();
        return members.FirstOrDefault(a => a.Email.Trim().ToLowerInvariant() == normalized);
    }

    public async Task Add(AdvisorDto advisor)
    {
        advisor.Id = 0;
        _db.Advisors.Add(advisor);
        await _db.SaveChangesAsync();
    }

    public async Task Update(AdvisorDto advisor)
    {
        var existing = await _db.Advisors.FindAsync(advisor.Id);
        if (existing is null) return;

        existing.FullName       = advisor.FullName;
        existing.Email          = advisor.Email;
        existing.Phone          = advisor.Phone;
        existing.Specialization = advisor.Specialization;
        existing.Workplace      = advisor.Workplace;
        existing.Type           = advisor.Type;
        await _db.SaveChangesAsync();
    }

    public async Task Remove(int id)
    {
        var advisor = await _db.Advisors.FindAsync(id);
        if (advisor is not null)
        {
            _db.Advisors.Remove(advisor);
            await _db.SaveChangesAsync();
        }
    }
}
