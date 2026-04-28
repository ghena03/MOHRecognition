using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class SubmitApplicationDto
{
    public string ApplicantName { get; set; } = "";
    public string WorkPlace { get; set; } = "";
    public string Email { get; set; } = "";
    public bool IsAcknowledged { get; set; }
}
