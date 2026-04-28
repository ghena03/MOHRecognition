using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class StudentsNumbersDto
{
    public List<StudentNumbersRowDto> Rows { get; set; } = new();
    public List<ProgramRowDto> Programs { get; set; } = new(); // from Programs section
}

public class StudentNumbersRowDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    public string ProgramId { get; set; } = "";
    public string ProgramName { get; set; } = "";

    public int Year1 { get; set; }
    public int Year2 { get; set; }
    public int Year3 { get; set; }
    public int Year4 { get; set; }
    public int Year5 { get; set; }
    public int Year6 { get; set; }

    public int Total => Year1 + Year2 + Year3 + Year4 + Year5 + Year6;
}