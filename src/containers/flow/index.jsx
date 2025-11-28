// src/App.tsx
import {
  IconButton,
  Flex,
  Text,
  Box,
  ChakraProvider,
  useDisclosure,
  Center,
  Button,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { useEffect, useReducer, useState } from "react";
import { notify } from "@/utils/notification";
// import { appWindow } from "@tauri-apps/api/window";

import { ChevronRightIcon, RepeatClockIcon, CloseIcon } from "@chakra-ui/icons";
import mp3url from "@/assets/mp3/success.mp3";

// service
import flowService from "@/service/flow";

// component
import TimeBox from "./timebox";
import Setting from "./drawer";
import TimeBox2 from "./timebox2";
import Modal from "./modal";
import CalandarModal from "./modal_calandar";

import { work, relax } from "./consts";

// utils
import { getCurrentMinute } from "@/utils/time";
import { useAudio } from "@/utils/audio";

// styles
import "./moon.scss";
// import "./meteor.scss";

const reducer = (state, action) => {
  switch (action.type) {
    case "START_COUNTDOWN":
      return {
        ...state,
        isIntervalRunning: true,
        newRecord: { ...state.newRecord, start: getCurrentMinute() },
      };

    case "STOP_COUNTDOWN": {
      let newRecordList = [...state.recordList];

      const isWork = state.action === work;
      const nextAction = isWork ? relax : work;
      const newRecord = {
        ...state.newRecord,
        end: getCurrentMinute(),
      };

      if (isWork) {
        newRecordList.push(newRecord);
        isWork && flowService.setRecordList(newRecordList);
      }

      return {
        ...state,
        time: nextAction === work ? state.workTime : state.relaxTime,
        isIntervalRunning: nextAction === relax,
        action: nextAction,
        newRecord: { start: 0, end: 0 },
        recordList: isWork ? newRecordList : state.recordList,
        selected: isWork ? newRecord : state.selected, // 工作時間切換休息時間在 modal 顯示都靠這裡了
      };
    }

    case "COUNTDOWN":
      return { ...state, time: state.time - 1 };

    case "RESET_COUNTDOWN":
      return {
        ...state,
        time: state.action === work ? state.workTime : state.relaxTime,
        isIntervalRunning: false,
        newRecord: { start: 0, end: 0 },
      };

    case "SELECT_CONTENT":
      return {
        ...state,
        selected: action.payload,
      };

    case "CLEAR_SELECT_CONTENT":
      return {
        ...state,
        selected: { start: 0, end: 0 },
      };

    case "SET_COUNTDOWN_TIME": {
      const time =
        action.payload.action === state.action
          ? action.payload.time
          : state.time;

      return {
        ...state,
        time,
        [`${action.payload.action}Time`]: action.payload.time,
      };
    }

    case "HANDLE_SAVE_RECORD": {
      const newRecordList = state.recordList.map((el) => {
        if (el.start === action.payload.start) {
          return action.payload;
        }
        return el;
      });
      flowService.setRecordList(newRecordList);

      return {
        ...state,
        recordList: newRecordList,
      };
    }
    case "SKIP_RELAX":
      return {
        ...state,
        action: work,
        time: state.workTime,
        isIntervalRunning: false,
      };

    case "FORCE_STOP_COUNTDOWN": {
      let newRecordList = [...state.recordList];

      const isWork = state.action === work;
      const nextAction = isWork ? relax : work;
      const newRecord = {
        ...state.newRecord,
        end: getCurrentMinute(),
      };

      if (isWork && state.newRecord.start > 0) {
        newRecordList.push(newRecord);
        flowService.setRecordList(newRecordList);
      }

      return {
        ...state,
        time: nextAction === work ? state.workTime : state.relaxTime,
        isIntervalRunning: false,
        action: nextAction,
        newRecord: { start: 0, end: 0 },
        recordList:
          isWork && state.newRecord.start > 0
            ? newRecordList
            : state.recordList,
        selected:
          isWork && state.newRecord.start > 0 ? newRecord : state.selected,
      };
    }

    case "START_MANUAL_ADD":
      return {
        ...state,
        isManualAddMode: true,
        manualSelection: { start: 0, end: 0 },
      };

    case "END_MANUAL_ADD":
      return {
        ...state,
        isManualAddMode: false,
        manualSelection: { start: 0, end: 0 },
      };

    case "SET_MANUAL_SELECTION": {
      const { start, end } = action.payload;

      // 如果 end 为 0，表示只选择了开始点，不需要检查冲突
      if (end === 0) {
        return {
          ...state,
          manualSelection: { start, end: 0 },
        };
      }

      // 确保 start <= end
      const sortedStart = Math.min(start, end);
      const sortedEnd = Math.max(start, end);

      // 检查是否与已有记录冲突
      const hasConflict = state.recordList.some((record) => {
        return (
          (sortedStart >= record.start && sortedStart <= record.end) ||
          (sortedEnd >= record.start && sortedEnd <= record.end) ||
          (sortedStart <= record.start && sortedEnd >= record.end)
        );
      });

      if (hasConflict) {
        return state; // 如果有冲突，不更新选择
      }

      return {
        ...state,
        manualSelection: { start: sortedStart, end: sortedEnd },
      };
    }

    case "SAVE_MANUAL_RECORD": {
      if (state.manualSelection.start > 0 && state.manualSelection.end > 0) {
        const newRecord = {
          ...state.manualSelection,
          content: "",
          tags: [],
        };
        const newRecordList = [...state.recordList, newRecord];
        flowService.setRecordList(newRecordList);

        return {
          ...state,
          recordList: newRecordList,
          isManualAddMode: false,
          manualSelection: { start: 0, end: 0 },
          selected: newRecord,
        };
      }
      return state;
    }

    default:
      return state;
  }
};

const defaultSelectedSetting = flowService.getSelectedSetting();

const initState = {
  workTime: defaultSelectedSetting.work,
  relaxTime: defaultSelectedSetting.relax,
  action: work,
  isIntervalRunning: false,
  selected: {},
  time: defaultSelectedSetting.work,
  recordList: flowService.getRecordList(),
  newRecord: { start: 0, end: 0 },
  isManualAddMode: false,
  manualSelection: { start: 0, end: 0 },
};

function App() {
  // Context controller
  const modalClosure = useDisclosure();
  const modalCalandarClosure = useDisclosure();

  // Current State
  const [
    {
      action,
      isIntervalRunning,
      selected,
      time,
      recordList,
      newRecord,
      workTime,
      relaxTime,
      isManualAddMode,
      manualSelection,
    },
    dispatch,
  ] = useReducer(reducer, initState);

  const audioElement = useAudio(mp3url);

  const startCountdown = () => {
    dispatch({ type: "START_COUNTDOWN" });
  };

  const stopCountdown = () => {
    dispatch({ type: "STOP_COUNTDOWN" });
  };

  const triggerResetDialog = () => {
    dispatch({ type: "RESET_COUNTDOWN" });
  };

  useEffect(() => {
    if (isIntervalRunning && time > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: "COUNTDOWN" });
      }, 1000);
      // 沒有加這行會在執行 RESET_COUNTDOWN 後多扣一秒
      return () => clearTimeout(timer);
    }
    if (time === 0) {
      notify("Time's up!");
      audioElement.play();
      stopCountdown();
      action === work && modalClosure.onOpen();
    }
  }, [isIntervalRunning, time, audioElement, action]);

  const handleSetTime = (type, time) => {
    switch (type) {
      case work:
        dispatch({
          type: "SET_COUNTDOWN_TIME",
          payload: { action: work, time },
        });
        break;
      case relax:
        dispatch({
          type: "SET_COUNTDOWN_TIME",
          payload: { action: relax, time },
        });
    }
  };

  const handleClickBox = (values) => {
    dispatch({
      type: "SELECT_CONTENT",
      payload: values,
    });

    modalClosure.onOpen();
  };

  const handleSave = (values) => {
    dispatch({
      type: "HANDLE_SAVE_RECORD",
      payload: { ...selected, ...values },
    });
    modalClosure.onClose();
  };

  const handleClose = () => {
    dispatch({ type: "CLEAR_SELECT_CONTENT" });
    modalClosure.onClose();
  };

  const handleSkipRelax = () => {
    dispatch({ type: "SKIP_RELAX" });
  };

  const handleForceStop = () => {
    if (isIntervalRunning && action === work && newRecord.start > 0) {
      dispatch({ type: "FORCE_STOP_COUNTDOWN" });
      // 使用 setTimeout 确保状态更新后再打开 modal
      setTimeout(() => {
        modalClosure.onOpen();
      }, 0);
    } else if (isIntervalRunning) {
      dispatch({ type: "FORCE_STOP_COUNTDOWN" });
    }
  };

  const handleStartManualAdd = () => {
    dispatch({ type: "START_MANUAL_ADD" });
  };

  const handleEndManualAdd = () => {
    dispatch({ type: "END_MANUAL_ADD" });
  };

  const handleManualSelect = (selection) => {
    dispatch({ type: "SET_MANUAL_SELECTION", payload: selection });
  };

  const handleSaveManualRecord = () => {
    if (manualSelection.start > 0 && manualSelection.end > 0) {
      dispatch({ type: "SAVE_MANUAL_RECORD" });
      setTimeout(() => {
        modalClosure.onOpen();
      }, 0);
    }
  };

  return (
    <ChakraProvider>
      {action === relax && (
        <>
          <div className="meteor-2"></div>
          <div className="meteor-1"></div>
          <div className="meteor-3"></div>
          <div className="meteor-4"></div>
          <div className="meteor-5"></div>
          <div className="meteor-6"></div>
          <div className="meteor-9"></div>
        </>
      )}

      <div className={`moon ${action === relax ? "slide-in" : "slide-out"}`} />
      <Modal
        {...modalClosure}
        handleClose={handleClose}
        handleSave={handleSave}
        selected={selected}
      />
      <CalandarModal {...modalCalandarClosure} />
      <Center>
        <div
          className="App"
          style={{ width: "1100px", height: "100vh", background: "#242627" }}
        >
          {/* <Flex alignItems="end" flexDirection="column"> */}
          <Flex justifyContent="space-between" flexDirection="row">
            <IconButton
              colorScheme="white"
              border="none"
              boxShadow="none"
              onClick={modalCalandarClosure.onOpen}
              icon={<CalendarIcon boxSize={6} />}
              style={{
                outline: "none",
                backgroundColor: "transparent",
              }}
            />
            <Box>
              <Setting
                handleSetTime={handleSetTime}
                isIntervalRunning={isIntervalRunning}
                workTime={workTime}
                relaxTime={relaxTime}
              />
            </Box>
          </Flex>
          <Flex alignItems="center" flexDirection="column">
            <Text
              onClick={handleSkipRelax}
              style={{
                color: "white",
                visibility: action === relax ? "visible" : "hidden",
                cursor: "pointer",
              }}
            >
              跳過休息
            </Text>
            <Text fontWeight="bold" fontSize="7xl" color="white">
              {`${
                Math.floor(time / 60) < 10
                  ? `0${Math.floor(time / 60)}`
                  : `${Math.floor(time / 60)}`
              }:${time % 60 < 10 ? `0${time % 60}` : time % 60}`}
            </Text>
            <Flex gap={4}>
              <IconButton
                // width="7rem"
                onClick={
                  !isIntervalRunning ? startCountdown : triggerResetDialog
                }
                icon={
                  !isIntervalRunning ? (
                    <ChevronRightIcon boxSize="4em" />
                  ) : (
                    <RepeatClockIcon boxSize="2em" />
                  )
                }
                color={!isIntervalRunning ? "#2A7864" : "white"}
                colorScheme="none"
                border="none"
                boxShadow="none"
                style={{
                  outline: "none",
                  backgroundColor: "transparent",
                }}
              />
              {isIntervalRunning && (
                <IconButton
                  onClick={handleForceStop}
                  icon={<CloseIcon boxSize="2em" />}
                  color="red"
                  colorScheme="none"
                  border="none"
                  boxShadow="none"
                  style={{
                    outline: "none",
                    backgroundColor: "transparent",
                  }}
                  title="強制結束並記錄"
                />
              )}
            </Flex>
          </Flex>

          <Flex alignItems="center" flexDirection="column">
            {!isManualAddMode && (
              <Button
                onClick={handleStartManualAdd}
                colorScheme="blue"
                mb={2}
                mt={2}
              >
                Sew
              </Button>
            )}
            {isManualAddMode && (
              <Flex gap={2} mb={4} mt={4}>
                <Button
                  onClick={handleSaveManualRecord}
                  colorScheme="green"
                  isDisabled={
                    manualSelection.start === 0 || manualSelection.end === 0
                  }
                >
                  完成
                </Button>
                <Button onClick={handleEndManualAdd} colorScheme="gray">
                  取消
                </Button>
              </Flex>
            )}
            <Box mt="60px">
              <TimeBox2
                recordList={recordList}
                newRecord={newRecord}
                handleClickBox={handleClickBox}
                action={action}
                isManualAddMode={isManualAddMode}
                manualSelection={manualSelection}
                onManualSelect={handleManualSelect}
              />
            </Box>
          </Flex>
        </div>
      </Center>
    </ChakraProvider>
  );
}

export default () => {
  return <App />;
};
