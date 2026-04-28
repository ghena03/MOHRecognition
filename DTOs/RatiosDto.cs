using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class RatiosDto
{
    public string StudentToFullTimeTeachers { get; set; } = "";
    public string StudentToFullAndPartTimeTeachers { get; set; } = "";
    public string AssociateProfessorToFullTimeTeachers { get; set; } = "";
    public string AssistantProfessorToFullTimeTeachers { get; set; } = "";
    public string ProfessorToFullTimeTeachers { get; set; } = "";
    public string PhDToFullTimeTeachers { get; set; } = "";
    public string ProfessorToPartTimeTeachers { get; set; } = "";
    public string PhDToPartTimeTeachers { get; set; } = "";
    public string FullTimeProfessorToStudent { get; set; } = "";
    public string PartTimeProfessorToStudent { get; set; } = "";
    public string FullTimeAssociateProfessorToStudent { get; set; } = "";
    public string PartTimeAssociateProfessorToStudent { get; set; } = "";
    public string FullTimeAssistantProfessorToStudent { get; set; } = "";
    public string PartTimeAssistantProfessorToStudent { get; set; } = "";
}
