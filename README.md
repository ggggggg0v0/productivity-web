# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Note

- 沒有刪除功能，因為要如實記錄這段時間在幹嘛，沒在幹嘛就沒在幹嘛。
    - 如果一段時間做了兩件事情呢？ -> 那就寫兩件事情
    - 如果我兩個區段才做一件事情呢？ -> 哪就兩個區塊都寫，不要花時間在調整上面
    - 但是我就是想統計每個任務的時間 -> 這不是這個工具關注的範疇，初衷就是紀錄時間然後來回顧，什麼東西做了多久不重要。
- 為什麼不做暫停或停止結束任務？
    - 因為本質就是讓你在這段時間完成手上的任務，如果你馬上完成了就直接做下一個
    - 如果你因為這個工作區間沒做事情而焦慮想刪除，那你應該正視自己沒在做事，趕快做一些事情。


活動區1.0.0：
- 兩個活動顏色須輪替：如 1 紅 2 綠
- 當前時間為下一個活動顏色的閃爍框
- 如果有正在進行的任務，從開始時間到當前時間的區塊都會顯示活動任務顏色。

活動區1.0.1：(因為休息是很重要的，有了休息時間，所以從圖表上可以清楚區分任務)
- 當前時間區塊，為淺色閃爍框
- 正在進行的任務時間區間顯示為淺色，進行任務的當時間區塊一樣顯示淺色閃爍框。