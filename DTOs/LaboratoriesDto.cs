using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class LaboratoriesDto
{
    public List<FacultyRowDto> Faculties { get; set; } = new();
    public List<string> AvailableCollegeCategories { get; set; } = new();
    public List<LaboratoryRowDto> Rows { get; set; } = new();
    public int? TotalLaboratoriesCount { get; set; }
    public int? TotalFacilitiesCount { get; set; }
    public int? TeachingHallsCount { get; set; }
    public int? StadiumsCount { get; set; }
    public List<LaboratoryFileDto> UploadedFiles { get; set; } = new();
}

public class LaboratoryFileDto
{
    public string Id { get; set; } = "";
    public string Subject { get; set; } = "";
    public string OriginalFileName { get; set; } = "";
    public string StoredFileName { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string ContentType { get; set; } = "";
    public DateTime UploadedAt { get; set; }
}

public class LaboratoryRowDto
{
    public string Id { get; set; } = "";
    public string FacultyId { get; set; } = "";
    public string FacultyName { get; set; } = "";
    public int? Computers { get; set; }
    public int? Workshops { get; set; }
    public int? Laboratories { get; set; }
}
