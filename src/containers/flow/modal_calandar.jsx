import { useState, useEffect, useRef } from "react";
import {
  // Layout
  Flex,
  // Component
  IconButton,
  Heading,
  Box,
  Stack,
  Text,
  Card,
  CardBody,
  StackDivider,
  CloseButton,
  useToast,
  Tag,
  TagLabel,
  // Modal
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
} from "@chakra-ui/react";
import { CopyIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// utils
import { getToday, timeFormat } from "@/utils/time";
import { copyToClipboard } from "@/utils/copyboard";

// service
import flowService from "@/service/flow";

export default function ({ isOpen, onClose }) {
  const [date, setDate] = useState(getToday());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const toast = useToast();
  const todayRecord = flowService.getRecordList(date);

  const handleOutsideClick = (event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setIsCalendarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const onClickDay = (day) => {
    setDate(getToday(day));
    setIsCalendarOpen(false);
  };

  const handleOnClose = () => {
    setDate(getToday());
    onClose();
  };

  const handleCopy = () => {
    let str = "";
    todayRecord.forEach(({ start, end, content, tags }) => {
      const timeRange = `${timeFormat(start)}-${timeFormat(end)}`;
      const tagsStr = tags && tags.length > 0 ? ` [${tags.join(", ")}]` : "";
      str += `${timeRange} ${content || ""}${tagsStr}\n`;
    });

    copyToClipboard(str)
      .then(() => {
        !toast.isActive("copied") &&
          toast({
            id: "copied",
            position: "bottom-right",
            title: "Copied",
            status: "success",
            duration: 900,
          });
      })
      .catch((err) => {
        console.error("error", err);
      });
  };

  return (
    <Modal
      size="full"
      blockScrollOnMount={false}
      isOpen={isOpen}
      onClose={handleOnClose}
    >
      <ModalOverlay />
      <ModalContent>
        <Flex
          basis={{ style: { padding: "20px" } }}
          justifyContent="space-between"
          flexDirection="row"
        >
          <Box padding="4">
            <CloseButton onClick={handleOnClose} size="lg" />
          </Box>
          <Box padding="4">
            <Flex>
              <Heading>
                <IconButton
                  colorScheme="white"
                  // border="none"
                  boxShadow="none"
                  onClick={() => {
                    const newDate = new Date(date);
                    newDate.setDate(newDate.getDate() - 1);
                    setDate(getToday(newDate));
                  }}
                  icon={<ChevronLeftIcon color="#242627" boxSize={6} />}
                />
              </Heading>
              <Heading
                size="xl"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                style={{ cursor: "pointer" }}
              >
                {date}
              </Heading>
              <IconButton
                colorScheme="white"
                // border="none"
                boxShadow="none"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setDate(newDate.getDate() + 1);
                  setDate(getToday(newDate));
                }}
                icon={<ChevronRightIcon color="#242627" boxSize={6} />}
              />
            </Flex>

            {isCalendarOpen && (
              <div
                ref={calendarRef}
                style={{
                  position: "absolute",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    left: "-30px",
                  }}
                >
                  <Calendar onClickDay={onClickDay} />
                </div>
              </div>
            )}
          </Box>
          <Box padding="4">
            <IconButton
              colorScheme="white"
              // border="none"
              boxShadow="none"
              onClick={handleCopy}
              icon={<CopyIcon color="#242627" boxSize={6} />}
            />
          </Box>
        </Flex>
        <ModalBody>
          <Card>
            <CardBody>
              <Stack
                divider={<StackDivider borderColor="gray.300" />}
                spacing="3"
              >
                {todayRecord.map((el) => {
                  const start = timeFormat(el.start);
                  const end = timeFormat(el.end);
                  const timeRange = `${start}-${end}`;
                  return (
                    <Box key={timeRange}>
                      <Heading
                        size="lg"
                        color="#242424"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        {timeRange}
                        <span
                          style={{
                            color: "gray",
                            fontWeight: "300",
                            fontSize: "25px",
                            marginLeft: "10px",
                          }}
                        >
                          ({el.end - el.start}m)
                        </span>
                      </Heading>
                      <Box padding="6">
                        <Text mb={el.content ? 2 : 0}>
                          {el.content || (
                            <Text as="span" color="gray.400">
                              無內容
                            </Text>
                          )}
                        </Text>
                        {el.tags && el.tags.length > 0 && (
                          <Box mt={3}>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              mb={2}
                              fontWeight="medium"
                            >
                              標籤：
                            </Text>
                            <Flex wrap="wrap" gap={2}>
                              {el.tags.map((tag) => (
                                <Tag
                                  key={tag}
                                  size="md"
                                  colorScheme="blue"
                                  variant="solid"
                                >
                                  <TagLabel>{tag}</TagLabel>
                                </Tag>
                              ))}
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </CardBody>
          </Card>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
