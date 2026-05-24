namespace MOHRecognition.Data;

/// <summary>
/// DB-only entity — tracks meeting attendance per employee.
/// No equivalent DTO exists; the service converts to/from Dictionary&lt;int,bool&gt;.
/// </summary>
public sealed class MeetingAttendanceRecord
{
    public int Id         { get; set; }
    public int MeetingId  { get; set; }
    public int EmployeeId { get; set; }
    public bool IsPresent { get; set; }
}
