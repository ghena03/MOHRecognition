using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class FacultyRowDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string FacultyName { get; set; } = "";
    public int? StudentsCount { get; set; }
    public string CollegeType { get; set; } = "";

}
