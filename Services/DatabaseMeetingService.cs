using Microsoft.EntityFrameworkCore;
using MOHRecognition.Data;
using MOHRecognition.DTOs;

namespace MOHRecognition.Services;

public sealed class DatabaseMeetingService : IMeetingService
{
    private readonly AppDbContext _db;

    public DatabaseMeetingService(AppDbContext db) => _db = db;

    // ── Meetings ───────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<MeetingDto>> GetAll() =>
        await _db.Meetings.AsNoTracking().OrderBy(m => m.SessionNumber).ToListAsync();

    public async Task<MeetingDto?> GetById(int id) =>
        await _db.Meetings.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);

    public async Task<MeetingDto> Add(MeetingDto meeting)
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

    public async Task<bool> Update(int id, MeetingDto patch)
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

    public async Task<bool> Delete(int id)
    {
        var meeting = await _db.Meetings.FindAsync(id);
        if (meeting is null) return false;

        var decisions = await _db.MeetingDecisions.Where(d => d.MeetingId == id).ToListAsync();
        _db.MeetingDecisions.RemoveRange(decisions);
        _db.Meetings.Remove(meeting);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Close(int id)
    {
        var meeting = await _db.Meetings.FindAsync(id);
        if (meeting is null) return false;

        meeting.Status = "Closed";
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetNextSessionNumber() =>
        (await _db.Meetings.MaxAsync(m => (int?)m.SessionNumber) ?? 0) + 1;

    public async Task<int> CountByStatus(string status) =>
        await _db.Meetings.CountAsync(m => m.Status == status);

    public async Task<HashSet<int>> GetClosedMeetingRequestIds()
    {
        var closedMeetings = await _db.Meetings.AsNoTracking()
                                      .Where(m => m.Status == "Closed")
                                      .ToListAsync();
        return closedMeetings.SelectMany(m => m.RequestIds).ToHashSet();
    }

    // ── Decisions ──────────────────────────────────────────────────────────────

    public async Task<MeetingDecisionDto?> GetDecision(int meetingId, int requestId) =>
        await _db.MeetingDecisions.AsNoTracking()
                 .FirstOrDefaultAsync(d => d.MeetingId == meetingId && d.RequestId == requestId);

    public async Task SaveDecision(MeetingDecisionDto decision)
    {
        var existing = await _db.MeetingDecisions.FindAsync(decision.MeetingId, decision.RequestId);
        if (existing is null)
        {
            _db.MeetingDecisions.Add(decision);
        }
        else
        {
            existing.Decision = decision.Decision;
            existing.Notes    = decision.Notes;
            existing.SavedAt  = decision.SavedAt;
        }
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<MeetingDecisionDto>> GetAllDecisions() =>
        await _db.MeetingDecisions.AsNoTracking().ToListAsync();

    public async Task<int> CountDecisions(string? decisionType = null)
    {
        var q = _db.MeetingDecisions.AsQueryable()
                   .Where(d => !string.IsNullOrEmpty(d.Decision));
        if (!string.IsNullOrWhiteSpace(decisionType))
            q = q.Where(d => d.Decision == decisionType);
        return await q.CountAsync();
    }

    // ── Attendance ─────────────────────────────────────────────────────────────

    public async Task<Dictionary<int, bool>> GetAttendance(int meetingId) =>
        await _db.MeetingAttendances.AsNoTracking()
                 .Where(a => a.MeetingId == meetingId)
                 .ToDictionaryAsync(a => a.EmployeeId, a => a.IsPresent);

    public async Task SetAttendance(int meetingId, int employeeId, bool present)
    {
        var existing = await _db.MeetingAttendances
            .FirstOrDefaultAsync(a => a.MeetingId == meetingId && a.EmployeeId == employeeId);

        if (existing is null)
        {
            _db.MeetingAttendances.Add(new MeetingAttendanceRecord
            {
                MeetingId  = meetingId,
                EmployeeId = employeeId,
                IsPresent  = present,
            });
        }
        else
        {
            existing.IsPresent = present;
        }
        await _db.SaveChangesAsync();
    }

    // ── Employees ──────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<EmployeeDto>> GetEmployees() =>
        await _db.Employees.AsNoTracking().OrderBy(e => e.Id).ToListAsync();

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
