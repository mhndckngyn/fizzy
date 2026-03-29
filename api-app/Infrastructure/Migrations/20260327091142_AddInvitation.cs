using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InvitationId",
                table: "Teams",
                type: "character varying(14)",
                maxLength: 14,
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Teams_InvitationId",
                table: "Teams",
                column: "InvitationId",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Teams_InvitationId", table: "Teams");

            migrationBuilder.DropColumn(name: "InvitationId", table: "Teams");
        }
    }
}
