// src/App.tsx
import {
  IconButton,
  Flex,
  Text,
  Box,
  ChakraProvider,
  useDisclosure,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";

import { useEffect, useState, useRef, useCallback } from "react";
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

function useAudio() {
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    const audio = new Audio(mp3url);
    audio.onended = () => {
      audio.currentTime = 0;
      // setAudioElement(null);
    };
    setAudioElement(audio);
  }, []);

  return audioElement;
}

function useStateAndRef(initial) {
  const [value, setValue] = useState(initial);
  const valueRef = useRef(value);
  valueRef.current = value;
  return [value, setValue, valueRef];
}

function useRecord() {
  const recordCached = flowService.getRecordList();
  const [record, setRecord] = useState(recordCached);
  const [time, setTime] = useState({ start: 0, end: 0 });

  const start = useCallback(() => {
    setTime({ ...time, start: getCurrentMinute() });
  }, [time]);

  const end = useCallback(() => {
    setTime({});
    const newRecord = { ...time, end: getCurrentMinute() };
    record.push(newRecord);
    setRecord(record);

    flowService.setRecordList(record);
  }, [time, record]);

  return [record, start, end, setRecord, time];
}

function App() {
  // Context controller
  const modalClosure = useDisclosure();
  const modalCalandarClosure = useDisclosure();

  // Current State
  const initWorkTime = 90; // second
  const initRelaxTime = 90; // second
  const [workTime, setWorkTime] = useState(0);
  const [relaxTime, setRelaxTime] = useState(0);
  const audioElement = useAudio();
  const [record, start, end, setRecord, currentTime] = useRecord();

  const [action, setAction] = useState(work);
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [time, setTime, refTime] = useStateAndRef(initWorkTime);
  const [selected, setSelected] = useState({});

  const toggleTimer = () => {
    startCountdown();
    // invoke('my_custom_command',{ invokeMessage: 'asdfsdf!' }).then((message) => console.log("heyhet", message))
  };

  const triggerResetDialog = () => {
    stopCountdown();
    setTime(
      action === work ? workTime || initWorkTime : relaxTime || initRelaxTime
    );
  };

  const startCountdown = () => {
    action === work && start();
    setIsIntervalRunning(true);
  };

  const stopCountdown = () => {
    setIsIntervalRunning(false);
  };

  useEffect(() => {
    let interval;
    // console.log("isIntervalRunning", action, isIntervalRunning);
    if (isIntervalRunning) {
      interval = setInterval(() => {
        // console.log("current", action, refTime.current);
        if (refTime.current > 0) {
          setTime((time) => time - 1);
        } else if (refTime.current === 0) {
          // desktop notification
          notify("Time's up!");

          stopCountdown();
          clearInterval(interval);
          audioElement.play();
          // appWindow.setFullscreen(true);

          // 如果是工作階段的話的倒數結束就直接開始「休息」
          if (action === work) {
            end();

            setTimeout(() => {
              setTime(relaxTime || initRelaxTime);
              setAction(relax);
              startCountdown();
              return;
            }, 1000);
            return;
          }

          setTime(workTime || initWorkTime);
          setAction(() => work);
          // appWindow.setFullscreen(false);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [
    isIntervalRunning,
    audioElement,
    refTime,
    setTime,
    action,
    workTime,
    relaxTime,
  ]);

  const handleSetTime = (type, second) => {
    switch (type) {
      case work:
        setWorkTime(second);
        setTime(second);
        break;
      case relax:
        setRelaxTime(second);
        setTime(second);
    }
  };

  const handleClickBox = (values) => {
    setSelected({
      ...selected,
      recordIndex: values.activeIndex,
      record: record[values.activeIndex],
    });
    modalClosure.onOpen();
  };

  const handleSave = (values) => {
    flowService.handleSave({ ...values, ...selected }, setRecord);
    modalClosure.onClose();
  };

  const handleClose = () => {
    setSelected({});
    modalClosure.onClose();
  };

  return (
    <ChakraProvider>
      <Modal
        {...modalClosure}
        handleClose={handleClose}
        handleSave={handleSave}
        selected={selected}
      />
      <CalandarModal {...modalCalandarClosure} />

      <div className="App" style={{ height: "85vh", background: "#242627" }}>
        {/* <Flex alignItems="end" flexDirection="column"> */}
        <Flex justifyContent="space-between" flexDirection="row">
          <IconButton
            colorScheme="white"
            border="none"
            boxShadow="none"
            onClick={() => {
              modalCalandarClosure.onOpen();
            }}
            icon={<CalendarIcon />}
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
              onClick={!isIntervalRunning ? toggleTimer : triggerResetDialog}
              icon={
                !isIntervalRunning ? (
                  <ChevronRightIcon boxSize={10} />
                ) : (
                  <RepeatClockIcon boxSize={6} />
                )
              }
              color={!isIntervalRunning ? "#2A7864" : "white"}
              colorScheme="none"
              border="none"
              boxShadow="none"
            />
          </Flex>
          {/* <TimeBox /> */}
        </Flex>

        <Flex alignItems="center" flexDirection="column">
          <Box mt="60px">
            <TimeBox2
              record={record}
              handleClickBox={handleClickBox}
              currentTime={currentTime}
              action={action}
            />
          </Box>
        </Flex>
      </div>
    </ChakraProvider>
  );
}

export default App;
