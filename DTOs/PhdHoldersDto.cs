using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class PhdHoldersDto
{
    public List<ProgramRowDto> Programs { get; set; } = new();
    public List<PhdHolderRowDto> Rows { get; set; } = new();
}

public class PhdHolderRowDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string ProgramId { get; set; } = "";
    public string ProgramName { get; set; } = "";
    public string MajorAreaOfStudy { get; set; } = "";
    public string Status { get; set; } = "";
}
