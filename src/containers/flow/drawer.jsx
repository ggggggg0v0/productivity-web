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
} from "@chakra-ui/react";

import { HamburgerIcon } from "@chakra-ui/icons";
import { work, relax } from "./consts";

export default function Setting(props) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { isIntervalRunning, handleSetTime } = props;

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          colorScheme="white"
          border="none"
          boxShadow="none"
        />
      </Menu>
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
            <p>Work</p>
            {[5, 10, 15].map((el) => {
              return (
                <Button
                  key={el}
                  onClick={() => {
                    onToggle();
                    handleSetTime(work, el * 60);
                  }}
                  style={{ margin: "10px" }}
                  disabled={isIntervalRunning}
                >
                  {el}m
                </Button>
              );
            })}
            <p>Relax</p>
            {[5, 10, 15].map((el) => {
              return (
                <Button
                  key={el}
                  onClick={() => {
                    onToggle();
                    handleSetTime(relax, el * 60);
                  }}
                  style={{ margin: "10px" }}
                  disabled={isIntervalRunning}
                >
                  {el}m
                </Button>
              );
            })}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
