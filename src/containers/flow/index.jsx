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

import { work, relax, initWorkTime, initRelaxTime } from "./consts";

// utils
import { getCurrentMinute } from "@/utils/time";
import { useAudio } from "@/utils/audio";

// styles
import "./moon.scss";
import "./meteor.scss";

const reducer = (state, action) => {
  let newTask = [...state.record];

  switch (action.type) {
    case "START_COUNTDOWN":
      return {
        ...state,
        isIntervalRunning: true,
        newTaskTime: { ...state.newTaskTime, start: getCurrentMinute() },
      };

    case "STOP_COUNTDOWN":
      const isWork = state.action === work;
      const nextAction = isWork ? relax : work;

      if (isWork) {
        newTask.push({
          ...state.newTaskTime,
          end: getCurrentMinute(),
        });
        isWork && flowService.setRecordList(newTask);
      }

      return {
        ...state,
        time: nextAction === work ? state.workTime : state.relaxTime,
        isIntervalRunning: nextAction === relax,
        action: nextAction,
        newTaskTime: { start: 0, end: 0 },
        record: isWork ? newTask : state.record,
      };
    case "COUNTDOWN":
      return { ...state, time: state.time - 1 };

    case "RESET_COUNTDOWN":
      return {
        ...state,
        time: state.action === work ? state.workTime : state.relaxTime,
        isIntervalRunning: false,
        newTaskTime: { start: 0, end: 0 },
      };

    case "SELECT_CONTENT":
      return {
        ...state,
        selected: {
          ...state.selected,
          ...action.payload,
        },
      };

    case "CLEAR_SELECT_CONTENT":
      return {
        ...state,
        selected: { recordIndex: "", record: "" },
      };

    case "SET_COUNTDOWN_TIME":
      const time = action.payload.second;
      return {
        ...state,
        time,
        [`${action.payload.action}Time`]: time,
      };

    case "HANDLE_SAVE_RECORD":
      newTask[action.payload.recordIndex] = {
        ...action.payload.record,
        content: action.payload.content,
      };
      flowService.setRecordList(newTask);

      return {
        ...state,
        record: newTask,
      };

    default:
      return state;
  }
};

const initState = {
  workTime: initWorkTime,
  relaxTime: initRelaxTime,
  action: work,
  isIntervalRunning: false,
  selected: {},
  time: initWorkTime,
  record: flowService.getRecordList(),
  newTaskTime: { start: 0, end: 0 },
};

function App() {
  // Context controller
  const modalClosure = useDisclosure();
  const modalCalandarClosure = useDisclosure();

  // Current State
  const [
    { action, isIntervalRunning, selected, time, record, newTaskTime },
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
    }
  }, [isIntervalRunning, time, audioElement]);

  const handleSetTime = (type, second) => {
    switch (type) {
      case work:
        dispatch({
          type: "SET_COUNTDOWN_TIME",
          payload: { action: work, second },
        });
        break;
      case relax:
        dispatch({
          type: "SET_COUNTDOWN_TIME",
          payload: { action: relax, second },
        });
    }
  };

  const handleClickBox = (values) => {
    dispatch({
      type: "SELECT_CONTENT",
      payload: {
        recordIndex: values.activeIndex,
        record: record[values.activeIndex],
      },
    });

    modalClosure.onOpen();
  };

  const handleSave = (values) => {
    dispatch({
      type: "HANDLE_SAVE_RECORD",
      payload: { ...values, ...selected },
    });
    modalClosure.onClose();
  };

  const handleClose = () => {
    dispatch({ type: "CLEAR_SELECT_CONTENT" });
    modalClosure.onClose();
  };

  return (
    <ChakraProvider>
      {action === relax && (
        <>
          <div class="meteor-2"></div>
          <div class="meteor-1"></div>
          <div class="meteor-3"></div>
          <div class="meteor-4"></div>
          <div class="meteor-5"></div>
          <div class="meteor-6"></div>
          <div class="meteor-9"></div>
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
            />
            <Box>
              <Setting
                handleSetTime={handleSetTime}
                isIntervalRunning={isIntervalRunning}
              />
            </Box>
          </Flex>
          <Flex alignItems="center" flexDirection="column">
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
              />
            </Flex>
          </Flex>

          <Flex alignItems="center" flexDirection="column">
            <Box mt="60px">
              <TimeBox2
                record={record}
                handleClickBox={handleClickBox}
                currentTime={newTaskTime}
                action={action}
              />
            </Box>
          </Flex>
        </div>
      </Center>
    </ChakraProvider>
  );
}

export default App;
