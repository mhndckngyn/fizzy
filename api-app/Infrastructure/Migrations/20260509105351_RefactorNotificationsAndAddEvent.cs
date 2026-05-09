using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorNotificationsAndAddEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Notification_Members");

            migrationBuilder.DropColumn(name: "BoardName", table: "Notifications");

            migrationBuilder.DropColumn(name: "Message", table: "Notifications");

            migrationBuilder.DropColumn(name: "NotificationType", table: "Notifications");

            migrationBuilder.DropColumn(name: "SenderName", table: "Notifications");

            migrationBuilder.DropColumn(name: "Title", table: "Notifications");

            migrationBuilder.RenameColumn(
                name: "CardNo",
                table: "Notifications",
                newName: "UnreadCount"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Notifications",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true
            );

            migrationBuilder.AddColumn<Guid>(
                name: "CardId",
                table: "Notifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AddColumn<Guid>(
                name: "EventId",
                table: "Notifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadAt",
                table: "Notifications",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<Guid>(
                name: "RecipientMemberId",
                table: "Notifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AddColumn<Guid>(
                name: "TeamId",
                table: "Notifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.CreateTable(
                name: "BoardAccesses",
                columns: table => new
                {
                    BoardId = table.Column<Guid>(type: "uuid", nullable: false),
                    MemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    BoardInvolvement = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoardAccesses", x => new { x.BoardId, x.MemberId });
                    table.ForeignKey(
                        name: "FK_BoardAccesses_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_BoardAccesses_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_BoardAccesses_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "CardWatches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardId = table.Column<Guid>(type: "uuid", nullable: false),
                    MemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    Watching = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardWatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CardWatches_Cards_CardId",
                        column: x => x.CardId,
                        principalTable: "Cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_CardWatches_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_CardWatches_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppEventType = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatorMemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardId = table.Column<Guid>(type: "uuid", nullable: false),
                    Metadata = table.Column<string>(
                        type: "text",
                        nullable: false,
                        defaultValue: "{}"
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Events_Cards_CardId",
                        column: x => x.CardId,
                        principalTable: "Cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_Events_Members_CreatorMemberId",
                        column: x => x.CreatorMemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_Events_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CardId_RecipientMemberId",
                table: "Notifications",
                columns: new[] { "CardId", "RecipientMemberId" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_EventId",
                table: "Notifications",
                column: "EventId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientMemberId",
                table: "Notifications",
                column: "RecipientMemberId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TeamId",
                table: "Notifications",
                column: "TeamId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_BoardAccesses_MemberId",
                table: "BoardAccesses",
                column: "MemberId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_BoardAccesses_TeamId",
                table: "BoardAccesses",
                column: "TeamId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardWatches_CardId_MemberId",
                table: "CardWatches",
                columns: new[] { "CardId", "MemberId" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardWatches_MemberId",
                table: "CardWatches",
                column: "MemberId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardWatches_TeamId",
                table: "CardWatches",
                column: "TeamId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Events_CardId",
                table: "Events",
                column: "CardId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Events_CreatorMemberId",
                table: "Events",
                column: "CreatorMemberId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Events_TeamId",
                table: "Events",
                column: "TeamId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Cards_CardId",
                table: "Notifications",
                column: "CardId",
                principalTable: "Cards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Events_EventId",
                table: "Notifications",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Members_RecipientMemberId",
                table: "Notifications",
                column: "RecipientMemberId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Teams_TeamId",
                table: "Notifications",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Cards_CardId",
                table: "Notifications"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Events_EventId",
                table: "Notifications"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Members_RecipientMemberId",
                table: "Notifications"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Teams_TeamId",
                table: "Notifications"
            );

            migrationBuilder.DropTable(name: "BoardAccesses");

            migrationBuilder.DropTable(name: "CardWatches");

            migrationBuilder.DropTable(name: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_CardId_RecipientMemberId",
                table: "Notifications"
            );

            migrationBuilder.DropIndex(name: "IX_Notifications_EventId", table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RecipientMemberId",
                table: "Notifications"
            );

            migrationBuilder.DropIndex(name: "IX_Notifications_TeamId", table: "Notifications");

            migrationBuilder.DropColumn(name: "CardId", table: "Notifications");

            migrationBuilder.DropColumn(name: "EventId", table: "Notifications");

            migrationBuilder.DropColumn(name: "ReadAt", table: "Notifications");

            migrationBuilder.DropColumn(name: "RecipientMemberId", table: "Notifications");

            migrationBuilder.DropColumn(name: "TeamId", table: "Notifications");

            migrationBuilder.RenameColumn(
                name: "UnreadCount",
                table: "Notifications",
                newName: "CardNo"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Notifications",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AddColumn<string>(
                name: "BoardName",
                table: "Notifications",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "Notifications",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "NotificationType",
                table: "Notifications",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "SenderName",
                table: "Notifications",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Notifications",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.CreateTable(
                name: "Notification_Members",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    NotificationId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecepientMemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notification_Members", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notification_Members_Notifications_NotificationId",
                        column: x => x.NotificationId,
                        principalTable: "Notifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_Notification_Members_Users_RecepientMemberId",
                        column: x => x.RecepientMemberId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Notification_Members_NotificationId",
                table: "Notification_Members",
                column: "NotificationId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Notification_Members_RecepientMemberId_NotificationId",
                table: "Notification_Members",
                columns: new[] { "RecepientMemberId", "NotificationId" }
            );
        }
    }
}
