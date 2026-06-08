using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MOHRecognition.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvisorPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "Advisors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Password",
                table: "Advisors");
        }
    }
}
