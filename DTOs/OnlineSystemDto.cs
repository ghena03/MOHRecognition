namespace DTOs
{
    public class OnlineSystemDto
    {
        // COMMUNICATION

        public string? CommunicationType { get; set; }

        public List<string>? CommunicationMethods { get; set; }


        // EXAMS

        public string? ExamType { get; set; }

        public string? ExamLocations { get; set; }

        public List<string>? ProctoringMethods { get; set; }


        // PLATFORM

        public bool HasPlatform { get; set; }

        public string? PlatformName { get; set; }

        public string? PlatformUrl { get; set; }

        public string? PlatformUsername { get; set; }

        public string? PlatformEmail { get; set; }

        public string? PlatformPassword { get; set; }


        // STATUS

        public bool IsSubmitted { get; set; }
    }
}