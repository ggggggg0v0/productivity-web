import "./timebox.scss"; // 可能需要自行設置 CSS 樣式

function App() {
  const numColumns = 24;
  const numRows = 60;

  // 生成包含方形 div 的數組
  const grid = [];

  for (let column = 0; column < numColumns; column++) {
    const columns = [];

    columns.push(<div className="squareText">{column + 1}</div>);

    for (let row = 0; row < numRows; row++) {
      columns.push(<div key={row} className="square"></div>);
    }

    grid.push(
      <div key={column} className="row">
        {columns}
      </div>
    );
  }

  return <div className="grid-container">{grid}</div>;
}

export default App;
