using MOHRecognition.DTOs;

namespace MOHRecognition.Services
{
    public interface IMeetingService
    {
        // ── Meetings ──────────────────────────────────────────────────────
        Task<IReadOnlyList<MeetingDto>> GetAll();
        Task<MeetingDto?> GetById(int id);
        Task<MeetingDto> Add(MeetingDto meeting);
        Task<bool> Update(int id, MeetingDto patch);
        Task<bool> Delete(int id);
        Task<bool> Close(int id);
        Task<int> GetNextSessionNumber();
        Task<int> CountByStatus(string status);
        Task<HashSet<int>> GetClosedMeetingRequestIds();

        // ── Decisions ─────────────────────────────────────────────────────
        Task<MeetingDecisionDto?> GetDecision(int meetingId, int requestId);
        Task SaveDecision(MeetingDecisionDto decision);
        Task<IReadOnlyList<MeetingDecisionDto>> GetAllDecisions();
        Task<int> CountDecisions(string? decisionType = null);

        // ── Attendance ────────────────────────────────────────────────────
        Task<Dictionary<int, bool>> GetAttendance(int meetingId);
        Task SetAttendance(int meetingId, int employeeId, bool present);

        // ── Employees ─────────────────────────────────────────────────────
        Task<IReadOnlyList<EmployeeDto>> GetEmployees();
    }
}
