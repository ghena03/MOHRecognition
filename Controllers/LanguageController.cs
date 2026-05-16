using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;

namespace MOHRecognition.Controllers;

/// <summary>
/// Handles language switching for the entire application.
/// When the user clicks "English" or "العربية", this controller:
///   1. Validates the requested culture is supported
///   2. Writes it to the .AspNetCore.Culture cookie
///   3. Redirects back to where the user was
///
/// The cookie is then read on every request by the
/// CookieRequestCultureProvider (registered in Program.cs),
/// so the selected language persists across all pages and sessions.
/// </summary>
public class LanguageController : Controller
{
    // The only cultures our application supports.
    // Must match exactly what is registered in Program.cs.
    private static readonly HashSet<string> _supportedCultures =
        new(StringComparer.OrdinalIgnoreCase) { "en", "ar" };

    /// <summary>
    /// POST /Language/Set
    /// Called by the language switcher buttons in the navbar.
    /// </summary>
    /// <param name="culture">The culture code — "en" or "ar"</param>
    /// <param name="returnUrl">The page the user was on — we redirect back to it</param>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Set(string culture, string returnUrl)
    {
        // ── 1. Sanitize & validate ────────────────────────────────────────
        culture = (culture ?? "en").Trim();
        returnUrl = (returnUrl ?? "/").Trim();

        // Only allow supported cultures — reject anything else.
        if (!_supportedCultures.Contains(culture))
            culture = "en";

        // Prevent open-redirect attacks: only allow local URLs.
        if (!Url.IsLocalUrl(returnUrl))
            returnUrl = "/";

        // ── 2. Write the culture cookie ───────────────────────────────────
        // CookieName = ".AspNetCore.Culture"
        // Format     = "c=en|uic=en"  (culture | UI culture)
        Response.Cookies.Append(
            CookieRequestCultureProvider.DefaultCookieName,
            CookieRequestCultureProvider.MakeCookieValue(
                new RequestCulture(culture)
            ),
            new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddYears(1), // persist for 1 year
                HttpOnly = false,                              // JS does not need it, but keep accessible
                IsEssential = true,                           // GDPR: works even without consent banner
                SameSite = SameSiteMode.Lax,
                Secure = Request.IsHttps
            }
        );

        // ── 3. Redirect back to the same page ────────────────────────────
        return LocalRedirect(returnUrl);
    }

    /// <summary>
    /// GET /Language/Set?culture=ar&returnUrl=/
    /// Fallback for environments where JS/forms are restricted.
    /// Same logic as POST but via query string.
    /// </summary>
    [HttpGet]
    public IActionResult Set(string culture, string returnUrl, string method = "get")
    {
        culture = (culture ?? "en").Trim();
        returnUrl = (returnUrl ?? "/").Trim();

        if (!_supportedCultures.Contains(culture))
            culture = "en";

        if (!Url.IsLocalUrl(returnUrl))
            returnUrl = "/";

        Response.Cookies.Append(
            CookieRequestCultureProvider.DefaultCookieName,
            CookieRequestCultureProvider.MakeCookieValue(
                new RequestCulture(culture)
            ),
            new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddYears(1),
                HttpOnly = false,
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Secure = Request.IsHttps
            }
        );

        return LocalRedirect(returnUrl);
    }
}