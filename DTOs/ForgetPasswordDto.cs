using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace DTOs;

public  class ForgetPasswordDto
{
    [Required]
    [RegularExpression("^(email|phone)$", ErrorMessage = "Choose email or phone.")]
    public string Method { get; set; } = "email";

    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string? Email { get; set; }

    // Optional: Jordan format (079xxxxxxx) - you can loosen later
    [RegularExpression("^07[0-9]{8}$", ErrorMessage = "Phone must be like 079xxxxxxx.")]
    public string? Phone { get; set; }

    [Required(ErrorMessage = "Verification code is required.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be 6 digits.")]
    [RegularExpression("^[0-9]{6}$", ErrorMessage = "Code must be 6 digits.")]
    public string Code { get; set; } = "";

}
