export type Board = {
  boardId: string;
  name: string;
  isWatching: boolean;
  autoClosePeriodDays: number | null;
  teamAutoClosePeriodDays: number;
};
