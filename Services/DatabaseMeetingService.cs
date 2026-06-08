using Microsoft.EntityFrameworkCore;
using MOHRecognition.Data;
using MOHRecognition.DTOs;

namespace MOHRecognition.Services;

public sealed class DatabaseMeetingService : IMeetingService
{
    private readonly AppDbContext _db;

    public DatabaseMeetingService(AppDbContext db) => _db = db;

    // ── Meetings ───────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<MeetingDto>> GetAll()
    {
        try { return await _db.Meetings.AsNoTracking().OrderBy(m => m.SessionNumber).ToListAsync(); }
        catch (Exception ex) { Console.WriteLine($"[DB] Meetings.GetAll failed: {ex.Message}"); return Array.Empty<MeetingDto>(); }
    }

    public async Task<MeetingDto?> GetById(int id)
    {
        try { return await _db.Meetings.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id); }
        catch (Exception ex) { Console.WriteLine($"[DB] Meetings.GetById({id}) failed: {ex.Message}"); return null; }
    }

    public async Task<MeetingDto> Add(MeetingDto meeting)
    {
        try
        {
            meeting.Id            = 0;
            meeting.SessionNumber = (await _db.Meetings.MaxAsync(m => (int?)m.SessionNumber) ?? 0) + 1;
            meeting.MeetingTitle  = (meeting.MeetingTitle  ?? "").Trim();
            meeting.MeetingTime   = (meeting.MeetingTime   ?? "").Trim();
            meeting.LocationOrPlatform = (meeting.LocationOrPlatform ?? "").Trim();
            meeting.Status        = NormalizeMeetingStatus(meeting.Status);
            _db.Meetings.Add(meeting);
            await _db.SaveChangesAsync();
            return meeting;
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Meetings.Add failed: {ex.Message}"); return meeting; }
    }

    public async Task<bool> Update(int id, MeetingDto patch)
    {
        try
        {
            var meeting = await _db.Meetings.FindAsync(id);
            if (meeting is null) return false;

            meeting.MeetingTitle       = (patch.MeetingTitle       ?? "").Trim();
            meeting.MeetingDate        = patch.MeetingDate;
            meeting.MeetingTime        = (patch.MeetingTime        ?? "").Trim();
            meeting.LocationOrPlatform = (patch.LocationOrPlatform ?? "").Trim();
            meeting.Notes              = (patch.Notes              ?? "").Trim();
            meeting.RequestIds         = patch.RequestIds ?? new List<int>();
            meeting.Status             = NormalizeMeetingStatus(patch.Status);
            _db.Entry(meeting).Property(x => x.RequestIds).IsModified = true;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Meetings.Update({id}) failed: {ex.Message}"); return false; }
    }

    public async Task<bool> Delete(int id)
    {
        try
        {
            var meeting = await _db.Meetings.FindAsync(id);
            if (meeting is null) return false;

            var decisions = await _db.MeetingDecisions.Where(d => d.MeetingId == id).ToListAsync();
            _db.MeetingDecisions.RemoveRange(decisions);
            _db.Meetings.Remove(meeting);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Meetings.Delete({id}) failed: {ex.Message}"); return false; }
    }

    public async Task<bool> Close(int id)
    {
        try
        {
            var meeting = await _db.Meetings.FindAsync(id);
            if (meeting is null) return false;
            meeting.Status = "Closed";
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex) { Console.WriteLine($"[DB] Meetings.Close({id}) failed: {ex.Message}"); return false; }
    }

    public async Task<int> GetNextSessionNumber()
    {
        try { return (await _db.Meetings.MaxAsync(m => (int?)m.SessionNumber) ?? 0) + 1; }
        catch { return 1; }
    }

    public async Task<int> CountByStatus(string status)
    {
        try { return await _db.Meetings.CountAsync(m => m.Status == status); }
        catch { return 0; }
    }

    public async Task<HashSet<int>> GetClosedMeetingRequestIds()
    {
        try
        {
            var closedMeetings = await _db.Meetings.AsNoTracking()
                                          .Where(m => m.Status == "Closed")
                                          .ToListAsync();
            return closedMeetings.SelectMany(m => m.RequestIds).ToHashSet();
        }
        catch (Exception ex) { Console.WriteLine($"[DB] GetClosedMeetingRequestIds failed: {ex.Message}"); return new HashSet<int>(); }
    }

    // ── Decisions ──────────────────────────────────────────────────────────────

    public async Task<MeetingDecisionDto?> GetDecision(int meetingId, int requestId)
    {
        try { return await _db.MeetingDecisions.AsNoTracking().FirstOrDefaultAsync(d => d.MeetingId == meetingId && d.RequestId == requestId); }
        catch { return null; }
    }

    public async Task SaveDecision(MeetingDecisionDto decision)
    {
        try
        {
            var existing = await _db.MeetingDecisions.FindAsync(decision.MeetingId, decision.RequestId);
            if (existing is null)
                _db.MeetingDecisions.Add(decision);
            else
            {
                existing.Decision = decision.Decision;
                existing.Notes    = decision.Notes;
                existing.SavedAt  = decision.SavedAt;
            }
            await _db.SaveChangesAsync();
        }
        catch (Exception ex) { Console.WriteLine($"[DB] SaveDecision failed: {ex.Message}"); }
    }

    public async Task<IReadOnlyList<MeetingDecisionDto>> GetAllDecisions()
    {
        try { return await _db.MeetingDecisions.AsNoTracking().ToListAsync(); }
        catch { return Array.Empty<MeetingDecisionDto>(); }
    }

    public async Task<int> CountDecisions(string? decisionType = null)
    {
        try
        {
            var q = _db.MeetingDecisions.AsQueryable().Where(d => !string.IsNullOrEmpty(d.Decision));
            if (!string.IsNullOrWhiteSpace(decisionType))
                q = q.Where(d => d.Decision == decisionType);
            return await q.CountAsync();
        }
        catch { return 0; }
    }

    // ── Attendance ─────────────────────────────────────────────────────────────

    public async Task<Dictionary<int, bool>> GetAttendance(int meetingId)
    {
        try
        {
            return await _db.MeetingAttendances.AsNoTracking()
                             .Where(a => a.MeetingId == meetingId)
                             .ToDictionaryAsync(a => a.EmployeeId, a => a.IsPresent);
        }
        catch { return new Dictionary<int, bool>(); }
    }

    public async Task SetAttendance(int meetingId, int employeeId, bool present)
    {
        try
        {
            var existing = await _db.MeetingAttendances
                .FirstOrDefaultAsync(a => a.MeetingId == meetingId && a.EmployeeId == employeeId);
            if (existing is null)
                _db.MeetingAttendances.Add(new MeetingAttendanceRecord { MeetingId = meetingId, EmployeeId = employeeId, IsPresent = present });
            else
                existing.IsPresent = present;
            await _db.SaveChangesAsync();
        }
        catch (Exception ex) { Console.WriteLine($"[DB] SetAttendance failed: {ex.Message}"); }
    }

    // ── Employees ──────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<EmployeeDto>> GetEmployees()
    {
        try { return await _db.Employees.AsNoTracking().OrderBy(e => e.Id).ToListAsync(); }
        catch { return Array.Empty<EmployeeDto>(); }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static string NormalizeMeetingStatus(string? value)
    {
        var status = (value ?? string.Empty).Trim();
        return status switch
        {
            "Scheduled"            => "Scheduled",
            "Completed"            => "Completed",
            "Cancelled"            => "Cancelled",
            "Pending Confirmation" => "Pending Confirmation",
            _                      => "Scheduled"
        };
    }
}
