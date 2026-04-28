using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class AdmissionRequirementRowDto
{
    public int Id { get; set; }                 // used for delete
    public string Requirement { get; set; } = ""; // the text line

}
