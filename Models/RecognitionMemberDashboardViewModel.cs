using MOHRecognition.Services;

namespace MOHRecognition.Models
{
    public class RecognitionMemberDashboardViewModel
    {
        public string CurrentRecognitionMember { get; set; } = "Recognition Member";
        public int? SessionNo { get; set; }
        public int? Year { get; set; }
        public string Search { get; set; } = string.Empty;
        public string Status { get; set; } = "All";
        public string Country { get; set; } = "All";
        public string Sort { get; set; } = "NewestActivity";

        public List<int> AvailableSessions { get; set; } = new();
        public List<int> AvailableYears { get; set; } = new();
        public List<string> AvailableCountries { get; set; } = new();

        public int AssignedReviewsCount { get; set; }
        public int NotReviewedCount { get; set; }
        public int InProgressCount { get; set; }
        public int SubmittedRecommendationsCount { get; set; }

        public List<RecognitionMemberDashboardApplicationItem> Applications { get; set; } = new();
        public List<RecognitionMemberDashboardActivityItem> RecentActivities { get; set; } = new();
        public List<RecognitionMemberDashboardMeetingItem> Meetings { get; set; } = new();
    }

    public class RecognitionMemberDashboardApplicationItem
    {
        public int Id { get; set; }
        public int? SessionNo { get; set; }
        public int Year { get; set; }
        public string ReferenceNo { get; set; } = string.Empty;
        public string UniversityName { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string ReviewStatus { get; set; } = "Not Reviewed";
        public DateTime LastActivityDate { get; set; }
        public string ActionLabel { get; set; } = "Review";
    }

    public class RecognitionMemberDashboardActivityItem
    {
        public string Description { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; }
    }

    public class RecognitionMemberDashboardMeetingItem
    {
        public int Id { get; set; }
        public int SessionNo { get; set; }
        public DateTime MeetingDate { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
