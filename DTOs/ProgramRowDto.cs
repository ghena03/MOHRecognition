
using System;
using System.Collections.Generic;
using System.Text;
namespace DTOs;

public class ProgramRowDto
{
    public string Id { get; set; } = "";
    public string Program { get; set; } = "";
    public string FacultyId { get; set; } = "";
    public string FacultyName { get; set; } = "";
    public string DegreeAwarded { get; set; } = "";
    public int NumberOfYears { get; set; }
    public string EducationalSystem { get; set; } = "";
    public DateTime? AccreditationDate { get; set; }
    public DateTime? GraduationDateOfLastRegiment { get; set; }
}