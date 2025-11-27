import React, { useState, useEffect } from "react";
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon, CheckIcon } from "@chakra-ui/icons";
import flowService from "@/service/flow";

interface TagSelectProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagSelect({
  selectedTags,
  onTagsChange,
}: TagSelectProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    setAvailableTags(flowService.getTags());
  }, []);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.includes(tag)
  );

  const getButtonText = () => {
    if (selectedTags.length === 0) {
      return "選擇標籤";
    }
    if (selectedTags.length <= 3) {
      return selectedTags.join(", ");
    }
    return `${selectedTags.slice(0, 3).join(", ")}... (+${selectedTags.length - 3})`;
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        width="100%"
        textAlign="left"
      >
        {getButtonText()}
      </MenuButton>
        <MenuList maxH="300px" overflowY="auto">
          {selectedTags.length > 0 && (
            <>
              <Box px={3} py={2}>
                <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                  已選擇的標籤
                </Text>
              </Box>
              {selectedTags.map((tag) => (
                <MenuItem
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  icon={<CheckIcon color="blue.500" />}
                >
                  {tag}
                </MenuItem>
              ))}
              {unselectedTags.length > 0 && <Divider />}
            </>
          )}
          {unselectedTags.length > 0 && (
            <>
              {selectedTags.length > 0 && (
                <Box px={3} py={2}>
                  <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                    可選擇的標籤
                  </Text>
                </Box>
              )}
              {unselectedTags.map((tag) => (
                <MenuItem key={tag} onClick={() => handleToggleTag(tag)}>
                  {tag}
                </MenuItem>
              ))}
            </>
          )}
          {availableTags.length === 0 && (
            <Box px={3} py={2}>
              <Text fontSize="sm" color="gray.500">
                尚無標籤，請在設定中新增
              </Text>
            </Box>
          )}
        </MenuList>
      </Menu>
  );
}
