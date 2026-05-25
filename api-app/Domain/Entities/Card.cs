using Domain.Common;
using FluentResults;

namespace Domain.Entities;

public class Card : BaseEntity
{
    public int No { get; set; }
    public string? Title { get; set; }
    public Guid TeamId { get; set; }
    public Team Team { get; set; } = null!;
    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public Guid CreatorMemberId { get; set; }
    public Member Creator { get; set; } = null!;
    public Guid? ColumnId { get; set; }
    public Column? Column { get; set; }

    /// <summary>
    /// Tracks the last time a meaningful user action occurred on this card,
    /// governing the entropy (auto-postpone) lifecycle.
    /// Updated on: creation, comments, assignments, status/stage moves, title changes.
    /// NOT updated on: description edits, mentions.
    /// Initialized to UTC now so card creation itself counts as the first activity.
    /// </summary>
    public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;

    // Trạng thái
    public CardNotNow? NotNow { get; set; }
    public CardMaybe? Maybe { get; set; }
    public CardDone? Done { get; set; }
    public CardGolden? Golden { get; set; }

    // Nội dung
    public CardContent? Content { get; set; }
    public ICollection<Comment> Comments { get; set; } = [];

    public ICollection<Event> Events { get; set; } = [];

    public ICollection<CardAssignment> Assignments { get; set; } = [];

    public ICollection<CardWatch> CardWatches { get; set; } = [];
    public ICollection<CardTag> CardTags { get; set; } = [];

    /// <summary>
    /// Chuyển Card về một Column cụ thể
    /// </summary>
    public Result MoveToColumn(Guid columnId)
    {
        if (columnId == Guid.Empty)
        {
            return Result.Fail("ColumnId cannot be empty.");
        }

        ClearAllStates();
        ColumnId = columnId;
        return Result.Ok();
    }

    /// <summary>
    /// Chuyển Card về trạng thái Not Now
    /// </summary>
    public Result<CardNotNow> MoveToNotNow()
    {
        ClearAllStates();
        NotNow = new CardNotNow { CardId = this.Id, BoardId = this.BoardId };
        return Result.Ok(NotNow);
    }

    /// <summary>
    /// Chuyển Card về trạng thái Maybe
    /// </summary>
    public Result<CardMaybe> MoveToMaybe()
    {
        ClearAllStates();
        Maybe = new CardMaybe { CardId = this.Id, BoardId = this.BoardId };
        return Result.Ok(Maybe);
    }

    /// <summary>
    /// Chuyển Card về trạng thái Done
    /// </summary>
    public Result<CardDone> MoveToDone()
    {
        ClearAllStates();
        Done = new CardDone { CardId = this.Id, BoardId = this.BoardId };
        return Result.Ok(Done);
    }

    /// <summary>
    /// Refreshes LastActiveAt to now, resetting the card's entropy clock.
    /// Call this on any action that counts as user activity:
    /// comments, assignment toggles, status/stage moves, title changes.
    /// Do NOT call for description edits or mentions.
    /// </summary>
    public void Touch()
    {
        LastActiveAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Clear tất cả trạng thái của card (Column, NotNow, Maybe, Done) trước khi chuyển sang trạng thái mới
    /// </summary>
    private void ClearAllStates()
    {
        ColumnId = null;
        NotNow = null;
        Maybe = null;
        Done = null;
    }
}
