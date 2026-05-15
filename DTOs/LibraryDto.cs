using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class LibraryDto
{
    public int? Area { get; set; }
    public int? TotalStudentCapacity { get; set; }
    public int? NumberOfBooks { get; set; }
    // Kept for session backward-compatibility; no longer shown in UI
    public int? NumberOfArabicBooks { get; set; }
    public int? NumberOfEnglishBooks { get; set; }
    public int? NumberOfPaperJournals { get; set; }
    public int? NumberOfElectronicBooks { get; set; }
    public int? NumberOfElectronicJournals { get; set; }
}
