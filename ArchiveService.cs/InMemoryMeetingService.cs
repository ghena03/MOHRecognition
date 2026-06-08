using MOHRecognition.DTOs;

namespace MOHRecognition.Services
{
    public class InMemoryMeetingService : IMeetingService
    {
        private static readonly List<MeetingDto> _meetings = new();
        private static readonly List<MeetingDecisionDto> _decisions = new();
        private static readonly List<EmployeeDto> _employees = new();
        private static readonly Dictionary<(int meetingId, int employeeId), bool> _attendance = new();
        private static int _nextMeetingId = 1;
        private static readonly object _lock = new();

        public Task<IReadOnlyList<MeetingDto>> GetAll()
        {
            lock (_lock)
                return Task.FromResult<IReadOnlyList<MeetingDto>>(_meetings.ToList());
        }

        public Task<MeetingDto?> GetById(int id)
        {
            lock (_lock)
                return Task.FromResult(_meetings.FirstOrDefault(m => m.Id == id));
        }

        public Task<MeetingDto> Add(MeetingDto meeting)
        {
            lock (_lock)
            {
                meeting.Id = _nextMeetingId++;
                _meetings.Add(meeting);
                return Task.FromResult(meeting);
            }
        }

        public Task<bool> Update(int id, MeetingDto patch)
        {
            lock (_lock)
            {
                var existing = _meetings.FirstOrDefault(m => m.Id == id);
                if (existing == null) return Task.FromResult(false);
                existing.MeetingDate  = patch.MeetingDate;
                existing.SessionNumber = patch.SessionNumber;
                existing.Status       = patch.Status;
                existing.Notes        = patch.Notes;
                existing.RequestIds   = patch.RequestIds;
                return Task.FromResult(true);
            }
        }

        public Task<bool> Delete(int id)
        {
            lock (_lock)
            {
                var existing = _meetings.FirstOrDefault(m => m.Id == id);
                if (existing == null) return Task.FromResult(false);
                _meetings.Remove(existing);
                return Task.FromResult(true);
            }
        }

        public Task<bool> Close(int id)
        {
            lock (_lock)
            {
                var existing = _meetings.FirstOrDefault(m => m.Id == id);
                if (existing == null) return Task.FromResult(false);
                existing.Status = "Closed";
                return Task.FromResult(true);
            }
        }

        public Task<int> GetNextSessionNumber()
        {
            lock (_lock)
                return Task.FromResult(_meetings.Any() ? _meetings.Max(m => m.SessionNumber) + 1 : 1);
        }

        public Task<int> CountByStatus(string status)
        {
            lock (_lock)
                return Task.FromResult(_meetings.Count(m =>
                    string.Equals(m.Status, status, StringComparison.OrdinalIgnoreCase)));
        }

        public Task<HashSet<int>> GetClosedMeetingRequestIds()
        {
            lock (_lock)
            {
                var closedIds = _meetings
                    .Where(m => string.Equals(m.Status, "Closed", StringComparison.OrdinalIgnoreCase))
                    .SelectMany(m => m.RequestIds)
                    .ToHashSet();
                return Task.FromResult(closedIds);
            }
        }

        public Task<MeetingDecisionDto?> GetDecision(int meetingId, int requestId)
        {
            lock (_lock)
                return Task.FromResult(_decisions.FirstOrDefault(d =>
                    d.MeetingId == meetingId && d.RequestId == requestId));
        }

        public Task SaveDecision(MeetingDecisionDto decision)
        {
            lock (_lock)
            {
                var existing = _decisions.FirstOrDefault(d =>
                    d.MeetingId == decision.MeetingId && d.RequestId == decision.RequestId);
                if (existing != null)
                    _decisions.Remove(existing);
                _decisions.Add(decision);
                return Task.CompletedTask;
            }
        }

        public Task<IReadOnlyList<MeetingDecisionDto>> GetAllDecisions()
        {
            lock (_lock)
                return Task.FromResult<IReadOnlyList<MeetingDecisionDto>>(_decisions.ToList());
        }

        public Task<int> CountDecisions(string? decisionType = null)
        {
            lock (_lock)
            {
                if (string.IsNullOrWhiteSpace(decisionType))
                    return Task.FromResult(_decisions.Count);
                return Task.FromResult(_decisions.Count(d =>
                    string.Equals(d.Decision, decisionType, StringComparison.OrdinalIgnoreCase)));
            }
        }

        public Task<Dictionary<int, bool>> GetAttendance(int meetingId)
        {
            lock (_lock)
            {
                var result = _attendance
                    .Where(kv => kv.Key.meetingId == meetingId)
                    .ToDictionary(kv => kv.Key.employeeId, kv => kv.Value);
                return Task.FromResult(result);
            }
        }

        public Task SetAttendance(int meetingId, int employeeId, bool present)
        {
            lock (_lock)
            {
                _attendance[(meetingId, employeeId)] = present;
                return Task.CompletedTask;
            }
        }

        public Task<IReadOnlyList<EmployeeDto>> GetEmployees()
        {
            lock (_lock)
                return Task.FromResult<IReadOnlyList<EmployeeDto>>(_employees.ToList());
        }
    }
}
