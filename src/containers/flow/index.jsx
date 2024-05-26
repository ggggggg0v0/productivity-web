// src/App.tsx
import {
  IconButton,
  Flex,
  Text,
  Box,
  ChakraProvider,
  useDisclosure,
  Center,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { useEffect, useReducer, useState } from "react";
import { notify } from "@/utils/notification";
// import { appWindow } from "@tauri-apps/api/window";

import { ChevronRightIcon, RepeatClockIcon } from "@chakra-ui/icons";
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
            <Flex>
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
            </Flex>
          </Flex>

          <Flex alignItems="center" flexDirection="column">
            <Box mt="60px">
              <TimeBox2
                recordList={recordList}
                newRecord={newRecord}
                handleClickBox={handleClickBox}
                action={action}
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
