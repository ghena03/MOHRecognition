using Microsoft.EntityFrameworkCore;
using MOHRecognition.Data;
using MOHRecognition.DTOs;

namespace MOHRecognition.Services;

public sealed class DatabaseAdvisorService : IAdvisorService
{
    private readonly AppDbContext _db;

    public DatabaseAdvisorService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<AdvisorDto>> GetAll()
    {
        try { return await _db.Advisors.AsNoTracking().OrderBy(a => a.SortOrder).ThenBy(a => a.Id).ToListAsync(); }
        catch (Exception ex) { Console.WriteLine($"[DB] Advisors.GetAll failed: {ex.Message}"); return Array.Empty<AdvisorDto>(); }
    }

    public async Task<AdvisorDto?> GetById(int id)
    {
        try { return await _db.Advisors.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id); }
        catch { return null; }
    }

    public async Task<IReadOnlyList<AdvisorDto>> GetRecognitionMembers()
    {
        try
        {
            return await _db.Advisors.AsNoTracking()
                             .Where(a => a.Type == AdvisorType.RecognitionMember)
                             .OrderBy(a => a.SortOrder).ThenBy(a => a.Id)
                             .ToListAsync();
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Advisors.GetRecognitionMembers failed: {ex.Message}"); return Array.Empty<AdvisorDto>(); }
    }

    public async Task<IReadOnlyList<AdvisorDto>> GetMinistryAdvisors()
    {
        try
        {
            return await _db.Advisors.AsNoTracking()
                             .Where(a => a.Type == AdvisorType.MinistryAdvisor)
                             .OrderBy(a => a.SortOrder).ThenBy(a => a.Id)
                             .ToListAsync();
        }
        catch { return Array.Empty<AdvisorDto>(); }
    }

    public async Task<AdvisorDto?> FindByEmail(string email)
    {
        try
        {
            var normalized = (email ?? "").Trim().ToLowerInvariant();
            var members = await _db.Advisors.AsNoTracking()
                                   .Where(a => a.Type == AdvisorType.RecognitionMember)
                                   .ToListAsync();
            return members.FirstOrDefault(a => (a.Email ?? "").Trim().ToLowerInvariant() == normalized);
        }
        catch { return null; }
    }

    public async Task Add(AdvisorDto advisor)
    {
        try
        {
            advisor.Id = 0;
            _db.Advisors.Add(advisor);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Advisors.Add failed: {ex.Message}"); }
    }

    public async Task Update(AdvisorDto advisor)
    {
        try
        {
            var existing = await _db.Advisors.FindAsync(advisor.Id);
            if (existing is null) return;

            existing.FullName       = advisor.FullName;
            existing.Position       = advisor.Position;
            existing.Email          = string.IsNullOrWhiteSpace(advisor.Email) ? null : advisor.Email.Trim();
            existing.Phone          = advisor.Phone;
            existing.Specialization = advisor.Specialization;
            existing.Workplace      = advisor.Workplace;
            existing.Type           = advisor.Type;
            await _db.SaveChangesAsync();
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Advisors.Update failed: {ex.Message}"); }
    }

    public async Task Remove(int id)
    {
        try
        {
            var advisor = await _db.Advisors.FindAsync(id);
            if (advisor is not null)
            {
                _db.Advisors.Remove(advisor);
                await _db.SaveChangesAsync();
            }
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Advisors.Remove({id}) failed: {ex.Message}"); }
    }
}
