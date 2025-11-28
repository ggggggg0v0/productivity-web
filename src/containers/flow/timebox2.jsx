import classNames from "classnames";

import { work } from "./consts";

// custom hook
import { useCurrentMinute } from "@/utils/time";

// utils
import { getCurrentHour } from "@/utils/time";

// styles
import "./timebox.scss"; // 可能需要自行設置 CSS 樣式
import { useMemo } from "react";

function checkHasActive(currentMinute, data) {
  let activeRecord;
  let hasActive = false;
  data.forEach((record, i) => {
    const { start, end } = record;
    if (currentMinute >= start && currentMinute <= end) {
      activeRecord = record;
      hasActive = true;
    }
  });

  return [hasActive, activeRecord];
}

function C({ recordList, handleClickBox, newRecord, action, isManualAddMode, manualSelection, onManualSelect }) {
  const currentTimeMinute = useCurrentMinute();

  const generateTable = () => {
    const numColumns = 24;
    const numRows = 60;
    // 生成包含方形 div 的數組
    const grid = [];
    const timerow = [
      <div key="hourText" className={classNames("square", "hourText")} />,
    ];

    // 第 0 row 已經預先放到 timerow 裡了
    for (let i = 1; i < 61; i++) {
      timerow.push(
        <div
          key={`timeRow_${i}`}
          className="square"
          style={{ fontSize: "11px", color: "#3c4042" }}
        >
          {(i !== 0 && i % 10) === 0 && i}
        </div>
      );
    }

    grid.push(
      <div key="hourTextWrap" style={{ display: "flex" }}>
        {timerow}
      </div>
    );

    for (let column = 0; column < numColumns; column++) {
      const columns = [];

      columns.push(
        <div
          key={`hour_${column}`}
          className={classNames("square", "hourText")}
        >
          {column + 1}
        </div>
      );

      for (let row = 0; row < numRows; row++) {
        const currentMinute = row + column * 60 + 1;

        let [hasActive, activeRecord] = checkHasActive(
          currentMinute,
          recordList
        );

        const isProcessing =
          action === work &&
          newRecord.start > 0 &&
          newRecord.start < currentMinute &&
          currentTimeMinute > currentMinute;

        // 检查是否在手动选择的范围内
        const isManualSelected =
          isManualAddMode &&
          manualSelection.start > 0 &&
          manualSelection.end > 0 &&
          currentMinute >= manualSelection.start &&
          currentMinute <= manualSelection.end;
        
        // 检查是否是手动选择的开始点（即使 end 为 0）
        const isManualStartPoint =
          isManualAddMode &&
          manualSelection.start > 0 &&
          manualSelection.end === 0 &&
          currentMinute === manualSelection.start;

        // 在手动新增模式下，已存在的记录不能被点击
        const isClickable = isManualAddMode
          ? !hasActive && onManualSelect
          : hasActive;

        const handleSquareClick = (e) => {
          // 在手动新增模式下，如果该方格已有记录，不允许点击
          if (isManualAddMode && hasActive) {
            return;
          }
          
          // 在手动新增模式下，处理选择
          if (isManualAddMode && !hasActive && onManualSelect) {
            // 如果还没有选择开始点，设置开始点
            if (manualSelection.start === 0) {
              onManualSelect({ start: currentMinute, end: 0 });
            } else if (manualSelection.end === 0) {
              // 如果已经有开始点但还没有结束点，设置结束点
              const newStart = Math.min(manualSelection.start, currentMinute);
              const newEnd = Math.max(manualSelection.start, currentMinute);
              onManualSelect({ start: newStart, end: newEnd });
            } else {
              // 如果已经有完整的选择，重新开始选择
              onManualSelect({ start: currentMinute, end: 0 });
            }
            return;
          }
          
          // 非手动新增模式下，点击已有记录
          if (!isManualAddMode && hasActive) {
            handleClickBox(activeRecord);
          }
        };

        columns.push(
          <div
            onClick={handleSquareClick}
            key={`row_${currentMinute}`}
            className={classNames(
              { now: currentTimeMinute === currentMinute },
              { squareActive: (hasActive || isProcessing) && !isManualAddMode },
              { squareManualSelected: isManualSelected || isManualStartPoint },
              { squareDefaultStyle: !hasActive && !isManualSelected && !isManualStartPoint },
              "square"
            )}
            style={{
              ...(isManualSelected || isManualStartPoint
                ? { backgroundColor: "#3182ce", cursor: "pointer", zIndex: 10, pointerEvents: "auto" }
                : isManualAddMode && !hasActive
                ? { cursor: "pointer", zIndex: 5, pointerEvents: "auto" }
                : hasActive && !isManualAddMode
                ? { pointerEvents: "auto" }
                : { pointerEvents: "auto" }),
            }}
          />
        );
      }

      grid.push(
        <div
          key={`column_${column}`}
          className={classNames(
            { currentRow: getCurrentHour() === column },
            "row"
          )}
        >
          {columns}
        </div>
      );
    }
    return grid;
  };

  const grid = useMemo(generateTable, [
    action,
    newRecord,
    recordList,
    currentTimeMinute,
    isManualAddMode,
    manualSelection,
  ]);

  return <div className="grid-container">{grid}</div>;
}

export default C;
