namespace MOHRecognition.DTOs
{
    public class PostgraduateProgramsDto
    {
        public Microsoft.AspNetCore.Http.IFormFile MasterFile { get; set; }

        public Microsoft.AspNetCore.Http.IFormFile PhDFile { get; set; }

        public Microsoft.AspNetCore.Http.IFormFile DiplomaFile { get; set; }
    }
}