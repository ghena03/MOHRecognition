using System;
using System.Collections.Generic;

namespace DTOs;

public class ProgramHoursRowDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    public string ProgramId { get; set; } = "";
    public string ProgramName { get; set; } = "";

    public int TheoreticalHours { get; set; }
    public int PracticalHours { get; set; }
}

public class ProgramHoursDto
{
    public List<ProgramHoursRowDto> Rows { get; set; } = new List<ProgramHoursRowDto>();

    // Dropdown source
    public List<ProgramRowDto> Programs { get; set; } = new List<ProgramRowDto>();
}