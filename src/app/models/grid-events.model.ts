export type CancelableEventResult = boolean | PromiseLike<boolean> | PromiseLike<void>;

export interface SelectionChangedEvent<TKey = number> {
  selectedRowKeys?: TKey[];
}

export interface RowRemovingEvent<TKey = unknown> {
  key: TKey;
  cancel?: CancelableEventResult;
}

export interface InlineEditEvent<TComponent = { editRow: (rowIndex: number) => void }> {
  rowIndex: number;
  component: TComponent;
}

export interface DeleteRecordEvent<TData = Record<string, unknown>, TKey = unknown> {
  key?: TKey;
  data?: TData;
  row: { rowIndex: number };
}