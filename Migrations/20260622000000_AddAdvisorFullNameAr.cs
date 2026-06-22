using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MOHRecognition.Migrations
{
    public partial class AddAdvisorFullNameAr : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FullNameAr",
                table: "Advisors",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            // Backfill known Arabic names by ID
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'الأستاذ الدكتور عزمي محافظة'        WHERE \"Id\" = 7;");
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'السيد شادي المساعده'               WHERE \"Id\" = 8;");
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'الدكتورة اسيل المحيسن'             WHERE \"Id\" = 5;");
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'الدكتور باسل خضر'                  WHERE \"Id\" = 6;");
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'الأستاذ الدكتور خالد احمد درابكه' WHERE \"Id\" = 1;");
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'الأستاذ الدكتور قاسم احمد الردايده' WHERE \"Id\" = 3;");
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'الأستاذ الدكتور سهيل هيثم حدادين' WHERE \"Id\" = 2;");
            migrationBuilder.Sql("UPDATE \"Advisors\" SET \"FullNameAr\" = 'الأستاذة الدكتورة سوزان نويصر حتر' WHERE \"Id\" = 4;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "FullNameAr", table: "Advisors");
        }
    }
}
