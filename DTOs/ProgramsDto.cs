using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class ProgramsDto
{

    public List<ProgramRowDto> Rows { get; set; } = new();

    // We will fill this from Faculties section (dropdown source)
    public List<FacultyRowDto> Faculties { get; set; } = new();


}
