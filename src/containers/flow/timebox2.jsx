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

function C({
  recordList,
  handleClickBox,
  newRecord,
  action,
  isManualAddMode,
  manualSelection,
  onManualSelect,
}) {
  const currentTimeMinute = useCurrentMinute();

  const generateTable = () => {
    console.log("[generateTable] 开始渲染, manualSelection:", manualSelection);
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
          style={{ backgroundColor: "transparent" }}
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

        // 检查是否在手动选择的范围内（只有当有完整选择时才显示蓝色）
        const isManualSelected =
          isManualAddMode &&
          manualSelection.start > 0 &&
          manualSelection.end > 0 &&
          manualSelection.end > manualSelection.start &&
          currentMinute >= manualSelection.start &&
          currentMinute <= manualSelection.end;

        // 调试信息：检查蓝色区域的显示（只打印关键点）
        if (
          isManualSelected &&
          (currentMinute === manualSelection.start ||
            currentMinute === manualSelection.end)
        ) {
          console.log(
            `[渲染] currentMinute: ${currentMinute} 显示蓝色, manualSelection:`,
            manualSelection
          );
        }

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
          if (isManualAddMode && onManualSelect) {
            console.log(
              "点击前 manualSelection:",
              manualSelection,
              "currentMinute:",
              currentMinute
            );

            // 如果已经有完整的选择（start > 0 且 end > 0），无论点击哪里都清除选择并重新开始
            if (manualSelection.start > 0 && manualSelection.end > 0) {
              console.log("已有完整选择，清除并重新开始");
              onManualSelect({ start: currentMinute, end: 0 });
              return;
            }

            // 如果还没有选择开始点，设置开始点
            if (manualSelection.start === 0) {
              console.log("设置开始点");
              onManualSelect({ start: currentMinute, end: 0 });
              return;
            }

            // 如果已经有开始点但还没有结束点，设置结束点
            if (manualSelection.end === 0 && manualSelection.start > 0) {
              const newStart = Math.min(manualSelection.start, currentMinute);
              const newEnd = Math.max(manualSelection.start, currentMinute);
              console.log("设置结束点，newStart:", newStart, "newEnd:", newEnd);
              onManualSelect({ start: newStart, end: newEnd });
              return;
            }
          }

          // 非手动新增模式下，点击已有记录
          if (!isManualAddMode && hasActive) {
            handleClickBox(activeRecord);
          }
        };

        // 确定背景色（只在需要时设置，否则让 CSS 类控制）
        let backgroundColor = undefined;
        if (isManualSelected || isManualStartPoint) {
          backgroundColor = "#3182ce"; // 蓝色
        } else if (currentTimeMinute === currentMinute) {
          backgroundColor = "#576f69"; // 当前时间
        } else if (hasActive || isProcessing) {
          backgroundColor = "#2a7864"; // 已有记录（在手动新增模式下也保持绿色）
        }

        columns.push(
          <div
            onClick={handleSquareClick}
            key={`row_${currentMinute}`}
            className={classNames(
              { now: currentTimeMinute === currentMinute },
              { squareActive: hasActive || isProcessing },
              { squareManualSelected: isManualSelected || isManualStartPoint },
              {
                squareDefaultStyle:
                  !hasActive && !isManualSelected && !isManualStartPoint,
              },
              "square"
            )}
            style={{
              ...(backgroundColor ? { backgroundColor } : {}),
              ...(isManualSelected || isManualStartPoint
                ? { cursor: "pointer", zIndex: 10, pointerEvents: "auto" }
                : isManualAddMode && !hasActive
                ? { cursor: "pointer", zIndex: 5, pointerEvents: "auto" }
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
          style={{
            backgroundColor: "transparent",
            display: "flex",
          }}
        >
          {columns}
        </div>
      );
    }
    return grid;
  };

  // 使用 JSON.stringify 确保对象变化时能正确触发重新计算
  const manualSelectionKey = `${manualSelection.start}-${manualSelection.end}`;

  const grid = useMemo(() => {
    console.log(
      "[useMemo] 重新计算, manualSelection:",
      manualSelection,
      "key:",
      manualSelectionKey
    );
    return generateTable();
  }, [
    action,
    newRecord,
    recordList,
    currentTimeMinute,
    isManualAddMode,
    manualSelectionKey,
  ]);

  return (
    <div className="grid-container" style={{ backgroundColor: "transparent" }}>
      {grid}
    </div>
  );
}

export default C;
