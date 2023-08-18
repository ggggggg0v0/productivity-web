import { getToday } from "../utils/time";

class local {
  setRecordList(record) {
    const today = getToday();
    const recordKey = `${today}_record`;
    localStorage.setItem(recordKey, JSON.stringify(record));
  }

  getRecordList() {
    const today = getToday();
    const recordKey = `${today}_record`;

    return JSON.parse(localStorage.getItem(recordKey)) || [];
  }

  getRecord(date) {
    const recordKey = `${date}_record`;

    return JSON.parse(localStorage.getItem(recordKey)) || [];
  }

  handleSave(values, updateState) {
    const record = this.getRecordList();
    record[values.recordIndex].content = values.content;
    this.setRecordList(record);
    updateState(record);
  }
}

export default new local();
