using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MOHRecognition.Migrations
{
    /// <inheritdoc />
    public partial class AddPostgraduateData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PostgraduateDataJson",
                table: "RecognitionRequests",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PostgraduateDataJson",
                table: "RecognitionRequests");
        }
    }
}
