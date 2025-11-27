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
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  VStack,
  Box,
  Text,
} from "@chakra-ui/react";

import {
  HamburgerIcon,
  SettingsIcon,
  CheckIcon,
  CloseIcon,
  RepeatClockIcon,
} from "@chakra-ui/icons";
import { work, relax } from "./consts";
import { useState, useEffect } from "react";
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
              flowService.setSelectedTime(action, el);
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
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");

  useEffect(() => {
    setTags(flowService.getTags());
  }, [isOpen]);

  const handleAddTag = () => {
    if (newTagInput.trim() !== "") {
      flowService.addTag(newTagInput.trim());
      setTags(flowService.getTags());
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    flowService.removeTag(tag);
    setTags(flowService.getTags());
  };

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

            <div
              style={{
                marginTop: "30px",
                paddingTop: "20px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <p style={{ marginBottom: "15px", fontWeight: "600" }}>
                標籤管理
              </p>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Input
                    size="sm"
                    placeholder="輸入新標籤名稱"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button size="sm" onClick={handleAddTag} colorScheme="blue">
                    新增
                  </Button>
                </HStack>
                <Box
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                  maxH="200px"
                  overflowY="auto"
                  bg="gray.50"
                >
                  {tags.length > 0 ? (
                    <VStack align="stretch" spacing={2}>
                      {tags.map((tag) => (
                        <Flex
                          key={tag}
                          justify="space-between"
                          align="center"
                          p={2}
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <Tag size="md" colorScheme="blue">
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            刪除
                          </Button>
                        </Flex>
                      ))}
                    </VStack>
                  ) : (
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      textAlign="center"
                      py={4}
                    >
                      尚無標籤
                    </Text>
                  )}
                </Box>
              </VStack>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
