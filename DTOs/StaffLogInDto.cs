using System;
using System.Collections.Generic;
using System.Text;

using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class StaffLogInDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";

    public string Language { get; set; } = "en";

    [Required]
    public string Captcha { get; set; } = "";

    public bool RememberMe { get; set; }
}

