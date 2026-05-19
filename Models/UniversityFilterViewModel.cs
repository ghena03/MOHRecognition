using Microsoft.AspNetCore.Mvc.Rendering;

namespace MOHRecognition.Models
{
    public class UniversityFilterViewModel
    {
        public string? SearchTerm { get; set; }

        public int? SelectedUniversityId { get; set; }

        public string? SelectedCountry { get; set; }

        public string? SelectedStatus { get; set; }

        public List<SelectListItem>? Universities { get; set; }

        public List<SelectListItem>? Countries { get; set; }

        public List<SelectListItem>? Statuses { get; set; }
    }
}