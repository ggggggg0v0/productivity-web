import { getToday } from "../utils/time";
import { work, relax } from "../containers/flow/consts";

interface Record {
  start: number;
  end: number;
  content: string;
}

interface RecordList extends Array<Record> {}

export const initWorkTime = 900; // second
export const initRelaxTime = 300; // second

const defaultSelectedSetting = {
  [work]: initWorkTime,
  [relax]: initRelaxTime,
};

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

  getSelectedSetting() {
    const selectedSetting = localStorage.getItem("selectedSetting");
    return selectedSetting
      ? JSON.parse(selectedSetting)
      : defaultSelectedSetting;
  }

  setSelectedTime(action, data) {
    let selectedSetting = this.getSelectedSetting();
    selectedSetting[action] = data;
    localStorage.setItem("selectedSetting", JSON.stringify(selectedSetting));
  }
}

export default new local();
