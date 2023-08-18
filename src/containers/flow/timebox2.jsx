import classNames from "classnames";

import { work } from "./consts";

// custom hook
import { useCurrentMinute } from "@/utils/time";

// utils
import { getCurrentMinute } from "@/utils/time";

// styles
import "./timebox.scss"; // 可能需要自行設置 CSS 樣式

function checkHasActive(currentMinute, data) {
  let activeIndex = 1;
  let hasActive = false;
  data.forEach(({ start, end }, i) => {
    if (currentMinute >= start && currentMinute <= end) {
      activeIndex = i;
      hasActive = true;
    }
  });

  return [hasActive, activeIndex];
}

function C({ record, handleClickBox, currentTime, action }) {
  const numColumns = 24;
  const numRows = 60;
  // 生成包含方形 div 的數組
  const grid = [];
  const currentTimeMinute = useCurrentMinute();

  const timerow = [
    <div key="hourText" className={classNames("square", "hourText")} />,
  ];
  // 第 0 row 已經預先放到 timerow 李了
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
    <div key="hourTextWrap" className="row">
      {timerow}
    </div>
  );

  for (let column = 0; column < numColumns; column++) {
    const columns = [];

    columns.push(
      <div key={`hour_${column}`} className={classNames("square", "hourText")}>
        {column + 1}
      </div>
    );

    let isCurrentRow = false;

    for (let row = 0; row < numRows; row++) {
      const currentMinute = row + column * 60 + 1;

      let [hasActive, activeIndex] = checkHasActive(currentMinute, record);
      isCurrentRow = hasActive;

      const isProcessing =
        action === work &&
        currentTime.start > 0 &&
        currentTime.start < currentMinute &&
        currentTimeMinute > currentMinute;

      columns.push(
        <div
          onClick={() => {
            if (hasActive) {
              handleClickBox({ activeIndex: activeIndex });
            }
          }}
          key={`row_${currentMinute}`}
          className={classNames(
            {
              // 顯示下一次的顏色
              [`now${activeIndex % 1 ? 0 : 1}`]:
                currentTimeMinute === currentMinute,
            },
            { [`squareActive${activeIndex % 2}`]: hasActive || isProcessing },
            { squareDefaultStyle: !hasActive },
            "square"
          )}
        />
      );
    }

    grid.push(
      <div
        key={`column_${column}`}
        className={classNames({ currentRow: isCurrentRow }, "row")}
      >
        {columns}
      </div>
    );
  }

  return <div className="grid-container">{grid}</div>;
}

export default C;
