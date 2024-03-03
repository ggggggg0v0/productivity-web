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
  onToggle,
  handleChange,
  time,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {setting.map((el, index) => {
        if (isEdit) {
          return (
            <Input
              size="sm"
              value={el}
              style={{
                width: "58px",
                margin: "10px",
                height: "38px",
                borderRadius: "6px",
                alignItems: "center",
              }}
              onChange={(el) => {
                handleChange(field, el.target.value, index);
              }}
            />
          );
        }
        return (
          <Button
            onClick={() => {
              onToggle();
              handleSetTime(action, el);
            }}
            style={{
              margin: "10px",
              backgroundColor: time === el ? "#2a7864" : "",
              color: time === el ? "white" : "",
            }}
            isDisabled={isDisabled}
          >
            {el}m
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
  console.log("workTime, relaxTime ", workTime, relaxTime);
  const onSave = () => {
    flowService.setSetting(formSetting);
    setSetting(formSetting);
    switchEdit();
  };
  const onReset = () => {
    const defaultSetting = flowService.resetSetting();
    console.log("defaultSetting", defaultSetting);
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
              <p>Work</p>
              {isEdit ? (
                <div>
                  <IconButton
                    aria-label="cancel"
                    backgroundColor="white"
                    border="none"
                    boxShadow="none"
                    onClick={switchEdit}
                    fontSize="10px"
                    icon={<CloseIcon color="gray.400" />}
                    style={{
                      marginRight: "5px",
                      outline: "none",
                      backgroundColor: "transparent",
                    }}
                  />
                  <IconButton
                    aria-label="save"
                    backgroundColor="white"
                    border="none"
                    boxShadow="none"
                    onClick={onSave}
                    fontSize="12px"
                    icon={<CheckIcon color="green.400" />}
                    style={{
                      outline: "none",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>
              ) : (
                <div>
                  <IconButton
                    aria-label="reset"
                    backgroundColor="white"
                    border="none"
                    boxShadow="none"
                    onClick={onReset}
                    icon={<RepeatClockIcon />}
                    style={{
                      outline: "none",
                      backgroundColor: "transparent",
                    }}
                  />
                  <IconButton
                    aria-label="edit"
                    backgroundColor="white"
                    border="none"
                    boxShadow="none"
                    onClick={switchEdit}
                    icon={<SettingsIcon />}
                    style={{
                      outline: "none",
                      backgroundColor: "transparent",
                    }}
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
