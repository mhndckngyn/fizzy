using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCardCloserToCardDone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClosedByMemberId",
                table: "CardDones",
                type: "uuid",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardDones_ClosedByMemberId",
                table: "CardDones",
                column: "ClosedByMemberId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_CardDones_Members_ClosedByMemberId",
                table: "CardDones",
                column: "ClosedByMemberId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CardDones_Members_ClosedByMemberId",
                table: "CardDones"
            );

            migrationBuilder.DropIndex(name: "IX_CardDones_ClosedByMemberId", table: "CardDones");

            migrationBuilder.DropColumn(name: "ClosedByMemberId", table: "CardDones");
        }
    }
}
