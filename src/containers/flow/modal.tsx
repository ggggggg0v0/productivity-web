import React, { useState, useEffect } from "react";
import { Field, Form, Formik } from "formik";

import {
  // Layout
  Flex,
  Box,
  // Form
  Button,
  // Modal
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Textarea,
  ModalFooter,
  // Form
  FormControl,
  FormLabel,
  VStack,
} from "@chakra-ui/react";

import { timeFormat } from "@/utils/time";
import TagSelect from "./tag_select";

export interface FormValue {
  content: string;
  tags?: string[];
}

export default function ({ isOpen, handleClose, handleSave, selected }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    setInputValue(selected.content || "");
    setSelectedTags(selected.tags || []);
  }, [selected]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  function handleSubmit(formValue: FormValue, actions) {
    handleSave({ content: inputValue, tags: selectedTags });
    actions.setSubmitting(false);
  }

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
    >
      <ModalOverlay />
      <Formik
        initialValues={{ content: selected?.content }}
        onSubmit={handleSubmit}
      >
        {(props) => (
          <Form>
            <ModalContent>
              <ModalHeader>
                Edit{" "}
                {`${timeFormat(selected.start)}-${timeFormat(selected.end)}`}
              </ModalHeader>
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>標籤</FormLabel>
                    <TagSelect
                      selectedTags={selectedTags}
                      onTagsChange={setSelectedTags}
                    />
                  </FormControl>
                  <Field name="content">
                    {({ field, form }) => (
                      <FormControl>
                        <FormLabel>Content</FormLabel>
                        <Textarea
                          {...field}
                          placeholder="Please enter content"
                          value={inputValue}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    )}
                  </Field>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button mr={3} onClick={handleClose} variant="ghost">
                  Close
                </Button>
                <Button
                  mr={3}
                  type="submit"
                  isLoading={props.isSubmitting}
                  colorScheme="blue"
                >
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
