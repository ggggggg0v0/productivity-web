import { getToday } from "../utils/time";

interface Record {
  start: number;
  end: number;
  content: string;
}

interface RecordList extends Array<Record> {}

class local {
  setRecordList(record) {
    const today = getToday();
    const recordKey = `${today}_record`;
    localStorage.setItem(recordKey, JSON.stringify(record));
  }

  getRecordList(date): RecordList {
    const today = date || getToday();
    const recordKey = `${today}_record`;

    const storedValue = localStorage.getItem(recordKey);
    return storedValue ? JSON.parse(storedValue) : [];
  }
}

export default new local();
