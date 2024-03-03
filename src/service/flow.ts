import { getToday } from "../utils/time";

interface Record {
  start: number;
  end: number;
  content: string;
}

interface RecordList extends Array<Record> {}

const defaultWorkTime = [300, 600, 900];
const defaultRelaxTime = [300, 600, 900];

const defaultSetting = {
  workTime: defaultWorkTime,
  relaxTime: defaultRelaxTime,
};

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

  getSetting() {
    const storedValue = localStorage.getItem("setting");
    return storedValue ? JSON.parse(storedValue) : defaultSetting;
  }

  setSetting(newSetting) {
    localStorage.setItem("setting", JSON.stringify(newSetting));
  }

  resetSetting() {
    localStorage.setItem("setting", JSON.stringify(defaultSetting));
    return this.getSetting();
  }
}

export default new local();
