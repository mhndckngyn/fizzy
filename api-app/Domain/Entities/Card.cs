using Domain.Common;
using FluentResults;

namespace Domain.Entities;

public class Card : BaseEntity
{
    public string? Title { get; set; }
    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public Guid CreatorMemberId { get; set; }
    public Member Creator { get; set; } = null!;
    public Guid? ColumnId { get; set; }

    // Trạng thái
    public CardNotNow? NotNow { get; set; }
    public CardMaybe? Maybe { get; set; }
    public CardDone? Done { get; set; }

    // Nội dung
    public CardContent? Content { get; set; }
    public ICollection<Comment> Comments { get; set; } = [];

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
