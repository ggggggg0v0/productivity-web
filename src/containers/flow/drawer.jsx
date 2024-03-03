import {
  Menu,
  MenuButton,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Button,
  Input,
} from "@chakra-ui/react";

import {
  HamburgerIcon,
  SettingsIcon,
  CheckIcon,
  CloseIcon,
  RepeatClockIcon,
} from "@chakra-ui/icons";
import { work, relax } from "./consts";
import { useState } from "react";
import flowService from "@/service/flow";

const SettingField = ({
  setting = [],
  isEdit = false,
  isDisabled = false,
  action,
  field = "",
  handleSetTime,
  handleChange,
  time,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      {setting.map((el, index) => {
        if (isEdit) {
          return (
            <Input
              size="sm"
              value={el / 60}
              style={{
                textAlign: "center",
                width: "100%",
                margin: "10px",
                height: "40px",
                borderRadius: "6px",
                backgroundColor: "rgb(237, 242, 247)",
                fontWeight: "600",
              }}
              onChange={(e) => {
                let nextValue = e.target.value.replace(/\D/g, "");
                if (!isNaN(nextValue) && nextValue <= 120) {
                  if (nextValue === "" || nextValue === "0") {
                    nextValue = 1;
                  }
                  handleChange(field, nextValue * 60, index);
                }
              }}
            />
          );
        }
        return (
          <Button
            onClick={() => {
              handleSetTime(action, el);
            }}
            style={{
              width: "100%",
              margin: "10px",
              backgroundColor: time === el ? "#2a7864" : "",
              color: time === el ? "white" : "",
            }}
            isDisabled={isDisabled}
          >
            {el / 60}m
          </Button>
        );
      })}
    </div>
  );
};

export default function Setting(props) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { isIntervalRunning, handleSetTime, workTime, relaxTime } = props;
  const [isEdit, setIsEdit] = useState(false);
  const [setting, setSetting] = useState(flowService.getSetting());
  const [formSetting, setFormSetting] = useState(flowService.getSetting());

  const switchEdit = () => {
    setIsEdit(!isEdit);
  };
  const onSave = () => {
    flowService.setSetting(formSetting);
    setSetting(formSetting);
    switchEdit();
  };
  const onReset = () => {
    const defaultSetting = flowService.resetSetting();
    setSetting(defaultSetting);
    setFormSetting(defaultSetting);
  };

  const handleChange = (key, val, index) => {
    const nextSetting = { ...formSetting };
    nextSetting[key][index] = Number(val);
    setFormSetting(nextSetting);
  };

  const workTimeSetting = isEdit ? formSetting.workTime : setting.workTime;
  const relaxTimeSetting = isEdit ? formSetting.relaxTime : setting.relaxTime;

  return (
    <>
      <IconButton
        colorScheme="white"
        border="none"
        boxShadow="none"
        onClick={onOpen}
        icon={<HamburgerIcon boxSize={6} />}
        style={{
          outline: "none",
          backgroundColor: "transparent",
        }}
      />

      <Drawer
        colorScheme="#242627"
        placement={"right"}
        onClose={onClose}
        isOpen={isOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          {/* <DrawerHeader borderBottomWidth="1px">Basic Drawer</DrawerHeader> */}
          <DrawerBody>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p>Work {isEdit ? "(0 to 120)" : ""}</p>
              {isEdit ? (
                <div style={{ alignItems: "center" }}>
                  <CloseIcon
                    style={{
                      cursor: "pointer",
                      marginRight: "10px",
                      fontSize: "11px",
                    }}
                    onClick={switchEdit}
                    color="black.100"
                  />
                  <CheckIcon
                    style={{ cursor: "pointer" }}
                    onClick={onSave}
                    color="green.400"
                  />
                </div>
              ) : (
                <div>
                  <RepeatClockIcon
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={onReset}
                  />
                  <SettingsIcon
                    style={{ cursor: "pointer" }}
                    onClick={switchEdit}
                  />
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <SettingField
                setting={workTimeSetting}
                action={work}
                field="workTime"
                handleChange={handleChange}
                onToggle={onToggle}
                handleSetTime={handleSetTime}
                isDisabled={isIntervalRunning}
                isEdit={isEdit}
                time={workTime}
              />
            </div>

            <p>Relax</p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <SettingField
                setting={relaxTimeSetting}
                action={relax}
                field="relaxTime"
                handleChange={handleChange}
                onToggle={onToggle}
                handleSetTime={handleSetTime}
                isDisabled={isIntervalRunning}
                isEdit={isEdit}
                time={relaxTime}
              />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
