import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type Row = Record<string, any>;

type Result = {
  columns: string[];
  rows: Row[];
};

type Props = {
  result: Result;
  height?: number;
  rowHeight?: number;
};

export default function DataTableVirtual({
  result,
  height = 400,
  rowHeight = 40,
}: Props) {
  const { columns, rows } = result;
  const parentRef = useRef<HTMLDivElement | null>(null);

  // virtualizer configuration
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const gridTemplateColumns = `repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10">
        <div
          className="grid border-collapse border-b border-gray-700 bg-gray-800 text-sm"
          style={{ gridTemplateColumns }}
        >
          {columns.map((col) => (
            <div key={col} className="px-2 py-1 font-medium text-left border border-gray-700">
              {col}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {virtualItems.map((virtualRow) => {
            const r = rows[virtualRow.index];
            return (
              <div
                key={r.id ?? virtualRow.index}
                className="absolute left-0 right-0 grid items-center"
                style={{
                  top: `${virtualRow.start}px`,
                  height: `${virtualRow.size}px`,
                  gridTemplateColumns,
                }}
              >
                {columns.map((col) => (
                  <div
                    key={col}
                    className="border border-gray-800 px-2 py-1 font-mono text-sm overflow-hidden truncate"
                    title={String(r[col] ?? "")}
                  >
                    {String(r[col] ?? "")}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
