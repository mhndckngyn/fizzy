using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInvitation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InvitationId",
                table: "Teams",
                newName: "InvitationCode"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Teams_InvitationId",
                table: "Teams",
                newName: "IX_Teams_InvitationCode"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InvitationCode",
                table: "Teams",
                newName: "InvitationId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Teams_InvitationCode",
                table: "Teams",
                newName: "IX_Teams_InvitationId"
            );
        }
    }
}
