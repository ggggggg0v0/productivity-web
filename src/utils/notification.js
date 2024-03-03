export const notify = (msg) => {
  if (window.Notification && Notification.permission !== "denied") {
    Notification.requestPermission(function (status) {
      let notification = new Notification("Time up", {
        // body: msg,
        // icon: "/image.jpg", // 圖片
      });
    });
  }
};
