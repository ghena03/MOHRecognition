using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class FacultiesDto
{





    public List<FacultyRowDto> Rows { get; set; } = new List<FacultyRowDto>();

    public List<string> AvailableCollegeCategories { get; set; } = new List<string>();





}
